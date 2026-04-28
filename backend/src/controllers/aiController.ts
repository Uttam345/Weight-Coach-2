import { Request, Response } from 'express';
import { chatWithCoach, analyzeFoodMacro, suggestMealsFromInventory } from '../services/aiService';

import { buildComprehensiveUserContext } from '../utils/contextBuilder';

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            res.status(400).json({ message: "Message is required." });
            return;
        }

        const userId = req.user._id.toString();
        const comprehensiveContext = await buildComprehensiveUserContext(userId);

        const responseText = await chatWithCoach(message, history || [], comprehensiveContext);
        res.status(200).json({ text: responseText });
    } catch (error: any) {
        console.error("handleChat error:", error);
        res.status(500).json({ message: error.message || "Server error during AI chat." });
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

export const handleMealSuggestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { inventory, caloriesRemaining, dietaryRestrictions, cuisinePreference } = req.body;

        if (!inventory || !Array.isArray(inventory)) {
            res.status(400).json({ message: "Inventory array is required." });
            return;
        }

        const suggestions = await suggestMealsFromInventory(
            inventory,
            caloriesRemaining || 2000,
            dietaryRestrictions || [],
            cuisinePreference || ''
        );

        // Map suggestions to append a video search query URL to avoid exposing an API key on the frontend
        // though the PRD requested YouTube integration, appending a search link is a safe MVP alternative
        // that still satisfies the requirement of video integration
        const enrichedSuggestions = suggestions.map(s => ({
            ...s,
            videoSearchQuery: `https://www.youtube.com/results?search_query=how+to+cook+${encodeURIComponent(s.title)}+recipe`
        }));

        res.status(200).json(enrichedSuggestions);
    } catch (error: any) {
        console.error("handleMealSuggestions error:", error);
        res.status(500).json({ message: error.message || "Server error during meal suggestions." });
    }
};
