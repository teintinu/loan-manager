import { boolean, z } from 'zod';

export const createLoanFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    interestRate: z.coerce.number().min(0, "Interest rate must be non-negative"),
    duration: z.coerce.number().int().positive("Duration must be a positive integer"),
    borrowerId: z.number().int().positive("Borrower ID is required")  
});

export type CreateLoanFormSchema = z.infer<typeof createLoanFormSchema>;
