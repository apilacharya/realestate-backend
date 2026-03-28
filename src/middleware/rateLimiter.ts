import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests' },
  standardHeaders: 'draft-7', 
  legacyHeaders: false, 
});
