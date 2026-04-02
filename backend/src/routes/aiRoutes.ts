import express from 'express';
import { handleChat, handleFoodAnalysis } from '../controllers/aiController';

const router = express.Router();

// Both endpoints are theoretically public for this demo layer, but could use auth middleware
router.post('/chat', handleChat);
router.post('/analyze-food', handleFoodAnalysis);

export default router;
