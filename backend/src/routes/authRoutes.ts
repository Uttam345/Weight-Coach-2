import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
