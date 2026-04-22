import { create } from 'zustand';

export interface PantryItem {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    category: 'protein' | 'carbs' | 'fats' | 'dairy' | 'vegetables' | 'fruits' | 'supplements' | 'other';
}

interface PantryState {
    items: PantryItem[];
    isLoading: boolean;
    error: string | null;
    fetchPantry: () => Promise<void>;
    addItem: (item: Omit<PantryItem, '_id'>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

const getAuthToken = () => localStorage.getItem('token');
const BASE_URL = 'http://localhost:5000/api/pantry';

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
});

export const usePantryStore = create<PantryState>((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    fetchPantry: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch(BASE_URL, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch pantry');
            const data = await res.json();
            set({ items: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addItem: async (item) => {
        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(item),
            });
            if (!res.ok) throw new Error('Failed to add item');
            const newItem = await res.json();
            set({ items: [...get().items, newItem] });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    deleteItem: async (id) => {
        try {
            const res = await fetch(`${BASE_URL}/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Failed to delete item');
            set({ items: get().items.filter(i => i._id !== id) });
        } catch (error: any) {
            set({ error: error.message });
        }
    },
}));
