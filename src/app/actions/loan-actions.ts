'use server';

import { prisma } from '@/lib/db';
import { authOptions } from '../api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { createLoanFormSchema, CreateLoanFormSchema } from '../../../types/createLoan';
import { z } from 'zod';

export async function createLoan(values: CreateLoanFormSchema) {
  "use server"

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        error: "Unauthorized"
      }
    }

    const data = createLoanFormSchema.parse(values);
       
    if (!data.borrowerId || !data.amount || !data.interestRate || !data.duration) {
         throw new Error("Missing required fields");
    }

    const loan = await prisma.loan.create({
    data: {
        lenderId: session.user.lenderId,
        borrowerId: data.borrowerId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        interestRate: data.interestRate,
        duration: data.duration,
        status: "REQUESTED",
    },
    include: {
        borrower: true
    }
    });

    const installmentAmount = Math.trunc(data.amount / data.duration/100)*100;
    const installments = [];
    
    for (let i = 1; i <= data.duration; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const installment = await prisma.installment.create({
        data: {
        loanId: loan.id,
        installmentNumber: i,
        amount: i===1?(data.amount-(installmentAmount*(data.duration-1))):installmentAmount,
        dueDate: dueDate,
        status: "PENDING"
        }
    });
    
    installments.push(installment);
    }

    return { loan, installments, success: true };
  } catch (error) {
    console.error("Error creating loan:", error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(", ") 
      };
    }
    return { success: false, error: "Failed to create loan" };
  }
}