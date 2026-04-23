import { create } from 'zustand';
import { API_URL } from '../services/api';

export interface FoodEntry {
  _id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: number;
  unit: string;
}

export interface MealLog {
  _id: string;
  userId: string;
  date: string;
  meals: {
    breakfast: FoodEntry[];
    lunch: FoodEntry[];
    dinner: FoodEntry[];
    snack: FoodEntry[];
  };
  waterIntake: number;
}

interface NutritionState {
  currentLog: MealLog | null;
  isLoading: boolean;
  error: string | null;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number; // in ml
  };
  fetchDailyLog: (date?: string) => Promise<void>;
  addMealEntry: (mealType: string, entry: FoodEntry, date?: string) => Promise<void>;
  addWater: (amount: number, date?: string) => Promise<void>;
}

const getAuthToken = () => localStorage.getItem('token');
const BASE_URL = `${API_URL}/nutrition`;

export const useNutritionStore = create<NutritionState>((set) => ({
  currentLog: null,
  isLoading: false,
  error: null,
  goals: {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
    water: 3000 // 3L
  },

  fetchDailyLog: async (date?: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const url = new URL(`${API_URL}/nutrition`);
      if (date) url.searchParams.append('date', date);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch daily log');

      const data = await response.json();
      set({ currentLog: data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addMealEntry: async (mealType: string, entry: FoodEntry, date?: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${BASE_URL}/meal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mealType, entry, date })
      });

      if (!response.ok) throw new Error('Failed to add meal entry');

      const data = await response.json();
      set({ currentLog: data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addWater: async (amount: number, date?: string) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${BASE_URL}/water`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount, date })
      });

      if (!response.ok) throw new Error('Failed to log water');

      const data = await response.json();
      set({ currentLog: data });
    } catch (error: any) {
      set({ error: error.message });
    }
  }
}));
