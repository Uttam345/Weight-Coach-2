import express from 'express';
import { handleChat, handleFoodAnalysis, handleMealSuggestions } from '../controllers/aiController';
import { protect } from '../middlewares/authMiddleware';
import { genaiRateLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

// All AI routes are protected and rate-limited to prevent GenAI API quota exhaustion
router.post('/chat', protect, genaiRateLimiter, handleChat);
router.post('/analyze-food', protect, genaiRateLimiter, handleFoodAnalysis);
router.post('/meal-suggestions', protect, genaiRateLimiter, handleMealSuggestions);

export default router;
