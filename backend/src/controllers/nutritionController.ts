import { Request, Response } from 'express';
import mongoose from 'mongoose';
import MealLog from '../models/MealLog';
import PantryItem from '../models/PantryItem';

// Helper to get start of day
const getStartOfDay = (dateString?: string) => {
  const date = dateString ? new Date(dateString) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getDailyLog = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const dateQuery = req.query.date as string;
    const date = getStartOfDay(dateQuery);

    let log = await MealLog.findOne({ userId, date });

    if (!log) {
      log = new MealLog({
        userId,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
        waterIntake: 0
      });
      await log.save();
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching daily log:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addMealEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { mealType, entry, date: dateString } = req.body;

    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      res.status(400).json({ error: 'Invalid meal type' });
      return;
    }

    if (!entry || !entry.name || entry.calories === undefined) {
      res.status(400).json({ error: 'Invalid entry data' });
      return;
    }

    const date = getStartOfDay(dateString);
    let log = await MealLog.findOne({ userId, date });

    if (!log) {
      log = new MealLog({
        userId,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
        waterIntake: 0
      });
    }

    // @ts-ignore
    log.meals[mealType].push(entry);
    await log.save();

    res.json(log);
  } catch (error) {
    console.error('Error adding meal entry:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addWater = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { amount, date: dateString } = req.body;

    if (!amount || typeof amount !== 'number') {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const date = getStartOfDay(dateString);
    let log = await MealLog.findOne({ userId, date });

    if (!log) {
      log = new MealLog({
        userId,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
        waterIntake: amount
      });
    } else {
      log.waterIntake += amount;
    }

    await log.save();

    res.json(log);
  } catch (error) {
    console.error('Error adding water:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * KITCHEN IQ LOOP: Atomic transaction that logs a meal AND deducts pantry ingredients simultaneously.
 * This is the core differentiating feature: ensures data consistency between meal logging and ingredient inventory.
 * On confirmation of "I Cooked This", both operations succeed or both rollback.
 */
export const logMealAndDeductPantry = async (req: Request, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?._id;
    const { mealType, entry, ingredients, date: dateString } = req.body;

    // Validate inputs
    if (!['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)) {
      res.status(400).json({ error: 'Invalid meal type' });
      return;
    }

    if (!entry || !entry.name || entry.calories === undefined) {
      res.status(400).json({ error: 'Invalid meal entry data' });
      return;
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      res.status(400).json({ error: 'Ingredients array required' });
      return;
    }

    const date = getStartOfDay(dateString);

    // Step 1: Get or create MealLog and add meal entry (within transaction)
    let log = await MealLog.findOne({ userId, date }).session(session);

    if (!log) {
      log = new MealLog({
        userId,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
        waterIntake: 0
      });
    }

    // @ts-ignore
    log.meals[mealType].push(entry);
    await log.save({ session });

    // Step 2: Deduct ingredients from pantry (within transaction)
    for (const ingredient of ingredients) {
      const { pantryItemId, quantityToDeduct } = ingredient;

      if (!pantryItemId || !quantityToDeduct) {
        throw new Error('Invalid ingredient data: pantryItemId and quantityToDeduct required');
      }

      const pantryItem = await PantryItem.findOne({
        _id: pantryItemId,
        userId
      }).session(session);

      if (!pantryItem) {
        throw new Error(`Pantry item ${pantryItemId} not found`);
      }

      if (pantryItem.quantity < quantityToDeduct) {
        throw new Error(`Insufficient quantity of ${pantryItem.name}. Have: ${pantryItem.quantity}, Need: ${quantityToDeduct}`);
      }

      // Deduct the quantity
      pantryItem.quantity -= quantityToDeduct;

      // Remove from pantry if quantity reaches 0
      if (pantryItem.quantity <= 0) {
        await PantryItem.deleteOne({ _id: pantryItemId }).session(session);
      } else {
        await pantryItem.save({ session });
      }
    }

    // Commit transaction if all operations succeed
    await session.commitTransaction();
    session.endSession();

    // Return updated meal log
    res.status(201).json({
      success: true,
      message: 'Meal logged and pantry updated successfully',
      mealLog: log
    });
  } catch (error: any) {
    // Rollback transaction on any error
    await session.abortTransaction();
    session.endSession();

    console.error('Error in logMealAndDeductPantry:', error);
    res.status(400).json({
      error: error.message || 'Failed to log meal and deduct ingredients. Transaction rolled back.'
    });
  }
};
