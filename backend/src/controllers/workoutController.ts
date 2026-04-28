import { Request, Response } from 'express';
import Workout from '../models/Workout';
import { z } from 'zod';

const getTodayDate = () => new Date().toISOString().split('T')[0];

// GET /api/workouts/today — Get or initialize today's workout
export const getTodayWorkout = async (req: Request, res: Response): Promise<any> => {
    const date = (req.query.date as string) || getTodayDate();
    try {
        let workout = await Workout.findOne({ userId: req.user._id, date });
        if (!workout) {
            // Return null rather than auto-creating — let client choose to start a session
            return res.json(null);
        }
        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/workouts/history — Get last 10 completed sessions
export const getWorkoutHistory = async (req: Request, res: Response): Promise<any> => {
    try {
        const workouts = await Workout.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(10);
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const setSchemaZod = z.object({
    reps: z.number().min(0),
    weight: z.number().min(0),
    isCompleted: z.boolean().default(false),
    type: z.enum(['normal', 'warmup', 'drop', 'failure']).default('normal')
});

const createWorkoutSchema = z.object({
    name: z.string().min(1),
    date: z.string().optional(),
    exercises: z.array(z.object({
        name: z.string(),
        sets: z.array(setSchemaZod),
    })).optional(),
});

// POST /api/workouts — Create a new workout session
export const createWorkout = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = createWorkoutSchema.parse(req.body);
        const date = data.date || getTodayDate();

        // Replace any existing workout for this date
        await Workout.deleteOne({ userId: req.user._id, date });

        const workout = await Workout.create({
            userId: req.user._id,
            date,
            name: data.name,
            exercises: data.exercises || [],
        });
        res.status(201).json(workout);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

const syncWorkoutSchema = z.object({
    exercises: z.array(z.object({
        name: z.string(),
        sets: z.array(setSchemaZod),
    })),
});

// PUT /api/workouts/:id/sync — Sync the entire exercises array
export const syncWorkout = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = syncWorkoutSchema.parse(req.body);
        const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
        if (!workout) return res.status(404).json({ message: 'Workout not found' });

        workout.exercises = data.exercises as any;

        // Mark workout complete if all exercises have at least one set and all sets are done
        // Or we just let completeWorkout handle the isCompleted flag.
        // For now, let's keep isCompleted independent or just check if anything is done.
        
        await workout.save();

        res.json(workout);
    } catch (error: any) {
        console.error("Sync Workout Error:", error);
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// PUT /api/workouts/:id/complete — Mark a workout as completed with duration
export const completeWorkout = async (req: Request, res: Response): Promise<any> => {
    try {
        const { durationMinutes } = req.body;
        const workout = await Workout.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isCompleted: true, durationMinutes: durationMinutes || 0 },
            { new: true }
        );
        if (!workout) return res.status(404).json({ message: 'Workout not found' });
        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
