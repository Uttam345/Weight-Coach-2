import { Router } from 'express';
import { getDailyLog, addMealEntry, addWater } from '../controllers/nutritionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All nutrition routes are protected
router.use(protect);

router.get('/', getDailyLog);
router.post('/meal', addMealEntry);
router.post('/water', addWater);

export default router;
