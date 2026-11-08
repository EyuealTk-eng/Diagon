import {z} from 'zod';
import AppError from '../utils/AppError.js';


export const validate=(schema) =>(req,res,next) => {
    const result = schema.safeParse(req.body);
    if(!result.success){
        const neatErrors= result.error.issues.map((issue)=>`${issue.path.join('.')}:${issue.message}`).join(', ');
        return next(AppError.badRequest(neatErrors));

    }
    req.body=result.data;
    next();
}

export const signUp = z.object({
  firstName: z.string({ required_error: 'First name is required' })
    .trim()
    .min(1, 'First name cannot be empty')
    .max(20, 'First name cannot exceed 20 characters'),

  fatherName: z
    .string({ required_error: 'Father name is required' })
    .trim()
    .min(1, 'Father name cannot be empty')
    .max(20, 'Father name cannot exceed 20 characters'),

  email: z
    .email('Invalid email address')
    .trim()
    .toLowerCase(),

  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .min(9, 'Phone number must be at least 9 digits')
    .max(20, 'Phone number cannot exceed 20 characters'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters long'),

  campusId: z
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),
});

//Login
export const regular = z.object({
  email: z
    .email('Invalid email address')
    .trim()
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty'),
});