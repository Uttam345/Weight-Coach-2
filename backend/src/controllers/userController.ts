import { Request, Response } from 'express';
import User from '../models/User';
import { z } from 'zod';
import { generateNutritionPlan, BiometricProfile } from '../utils/tdeeCalculator';

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

/**
 * Calculate TDEE and generate personalized nutrition plan
 * Automatically computes daily calorie goal based on biometrics, age, gender, activity level
 * Optionally updates user's dailyCalorieGoal in database
 */
export const calculateTDEE = async (req: Request, res: Response): Promise<void> => {
    try {
        const { age, gender, activityLevel = 'moderate', fitnessGoal = 'maintenance', updateUser = false } = req.body;

        // Validate required inputs
        if (!age || !gender || !['male', 'female'].includes(gender)) {
            res.status(400).json({ message: 'Age and gender (male/female) are required.' });
            return;
        }

        // Get user biometrics
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (!user.weight || !user.height) {
            res.status(400).json({ message: 'User must have weight (kg) and height (cm) in profile.' });
            return;
        }

        // Build biometric profile
        const profile: BiometricProfile = {
            weight: user.weight,
            height: user.height,
            age,
            gender,
            activityLevel: activityLevel as any,
        };

        // Generate nutrition plan
        const plan = generateNutritionPlan(profile, fitnessGoal as any);

        // Optionally update user's daily calorie goal
        if (updateUser) {
            user.dailyCalorieGoal = plan.caloricGoal;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'TDEE calculated successfully',
            plan,
            userUpdated: updateUser,
        });
    } catch (error: any) {
        console.error('calculateTDEE error:', error);
        res.status(500).json({ message: 'Server error calculating TDEE.' });
    }
};
