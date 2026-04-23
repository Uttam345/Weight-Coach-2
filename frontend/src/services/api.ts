export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const request = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
        let errorMsg = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
            // fallback to default errorMsg if not JSON
            console.error('Error parsing JSON response', e);
        }
        throw new Error(errorMsg);
    }

    return response.json();
};

export const aiApi = {
    chat: (message: string, history: any[], context?: string) => 
        request('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message, history, context }),
        }),
    analyzeFood: (foodName: string) =>
        request('/ai/analyze-food', {
            method: 'POST',
            body: JSON.stringify({ foodName }),
        }),
    suggestMeals: (inventory: any[], caloriesRemaining: number, dietaryRestrictions: string[] = [], cuisinePreference: string = '') =>
        request('/ai/meal-suggestions', {
            method: 'POST',
            body: JSON.stringify({ inventory, caloriesRemaining, dietaryRestrictions, cuisinePreference }),
        })
};

