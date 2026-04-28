"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const zod_1 = require("zod");
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string()
});
const generateTokenAndSetCookie = (res, id) => {
    const token = jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
};
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password } = validatedData;
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield User_1.default.create({
            name,
            email,
            password: hashedPassword,
        });
        if (user) {
            const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'fallback_secret', {
                expiresIn: '30d',
            });
            generateTokenAndSetCookie(res, user._id.toString());
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token, // Return token in response for frontend storage
            });
        }
        else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;
        const user = yield User_1.default.findOne({ email });
        if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
            const token = jsonwebtoken_1.default.sign({ id: user._id.toString() }, process.env.JWT_SECRET || 'fallback_secret', {
                expiresIn: '30d',
            });
            generateTokenAndSetCookie(res, user._id.toString());
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token, // Return token in response for frontend storage
            });
        }
        else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: 'Server error' });
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});
exports.logoutUser = logoutUser;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.user) {
        res.status(200).json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        });
    }
    else {
        res.status(401).json({ message: 'Not authorized, user not found' });
    }
});
exports.getMe = getMe;
