import { z } from 'zod';

export const LoginSchema = z.object({
    username: z.string().min(3, 'Min. 3 characters'),
    password: z.string().min(6, 'Min. 6 characters'),
});
export type LoginForm = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({ 
    username: z.string().min(3, 'Min. 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Min. 8 characters'),
});
export type RegisterForm = z.infer<typeof RegisterSchema>;