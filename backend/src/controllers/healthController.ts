import { Request, Response } from 'express';
import HealthMetric from '../models/HealthMetric';
import { z } from 'zod';

const metricTypes = ['weight', 'systolic', 'diastolic', 'heartRate', 'sleepHours', 'sleepQuality', 'steps'] as const;

const logMetricSchema = z.object({
    metricType: z.enum(metricTypes),
    value: z.number().positive('Value must be positive'),
    unit: z.string().min(1),
    recordedAt: z.string().optional(), // ISO date string
});

// POST /api/health — Log a new reading
export const logMetric = async (req: Request, res: Response): Promise<any> => {
    try {
        const data = logMetricSchema.parse(req.body);
        const metric = await HealthMetric.create({
            userId: req.user._id,
            ...data,
            recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
        });
        res.status(201).json(metric);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: (error as any).errors[0].message });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/health/latest — Get the most recent reading of each metric type
export const getLatestMetrics = async (req: Request, res: Response): Promise<any> => {
    try {
        const results: Record<string, any> = {};

        for (const type of metricTypes) {
            const metric = await HealthMetric.findOne({
                userId: req.user._id,
                metricType: type,
            }).sort({ recordedAt: -1 });

            if (metric) results[type] = metric;
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/health/history?metricType=weight&days=30 — Get trend data
export const getMetricHistory = async (req: Request, res: Response): Promise<any> => {
    try {
        const metricType = req.query.metricType as string;
        const days = parseInt(req.query.days as string) || 30;

        if (!metricTypes.includes(metricType as any)) {
            return res.status(400).json({ message: 'Invalid metric type' });
        }

        const since = new Date();
        since.setDate(since.getDate() - days);

        const history = await HealthMetric.find({
            userId: req.user._id,
            metricType,
            recordedAt: { $gte: since },
        }).sort({ recordedAt: 1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/health/streak — Count consecutive days with at least one log
export const getStreak = async (req: Request, res: Response): Promise<any> => {
    try {
        // Fetch all unique dates with at least one log, sorted descending
        const metrics = await HealthMetric.find({ userId: req.user._id })
            .sort({ recordedAt: -1 })
            .select('recordedAt');

        const uniqueDates = [...new Set(
            metrics.map(m => new Date(m.recordedAt).toISOString().split('T')[0])
        )].sort((a, b) => b.localeCompare(a));

        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        
        let expectedDate = new Date();
        // If they didn't log today, but logged yesterday, expected should start from yesterday
        if (uniqueDates.length > 0 && uniqueDates[0] !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (uniqueDates[0] === yesterdayStr) {
                expectedDate = yesterday;
            } else {
                // They didn't log today or yesterday, streak is broken
                return res.json({ streak: 0 });
            }
        }

        let expected = expectedDate.toISOString().split('T')[0];

        for (const date of uniqueDates) {
            if (date === expected) {
                streak++;
                const d = new Date(expected);
                d.setDate(d.getDate() - 1);
                expected = d.toISOString().split('T')[0];
            } else {
                break;
            }
        }

        res.json({ streak });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
