import { Request, Response } from 'express';
import PantryItem from '../models/PantryItem';
import { z } from 'zod';

const pantryItemSchema = z.object({
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().positive('Quantity must be positive'),
    unit: z.string().default('item'),
    category: z.enum(['protein', 'carbs', 'fats', 'dairy', 'vegetables', 'fruits', 'supplements', 'other']).default('other'),
});

// GET /api/pantry
export const getPantry = async (req: Request, res: Response): Promise<any> => {
    try {
        const items = await PantryItem.find({ userId: req.user._id }).sort({ category: 1, name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/pantry
export const addPantryItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = pantryItemSchema.parse(req.body);
        const item = await PantryItem.create({ userId: req.user._id, ...data });
        res.status(201).json(item);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/pantry/:id
export const updatePantryItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = pantryItemSchema.partial().parse(req.body);
        const item = await PantryItem.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            data,
            { new: true }
        );
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/pantry/:id
export const deletePantryItem = async (req: Request, res: Response): Promise<any> => {
    try {
        const item = await PantryItem.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
