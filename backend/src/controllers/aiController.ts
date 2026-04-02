import { Request, Response } from 'express';
import { chatWithCoach, analyzeFoodMacro } from '../services/aiService';

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            res.status(400).json({ message: "Message is required." });
            return;
        }

        const responseText = await chatWithCoach(message, history || []);
        res.status(200).json({ text: responseText });
    } catch (error) {
        console.error("handleChat error:", error);
        res.status(500).json({ message: "Server error during AI chat." });
    }
};

export const handleFoodAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const { foodName } = req.body;
        
        if (!foodName) {
            res.status(400).json({ message: "Food name is required." });
            return;
        }

        const analysis = await analyzeFoodMacro(foodName);
        res.status(200).json(analysis);
    } catch (error) {
        console.error("handleFoodAnalysis error:", error);
        res.status(500).json({ message: "Server error during food analysis." });
    }
};
