import rateLimit from 'express-rate-limit';

// Limit to 5 login/register attempts per IP per 15 minutes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message: {
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for GenAI API calls (50 requests per hour per user)
// Prevents quota exhaustion and abuse of Gemini API
export const genaiRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour per user
    message: {
        message: 'GenAI API quota exceeded. 50 requests per hour allowed. Try again later.',
    },
    keyGenerator: (req: any, res) => req.user?._id?.toString() || req.ip,
    skipSuccessfulRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
});
