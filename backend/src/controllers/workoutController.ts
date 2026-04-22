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

const createWorkoutSchema = z.object({
    name: z.string().min(1),
    date: z.string().optional(),
    exercises: z.array(z.object({
        name: z.string(),
        sets: z.number(),
        reps: z.string(),
        weight: z.number().optional(),
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

const toggleExerciseSchema = z.object({
    exerciseIndex: z.number(),
    done: z.boolean(),
    weight: z.number().optional(),
});

// PUT /api/workouts/:id/exercise — Toggle an exercise done state or update weight
export const updateExercise = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = toggleExerciseSchema.parse(req.body);
        const workout = await Workout.findOne({ _id: req.params.id, userId: req.user._id });
        if (!workout) return res.status(404).json({ message: 'Workout not found' });

        const exercise = workout.exercises[data.exerciseIndex];
        if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

        exercise.done = data.done;
        if (data.weight !== undefined) exercise.weight = data.weight;

        // Mark workout complete if all exercises are done
        workout.isCompleted = workout.exercises.every(e => e.done);
        await workout.save();

        res.json(workout);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        res.status(500).json({ message: 'Server error' });
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
