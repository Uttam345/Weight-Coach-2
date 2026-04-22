import { Router } from 'express';
import {
    getTodayWorkout,
    getWorkoutHistory,
    createWorkout,
    updateExercise,
    completeWorkout,
} from '../controllers/workoutController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();
router.use(protect);

router.get('/today', getTodayWorkout);
router.get('/history', getWorkoutHistory);
router.post('/', createWorkout);
router.put('/:id/exercise', updateExercise);
router.put('/:id/complete', completeWorkout);

export default router;
