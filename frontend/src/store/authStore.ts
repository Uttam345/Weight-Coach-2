import { create } from 'zustand';
import { API_URL } from '../services/api';

export interface User {
    _id: string;
    name: string;
    email: string;
    token: string;
    height?: number;
    weight?: number;
    dailyCalorieGoal?: number;
    dietaryPreference?: string;
    cuisinePreference?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AUTH_URL = `${API_URL}/auth`;

export const useAuthStore = create<AuthState>((set, get) => {
    const storedUser = localStorage.getItem('user');

    return {
        user: storedUser ? JSON.parse(storedUser) : null,
        isLoading: false,
        error: null,
        
        setUser: (user) => {
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', user.token);
            } else {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            set({ user });
        },

        login: async (email, password) => {
            set({ isLoading: true, error: null });
            try {
                const response = await fetch(`${AUTH_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', data.token);
                set({ user: data, isLoading: false, error: null });
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                throw error;
            }
        },

        register: async (name, email, password) => {
            set({ isLoading: true, error: null });
            try {
                const response = await fetch(`${AUTH_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed');
                }

                localStorage.setItem('user', JSON.stringify(data));
                localStorage.setItem('token', data.token);
                set({ user: data, isLoading: false, error: null });
            } catch (error: any) {
                set({ error: error.message, isLoading: false });
                throw error;
            }
        },

        logout: () => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            set({ user: null });
        },

        updateProfile: async (data) => {
            const { user } = get();
            if (!user) return;
            try {
                const res = await fetch(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error('Failed to update profile');
                const updatedUser = await res.json();
                
                // Keep the token as it's not returned by the profile update
                const newUser = { ...updatedUser, token: user.token };
                localStorage.setItem('user', JSON.stringify(newUser));
                set({ user: newUser });
            } catch (error) {
                console.error('Update profile error:', error);
                throw error;
            }
        },

        clearError: () => set({ error: null })
    };
});
