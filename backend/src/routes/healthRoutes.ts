import { Router } from 'express';
import { logMetric, getLatestMetrics, getMetricHistory, getStreak } from '../controllers/healthController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
router.use(protect);

router.post('/', logMetric);
router.get('/latest', getLatestMetrics);
router.get('/history', getMetricHistory);
router.get('/streak', getStreak);

export default router;
