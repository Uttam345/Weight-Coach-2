"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestMealsFromInventory = exports.analyzeFoodMacro = exports.chatWithCoach = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("WARNING: GEMINI_API_KEY is missing in environment variables.");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
// KITCHEN IQ AI MODELS:
// - 'gemini-2.5-flash': Primary model for chat (reasoning, conversational AI).
//   Used by Coach Nova for personalized fitness guidance.
// - 'gemini-2.5-flash-lite': Fast model for structured JSON tasks (food analysis, meal suggestions).
//   Optimized for deterministic outputs and lower latency. Avoids 64k thinking-token limits.
// Note: Upgraded from Gemini 1.5 Flash (May 2026) for improved reasoning and performance.
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
const fastModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
// Helper to retry API calls on 503 Service Unavailable or 429 Too Many Requests
const retryOperation = (operation_1, ...args_1) => __awaiter(void 0, [operation_1, ...args_1], void 0, function* (operation, maxRetries = 3) {
    var _a, _b;
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return yield operation();
        }
        catch (error) {
            lastError = error;
            const isRateLimit = (error === null || error === void 0 ? void 0 : error.status) === 503 || (error === null || error === void 0 ? void 0 : error.status) === 429 ||
                ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('503')) || ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('429'));
            if (isRateLimit && attempt < maxRetries) {
                console.warn(`Gemini API busy (attempt ${attempt}/${maxRetries}). Retrying in ${attempt * 1.5}s...`);
                yield new Promise(res => setTimeout(res, attempt * 1500));
            }
            else {
                throw error;
            }
        }
    }
    throw lastError;
});
const chatWithCoach = (message_1, ...args_1) => __awaiter(void 0, [message_1, ...args_1], void 0, function* (message, history = [], context = "") {
    var _a, _b, _c, _d, _e;
    try {
        if (!apiKey) {
            return `[MOCK AI] I see your context! You weigh ${((_a = context.match(/Weight: (.*?)kg/)) === null || _a === void 0 ? void 0 : _a[1]) || 'unknown'}kg and your goal is ${((_b = context.match(/Goal: (.*?) kcal/)) === null || _b === void 0 ? void 0 : _b[1]) || 'unknown'} calories. Since no API key is provided, I'm running in local test mode! You said: "${message}"`;
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
        const result = yield retryOperation(() => chat.sendMessage(message));
        return result.response.text();
    }
    catch (error) {
        console.error("Chat Error:", error);
        if ((error === null || error === void 0 ? void 0 : error.status) === 429 || ((_c = error === null || error === void 0 ? void 0 : error.message) === null || _c === void 0 ? void 0 : _c.includes('429')) || ((_d = error === null || error === void 0 ? void 0 : error.message) === null || _d === void 0 ? void 0 : _d.includes('quota'))) {
            return `[API Quota Exceeded] I'm currently out of API requests! 😔 However, based on your context (Goal: ${((_e = context.match(/Goal: (.*?) kcal/)) === null || _e === void 0 ? void 0 : _e[1]) || 'unknown'} calories), I'd advise keeping up with your macros. Please try again later when my rate limits reset!`;
        }
        return `⚠️ Coach Nova encountered an error: ${error.message}`;
    }
});
exports.chatWithCoach = chatWithCoach;
const stripJsonMarkdown = (text) => {
    let t = text.trim();
    // Try to extract first JSON array or object
    const arrayMatch = t.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch)
        return arrayMatch[0];
    const objectMatch = t.match(/\{[\s\S]*\}/);
    if (objectMatch)
        return objectMatch[0];
    // Fallback: strip markdown fences
    if (t.startsWith('```json'))
        t = t.slice(7);
    else if (t.startsWith('```'))
        t = t.slice(3);
    if (t.endsWith('```'))
        t = t.slice(0, -3);
    return t.trim();
};
const analyzeFoodMacro = (foodName) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield retryOperation(() => fastModel.generateContent(prompt));
        const text = result.response.text();
        const parsedData = JSON.parse(stripJsonMarkdown(text));
        return parsedData;
    }
    catch (error) {
        console.error("Analysis Error:", error);
        throw new Error("Failed to analyze food.");
    }
});
exports.analyzeFoodMacro = analyzeFoodMacro;
const suggestMealsFromInventory = (inventory, caloriesRemaining, dietaryRestrictions, cuisinePreference) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (inventory.length === 0)
        throw new Error('Inventory is empty');
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
        const result = yield retryOperation(() => fastModel.generateContent(prompt));
        const rawText = result.response.text();
        console.log("[Meal AI Raw]:", rawText.slice(0, 300));
        const cleaned = stripJsonMarkdown(rawText);
        let suggestions;
        try {
            suggestions = JSON.parse(cleaned);
        }
        catch (parseError) {
            console.error("[Meal AI JSON Parse Error]:", parseError.message, "\nRaw:", rawText.slice(0, 500));
            throw new Error(`AI returned invalid JSON: ${parseError.message}`);
        }
        return Array.isArray(suggestions) ? suggestions : [];
    }
    catch (error) {
        console.error("Meal Suggestion Error:", error.message);
        if ((error === null || error === void 0 ? void 0 : error.status) === 429 || ((_a = error === null || error === void 0 ? void 0 : error.message) === null || _a === void 0 ? void 0 : _a.includes('429')) || ((_b = error === null || error === void 0 ? void 0 : error.message) === null || _b === void 0 ? void 0 : _b.includes('quota'))) {
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
});
exports.suggestMealsFromInventory = suggestMealsFromInventory;
