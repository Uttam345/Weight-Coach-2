import { create } from 'zustand';
import { API_URL } from '../services/api';

export interface Exercise {
    _id?: string;
    name: string;
    sets: number;
    reps: string;
    weight: number;
    done: boolean;
}

export interface WorkoutSession {
    _id: string;
    userId: string;
    date: string;
    name: string;
    exercises: Exercise[];
    durationMinutes: number;
    isCompleted: boolean;
}

interface WorkoutState {
    todayWorkout: WorkoutSession | null;
    history: WorkoutSession[];
    isLoading: boolean;
    error: string | null;
    fetchTodayWorkout: () => Promise<void>;
    fetchHistory: () => Promise<void>;
    createWorkout: (name: string, exercises: Omit<Exercise, 'done'>[]) => Promise<void>;
    toggleExercise: (workoutId: string, exerciseIndex: number, done: boolean, weight?: number) => Promise<void>;
    completeWorkout: (workoutId: string, durationMinutes: number) => Promise<void>;
}

const getAuthToken = () => localStorage.getItem('token');
const BASE_URL = `${API_URL}/workouts`;

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
});

export const useWorkoutStore = create<WorkoutState>((set) => ({
    todayWorkout: null,
    history: [],
    isLoading: false,
    error: null,

    fetchTodayWorkout: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await fetch(`${BASE_URL}/today`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch workout');
            const data = await res.json();
            set({ todayWorkout: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    fetchHistory: async () => {
        try {
            const res = await fetch(`${BASE_URL}/history`, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch history');
            const data = await res.json();
            set({ history: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    createWorkout: async (name, exercises) => {
        set({ isLoading: true });
        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ name, exercises: exercises.map(e => ({ ...e, done: false })) }),
            });
            if (!res.ok) throw new Error('Failed to create workout');
            const data = await res.json();
            set({ todayWorkout: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    toggleExercise: async (workoutId, exerciseIndex, done, weight) => {
        try {
            const res = await fetch(`${BASE_URL}/${workoutId}/exercise`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ exerciseIndex, done, weight }),
            });
            if (!res.ok) throw new Error('Failed to update exercise');
            const data = await res.json();
            set({ todayWorkout: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    completeWorkout: async (workoutId, durationMinutes) => {
        try {
            const res = await fetch(`${BASE_URL}/${workoutId}/complete`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ durationMinutes }),
            });
            if (!res.ok) throw new Error('Failed to complete workout');
            const data = await res.json();
            set({ todayWorkout: data });
        } catch (error: any) {
            set({ error: error.message });
        }
    },
}));
