import express from 'express';
import { getProfile, updateProfile, calculateTDEE } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
// Calculate TDEE and generate personalized nutrition plan
router.post('/calculate-tdee', calculateTDEE);

export default router;
