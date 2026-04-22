import express from 'express';
import { handleChat, handleFoodAnalysis, handleMealSuggestions } from '../controllers/aiController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Both endpoints are theoretically public for this demo layer, but could use auth middleware
router.post('/chat', protect, handleChat);
router.post('/analyze-food', protect, handleFoodAnalysis);
router.post('/meal-suggestions', protect, handleMealSuggestions);

export default router;
