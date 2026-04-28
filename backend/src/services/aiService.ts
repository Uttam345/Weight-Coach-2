import dotenv from 'dotenv';
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL_NAME = process.env.HF_MODEL_NAME || "mistralai/Mistral-7B-Instruct-v0.3";

if (!HF_TOKEN) {
    console.error("WARNING: HF_TOKEN is missing in environment variables.");
    console.error("Get your token at: https://huggingface.co/settings/tokens");
}

// Helper to make requests to HuggingFace Inference API
async function hfChatCompletion(messages: {role: string; content: string}[], stream: boolean = false): Promise<any> {
    if (!HF_TOKEN) {
        throw new Error("HF_TOKEN not configured");
    }

    const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
        {
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: messages,
                parameters: {
                    max_new_tokens: 256,
                    temperature: 0.7,
                    top_p: 0.9,
                    return_full_text: false,
                },
                stream: stream,
            }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`HuggingFace API error: ${response.status} - ${error}`);
    }

    return response;
}

export const chatWithCoach = async (message: string, history: {role: 'user' | 'model', parts: {text: string}[]}[] = [], context: string = "") => {
    try {
        const systemPrompt = `You are Coach Nova, an elite, hyper-intelligent fitness AI. You speak in a highly motivating, crisp, premium Gen-Z aesthetic tone. You provide precise, actionable fitness advice. Be concise.\n\nUser Context:\n${context}`;
        
        // Build messages array for HuggingFace
        const messages: {role: string; content: string}[] = [
            { role: "system", content: systemPrompt }
        ];

        // Add history (convert from Gemini format to simple messages)
        for (const msg of history) {
            messages.push({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.parts[0]?.text || ''
            });
        }

        // Add current message
        messages.push({ role: "user", content: message });

        if (!HF_TOKEN) {
            // Mock response if API key is missing
            return `[MOCK AI] I see your context! You weigh ${context.match(/Weight: (.*?)kg/)?.[1] || 'unknown'}kg and your goal is ${context.match(/Goal: (.*?) kcal/)?.[1] || 'unknown'} calories. Since no API key is provided, I'm running in local test mode! You said: "${message}"`;
        }

        const response = await hfChatCompletion(messages, false);
        
        // Handle streaming response (single chunk for non-streaming)
        const data = await response.json();
        
        // Mistral Instruct format returns generated_text
        if (data.generated_text) {
            return data.generated_text;
        }
        
        // Fallback: try to extract from different response formats
        return data[0]?.generated_text || data.generated_text || "I couldn't generate a response. Please try again.";
    } catch (error: any) {
        console.error("Chat Error:", error);
        return `⚠️ Coach Nova encountered an error: ${error.message}`;
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
        if (!HF_TOKEN) {
            return {
                name: foodName,
                cals: 350,
                pro: 25,
                carb: 30,
                fat: 15
            };
        }

        const messages = [
            { role: "system", content: "You are a nutrition analysis assistant. Return only valid JSON." },
            { role: "user", content: prompt }
        ];

        const response = await hfChatCompletion(messages, false);
        const data = await response.json();
        
        const text = data.generated_text || data[0]?.generated_text || "";
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
`.trim();

    try {
        if (!HF_TOKEN) {
            return [
                {
                    title: "[MOCK] Chicken & Broccoli",
                    ingredientMatchPct: 100,
                    ingredients: [{ name: "Chicken", qty: "200", unit: "g", available: true }],
                    missingIngredients: [],
                    steps: ["Cook chicken.", "Eat."],
                    macros: { calories: 400, protein: 45, carbs: 10, fat: 5 },
                    videoSearchQuery: "https://youtube.com"
                }
            ];
        }

        const messages = [
            { role: "system", content: "You are a professional chef and nutritionist. Return only valid JSON array." },
            { role: "user", content: prompt }
        ];

        const response = await hfChatCompletion(messages, false);
        const data = await response.json();
        
        const text = data.generated_text || data[0]?.generated_text || "";
        const suggestions: MealSuggestion[] = JSON.parse(stripJsonMarkdown(text));
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (error: any) {
        console.error("Meal Suggestion Error:", error);
        throw new Error("Failed to generate meal suggestions.");
    }
};

