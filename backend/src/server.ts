import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import workoutRoutes from './routes/workoutRoutes';
import pantryRoutes from './routes/pantryRoutes';
import healthRoutes from './routes/healthRoutes';
import shoppingRoutes from './routes/shoppingRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/shopping', shoppingRoutes);

app.get('/', (req, res) => {
    res.send('Weight Coach AI Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
