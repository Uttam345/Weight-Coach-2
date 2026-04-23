import { Request, Response } from 'express';
import User from '../models/User';
import { z } from 'zod';

const updateProfileSchema = z.object({
    name: z.string().optional(),
    height: z.number().positive().optional(),
    weight: z.number().positive().optional(),
    dailyCalorieGoal: z.number().positive().optional(),
    dietaryPreference: z.string().optional(),
    cuisinePreference: z.string().optional()
});

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ message: 'Server error fetching profile.' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = updateProfileSchema.parse(req.body);
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: data },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Server error updating profile.' });
    }
};
