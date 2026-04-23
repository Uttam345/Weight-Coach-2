import { create } from 'zustand';
import { API_URL } from '../services/api';

export interface ShoppingItem {
    _id: string;
    name: string;
    quantity: number;
    unit: string;
    category: string;
    checked: boolean;
}

interface ShoppingState {
    items: ShoppingItem[];
    isLoading: boolean;
    error: string | null;
    fetchShoppingList: () => Promise<void>;
    addItems: (items: Omit<ShoppingItem, '_id' | 'checked'>[]) => Promise<void>;
    toggleItem: (id: string, checked: boolean) => Promise<void>;
    clearChecked: () => Promise<void>;
}

const getAuthToken = () => localStorage.getItem('token');
const BASE_URL = `${API_URL}/shopping`;

const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}`,
});

export const useShoppingStore = create<ShoppingState>((set) => ({
    items: [],
    isLoading: false,
    error: null,

    fetchShoppingList: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch(BASE_URL, { headers: authHeaders() });
            if (!res.ok) throw new Error('Failed to fetch shopping list');
            const data = await res.json();
            set({ items: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addItems: async (itemsToAdd) => {
        try {
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ items: itemsToAdd }),
            });
            if (!res.ok) throw new Error('Failed to add items to shopping list');
            const updatedItems = await res.json();
            set({ items: updatedItems });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    toggleItem: async (id, checked) => {
        try {
            const res = await fetch(`${BASE_URL}/${id}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ checked }),
            });
            if (!res.ok) throw new Error('Failed to toggle item');
            const updatedItems = await res.json();
            set({ items: updatedItems });
        } catch (error: any) {
            set({ error: error.message });
        }
    },

    clearChecked: async () => {
        try {
            const res = await fetch(`${BASE_URL}/checked`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (!res.ok) throw new Error('Failed to clear checked items');
            const updatedItems = await res.json();
            set({ items: updatedItems });
        } catch (error: any) {
            set({ error: error.message });
        }
    }
}));
