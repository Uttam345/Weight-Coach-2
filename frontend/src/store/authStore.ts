import { create } from 'zustand';

interface User {
    _id: string;
    name: string;
    email: string;
    token: string;
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
}

const API_URL = 'http://localhost:5000/api/auth';

export const useAuthStore = create<AuthState>((set) => {
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
                const response = await fetch(`${API_URL}/login`, {
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
                const response = await fetch(`${API_URL}/register`, {
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

        clearError: () => set({ error: null })
    };
});
