import { Router } from 'express';
import { getDailyLog, addMealEntry, addWater, logMealAndDeductPantry } from '../controllers/nutritionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All nutrition routes are protected
router.use(protect);

router.get('/', getDailyLog);
router.post('/meal', addMealEntry);
router.post('/water', addWater);
// KITCHEN IQ LOOP: Atomic transaction endpoint that logs meal AND deducts pantry ingredients
router.post('/meal/cooked', logMealAndDeductPantry);

export default router;
