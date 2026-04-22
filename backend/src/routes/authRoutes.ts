import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { authLimiter } from '../middlewares/rateLimiter';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

export default router;
