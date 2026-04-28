import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("WARNING: GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || '');
// gemini-2.5-flash is used for chat (reasoning). gemini-2.5-flash-lite is used for
// structured JSON tasks (food analysis, meal suggestions) to avoid hitting the
// 64k thinking-token output limit that causes 500 errors on gemini-2.5-flash.
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const fastModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

// Helper to retry API calls on 503 Service Unavailable or 429 Too Many Requests
const retryOperation = async <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            const isRateLimit = error?.status === 503 || error?.status === 429 || 
                               error?.message?.includes('503') || error?.message?.includes('429');
            
            if (isRateLimit && attempt < maxRetries) {
                console.warn(`Gemini API busy (attempt ${attempt}/${maxRetries}). Retrying in ${attempt * 1.5}s...`);
                await new Promise(res => setTimeout(res, attempt * 1500));
            } else {
                throw error;
            }
        }
    }
    throw lastError;
};

export const chatWithCoach = async (message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[] = [], context: string = "") => {
    try {
        if (!apiKey) {
            return `[MOCK AI] I see your context! You weigh ${context.match(/Weight: (.*?)kg/)?.[1] || 'unknown'}kg and your goal is ${context.match(/Goal: (.*?) kcal/)?.[1] || 'unknown'} calories. Since no API key is provided, I'm running in local test mode! You said: "${message}"`;
        }

        const systemPrompt = `You are Coach Nova, an elite, hyper-intelligent fitness AI. You speak in a highly motivating, crisp, premium Gen-Z aesthetic tone. You provide precise, actionable fitness advice. Be concise.\n\nUser Context:\n${context}`;
        
        // Use system instruction for Gemini
        const chatModel = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt 
        });

        // Ensure history starts with a user message to prevent Gemini API errors
        let validHistory = [...history];
        if (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory.unshift({ role: 'user', parts: [{ text: 'Hi' }] });
        }

        const chat = chatModel.startChat({
            history: validHistory,
        });

        const result = await retryOperation(() => chat.sendMessage(message));
        return result.response.text();
    } catch (error: any) {
        console.error("Chat Error:", error);
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
            return `[API Quota Exceeded] I'm currently out of API requests! 😔 However, based on your context (Goal: ${context.match(/Goal: (.*?) kcal/)?.[1] || 'unknown'} calories), I'd advise keeping up with your macros. Please try again later when my rate limits reset!`;
        }
        return `⚠️ Coach Nova encountered an error: ${error.message}`;
    }
};

const stripJsonMarkdown = (text: string): string => {
    let t = text.trim();
    // Try to extract first JSON array or object
    const arrayMatch = t.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) return arrayMatch[0];
    const objectMatch = t.match(/\{[\s\S]*\}/);
    if (objectMatch) return objectMatch[0];
    // Fallback: strip markdown fences
    if (t.startsWith('```json')) t = t.slice(7);
    else if (t.startsWith('```')) t = t.slice(3);
    if (t.endsWith('```')) t = t.slice(0, -3);
    return t.trim();
};

export const analyzeFoodMacro = async (foodName: string) => {
    const prompt = `
Analyze the following food item or meal: "${foodName}".
Provide a realistic estimation of its macronutrients.
You MUST return the output strictly in this JSON format:
{
    "name": "formatted name of the food",
    "cals": number (total calories),
    "pro": number (protein in grams),
    "carb": number (carbs in grams),
    "fat": number (fat in grams)
}
Do not include any markdown formatting, backticks, or extra text. Just the JSON object.
    `.trim();

    try {
        if (!apiKey) {
            return {
                name: foodName,
                cals: 350,
                pro: 25,
                carb: 30,
                fat: 15
            };
        }

        const result = await retryOperation(() => fastModel.generateContent(prompt));
        const text = result.response.text();
        const parsedData = JSON.parse(stripJsonMarkdown(text));
        return parsedData;
    } catch (error: any) {
        console.error("Analysis Error:", error);
        throw new Error("Failed to analyze food.");
    }
};

