"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const nutritionRoutes_1 = __importDefault(require("./routes/nutritionRoutes"));
const workoutRoutes_1 = __importDefault(require("./routes/workoutRoutes"));
const pantryRoutes_1 = __importDefault(require("./routes/pantryRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const shoppingRoutes_1 = __importDefault(require("./routes/shoppingRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
// Connect to MongoDB
(0, db_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
app.use('/api/nutrition', nutritionRoutes_1.default);
app.use('/api/workouts', workoutRoutes_1.default);
app.use('/api/pantry', pantryRoutes_1.default);
app.use('/api/health', healthRoutes_1.default);
app.use('/api/shopping', shoppingRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Weight Coach AI Backend is running!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
