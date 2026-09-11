import rateLimit from 'express-rate-limit';

// Auth rate limit removed for unlimited login attempts
export const authRateLimiter = (req: any, res: any, next: any) => next();

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  message: {
    success: false,
    error: { message: 'Too many requests. Please slow down.' },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
