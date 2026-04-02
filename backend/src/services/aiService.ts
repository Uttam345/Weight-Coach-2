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
        let textResult = result.response.text().trim();
        
        // Strip markdown backticks if Gemini includes them
        if (textResult.startsWith('\`\`\`json')) {
            textResult = textResult.substring(7);
            if (textResult.endsWith('\`\`\`')) textResult = textResult.slice(0, -3);
        } else if (textResult.startsWith('\`\`\`')) {
            textResult = textResult.substring(3);
            if (textResult.endsWith('\`\`\`')) textResult = textResult.slice(0, -3);
        }

        const parsedData = JSON.parse(textResult.trim());
        return parsedData;
    } catch (error) {
        console.error("Analysis Error:", error);
        throw new Error("Failed to analyze food.");
    }
};
