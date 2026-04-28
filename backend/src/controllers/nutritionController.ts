import { Request, Response } from 'express';
import MealLog from '../models/MealLog';

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
