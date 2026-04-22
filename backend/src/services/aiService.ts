import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("WARNING: GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || 'unauthorized');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const chatWithCoach = async (message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[] = []) => {
    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: "You are Coach Nova, an elite, hyper-intelligent fitness AI. You speak in a highly motivating, crisp, premium Gen-Z aesthetic tone. You provide precise, actionable actionable fitness advice. Be concise." }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am Coach Nova. Let's sculpt." }],
                },
                ...history
            ],
            generationConfig: {
                maxOutputTokens: 250,
            },
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error) {
        console.error("Chat Error:", error);
        throw new Error("Failed to communicate with Coach Nova.");
    }
};

const stripJsonMarkdown = (text: string): string => {
    let t = text.trim();
    if (t.startsWith('```json')) t = t.slice(7);
    else if (t.startsWith('```')) t = t.slice(3);
    if (t.endsWith('```')) t = t.slice(0, -3);
    return t.trim();
};

export const analyzeFoodMacro = async (foodName: string) => {
    try {
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
        `;

        const result = await model.generateContent(prompt);
        const parsedData = JSON.parse(stripJsonMarkdown(result.response.text()));
        return parsedData;
    } catch (error) {
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

    const prompt = `
You are a professional chef and nutritionist AI. Based on the user's kitchen inventory, suggest 3 meals they can cook right now.

KITCHEN INVENTORY:
${inventoryList}

CONSTRAINTS:
- Remaining calorie budget today: ${caloriesRemaining} kcal
- Dietary restrictions: ${restrictions}
- Cuisine preference: ${cuisinePreference || 'any'}

You MUST respond with ONLY a valid JSON array (no markdown, no backticks, no extra text) with exactly this structure:
[
  {
    "title": "Meal Name",
    "ingredientMatchPct": 85,
    "ingredients": [
      { "name": "ingredient name", "qty": "amount", "unit": "g/ml/cup/item", "available": true }
    ],
    "missingIngredients": [
      { "name": "missing item", "qty": "amount", "unit": "g" }
    ],
    "steps": [
      "Step 1 instruction.",
      "Step 2 instruction."
    ],
    "macros": { "calories": 450, "protein": 35, "carbs": 40, "fat": 12 },
    "videoSearchQuery": "how to cook meal name recipe"
  }
]

Rules:
- ingredientMatchPct: percentage of required ingredients already in inventory (0-100)
- Mark each ingredient available: true if it is in the inventory list, false if not
- missingIngredients: only list items NOT in the inventory
- steps: 4-7 clear cooking instructions
- macros: realistic per-serving estimates
- Keep calories within the remaining budget where possible
- Return exactly 3 meal suggestions
`;

    try {
        const result = await model.generateContent(prompt);
        const suggestions: MealSuggestion[] = JSON.parse(stripJsonMarkdown(result.response.text()));
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (error) {
        console.error("Meal Suggestion Error:", error);
        throw new Error("Failed to generate meal suggestions.");
    }
};

