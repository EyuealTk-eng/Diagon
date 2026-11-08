import rateLimit from 'express-rate-limit';

// Strainer for the auth routes, stop the password guessers
export const strainerAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts, try again in a bit.' },
});
