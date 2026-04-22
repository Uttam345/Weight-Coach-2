import { create } from 'zustand';

export type MetricType = 'weight' | 'systolic' | 'diastolic' | 'heartRate' | 'sleepHours' | 'sleepQuality' | 'steps';

export interface HealthMetric {
    _id: string;
    userId: string;
    metricType: MetricType;
    value: number;
    unit: string;
    recordedAt: string;
}

interface HealthState {
    latest: Partial<Record<MetricType, HealthMetric>>;
    history: HealthMetric[];
    streak: number;
    isLoading: boolean;
    isLogging: boolean;
    error: string | null;
    fetchLatest: () => Promise<void>;
    fetchHistory: (metricType: MetricType, days?: number) => Promise<void>;
    fetchStreak: () => Promise<void>;
    logMetric: (metricType: MetricType, value: number, unit: string) => Promise<void>;
}

const getAuthToken = () => localStorage.getItem('token');
const BASE_URL = 'http://localhost:5000/api/health';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
});

export const useHealthStore = create<HealthState>((set) => ({
    latest: {},
    history: [],
    streak: 0,
    isLoading: false,
    isLogging: false,
    error: null,

    fetchLatest: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${BASE_URL}/latest`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch metrics');
            const data = await res.json();
            set({ latest: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchHistory: async (metricType, days = 30) => {
        try {
            const res = await fetch(`${BASE_URL}/history?metricType=${metricType}&days=${days}`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch history');
            const data = await res.json();
            set({ history: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    fetchStreak: async () => {
        try {
            const res = await fetch(`${BASE_URL}/streak`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch streak');
            const data = await res.json();
            set({ streak: data.streak });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    logMetric: async (metricType, value, unit) => {
        set({ isLogging: true });
        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ metricType, value, unit }),
            });
            if (!res.ok) throw new Error('Failed to log metric');
            const newMetric: HealthMetric = await res.json();
            set((state) => ({
                latest: { ...state.latest, [metricType]: newMetric },
                isLogging: false,
            }));
        } catch (error: any) {
            set({ error: error.message, isLogging: false });
        }
    },
}));