export interface MealSuggestion {
    title: string;
    ingredientMatchPct: number;
    ingredients: { name: string; qty: string; unit: string; available: boolean }[];
    missingIngredients: { name: string; qty: string; unit: string }[];
    steps: string[];
    macros: { calories: number; protein: number; carbs: number; fat: number };
    videoSearchQuery: string;
}

export const suggestMealsFromInventory = async (
    inventory: { name: string; quantity: number; unit: string }[],
    caloriesRemaining: number,
    dietaryRestrictions: string[],
    cuisinePreference: string
): Promise<MealSuggestion[]> => {
    if (inventory.length === 0) throw new Error('Inventory is empty');

    const inventoryList = inventory.map(i => `- ${i.name}: ${i.quantity} ${i.unit}`).join('\n');
    const restrictions = dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'none';

    const prompt = `You are a professional chef and nutritionist AI. Respond ONLY with a raw JSON array — no markdown, no backticks, no explanation, no extra text before or after the array.

Based on this kitchen inventory, suggest 3 meals:

KITCHEN INVENTORY:
${inventoryList}

CONSTRAINTS:
- Calorie budget: ${caloriesRemaining} kcal
- Dietary restrictions: ${restrictions}
- Cuisine: ${cuisinePreference || 'any'}

Return this exact JSON structure:
[{"title":"Meal Name","ingredientMatchPct":85,"ingredients":[{"name":"ingredient","qty":"100","unit":"g","available":true}],"missingIngredients":[{"name":"item","qty":"50","unit":"g"}],"steps":["Step 1.","Step 2."],"macros":{"calories":450,"protein":35,"carbs":40,"fat":12},"videoSearchQuery":"how to cook meal name"}]

Rules:
- ingredientMatchPct: % of needed ingredients already in inventory
- available: true only if item is in the provided inventory
- missingIngredients: only items NOT in the inventory
- steps: 4-7 instructions
- Return exactly 3 objects in the array
- OUTPUT ONLY THE JSON ARRAY, NOTHING ELSE`.trim();

    try {
        if (!apiKey) {
            return [
                {
                    title: "[MOCK] Chicken & Broccoli",
                    ingredientMatchPct: 100,
                    ingredients: [{ name: "Chicken", qty: "200", unit: "g", available: true }],
                    missingIngredients: [],
                    steps: ["Cook chicken.", "Season.", "Serve."],
                    macros: { calories: 400, protein: 45, carbs: 10, fat: 5 },
                    videoSearchQuery: "chicken and broccoli recipe"
                }
            ];
        }

        const result = await retryOperation(() => fastModel.generateContent(prompt));
        const rawText = result.response.text();
        console.log("[Meal AI Raw]:", rawText.slice(0, 300));
        const cleaned = stripJsonMarkdown(rawText);
        let suggestions: MealSuggestion[];
        try {
            suggestions = JSON.parse(cleaned);
        } catch (parseError: any) {
            console.error("[Meal AI JSON Parse Error]:", parseError.message, "\nRaw:", rawText.slice(0, 500));
            throw new Error(`AI returned invalid JSON: ${parseError.message}`);
        }
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (error: any) {
        console.error("Meal Suggestion Error:", error.message);
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
            console.log("Falling back to mock meal suggestion due to 429 Quota Exceeded.");
            return [
                {
                    title: "[Quota Exceeded Mock] Chicken & Rice",
                    ingredientMatchPct: 100,
                    ingredients: [
                        { name: "Chicken", qty: "200", unit: "g", available: true },
                        { name: "Rice", qty: "100", unit: "g", available: true }
                    ],
                    missingIngredients: [],
                    steps: ["The AI API quota was exceeded.", "This is a mock meal so you can test the Cook functionality!"],
                    macros: { calories: 500, protein: 45, carbs: 40, fat: 5 },
                    videoSearchQuery: "chicken and rice recipe"
                }
            ];
        }
        throw new Error(error.message || "Failed to generate meal suggestions.");
    }
};

