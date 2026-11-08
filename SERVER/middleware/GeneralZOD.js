import { z } from 'zod';
import AppError from '../utils/AppError.js';

// Checks req.body against a schema, swaps in the cleaned version
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      .join(', ');
    return next(AppError.badRequest(msg));
  }
  req.body = result.data;
  next();
};

// Lengths match the users table
export const signUp = z.object({
  firstName: z.string().trim().min(1).max(20),
  fatherName: z.string().trim().min(1).max(20),
  email: z.email().trim(),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number'),
  user_password: z.string().min(8).max(72), // bcrypt only reads 72 bytes
  homeCampusId: z.number().int().positive().optional(),
});

// Login
export const regular = z.object({
  email: z.email().trim(),
  user_password: z.string().min(1),
});
