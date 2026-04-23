import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log("API Key present:", !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

async function test() {
    try {
        const result = await model.generateContent("Say 'hello world'");
        console.log("Response:", result.response.text());
    } catch (err: any) {
        console.error("Gemini Error:", err.message);
    }
}
test();
