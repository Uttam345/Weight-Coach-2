import { create } from 'zustand';
import { aiApi } from '../services/api';

export interface MealSuggestion {
    title: string;
    ingredientMatchPct: number;
    ingredients: { name: string; qty: string; unit: string; available: boolean }[];
    missingIngredients: { name: string; qty: string; unit: string }[];
    steps: string[];
    macros: { calories: number; protein: number; carbs: number; fat: number };
    videoSearchQuery: string;
}

interface KitchenState {
    suggestions: MealSuggestion[];
    isGenerating: boolean;
    error: string | null;
    generateSuggestions: (inventory: any[], caloriesRemaining: number) => Promise<void>;
}

export const useKitchenStore = create<KitchenState>((set) => ({
    suggestions: [],
    isGenerating: false,
    error: null,

    generateSuggestions: async (inventory, caloriesRemaining) => {
        set({ isGenerating: true, error: null });
        try {
            const suggestions = await aiApi.suggestMeals(inventory, caloriesRemaining);
            set({ suggestions, isGenerating: false });
        } catch (error: any) {
            set({ error: error.message, isGenerating: false });
        }
    }
}));
