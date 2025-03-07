"use server"

import { prisma } from "@/lib/db"
import { z } from "zod"

const borrowerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
})

type BorrowerData = z.infer<typeof borrowerSchema>

export async function getBorrowers() {
  "use server"
  try {
    const borrowers = await prisma.borrower.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return { borrowers }
  } catch (error) {
    console.error("Error fetching borrowers:", error)
    return { error: "Failed to fetch borrowers" }
  }
}

export async function getBorrower(id: number) {
  try {
    const borrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        loans: true
      }
    })
    
    if (!borrower) {
      return { error: "Borrower not found" }
    }
    
    return { borrower }
  } catch (error) {
    console.error("Error fetching borrower:", error)
    return { error: "Failed to fetch borrower" }
  }
}

export async function createBorrower(data: BorrowerData) {
  try {
    const validation = borrowerSchema.safeParse(data)
    if (!validation.success) {
      return { 
        error: "Invalid input data",
        issues: validation.error.issues
      }
    }
    
    const { name, email } = validation.data
    
    const existingBorrower = await prisma.borrower.findUnique({
      where: { email },
    })
    
    if (existingBorrower) {
      return { 
        error: "A borrower with this email already exists" 
      }
    }
    
    const borrower = await prisma.borrower.create({
      data: {
        name,
        email,
      },
    })
    
    return { 
      success: true,
      borrower 
    }
  } catch (error) {
    console.error("Error creating borrower:", error)
    return { 
      error: "Internal server error" 
    }
  }
}

export async function updateBorrower(id: number, data: BorrowerData) {
  try {
    const validation = borrowerSchema.safeParse(data)
    if (!validation.success) {
      return { 
        error: "Invalid input data",
        issues: validation.error.issues
      }
    }
    
    const { name, email } = validation.data
    
    const existingBorrower = await prisma.borrower.findUnique({
      where: { email },
    })
    
    if (existingBorrower && existingBorrower.id !== id) {
      return { 
        error: "A borrower with this email already exists" 
      }
    }
    
    const borrower = await prisma.borrower.update({
      where: { id },
      data: {
        name,
        email,
      },
    })
    
    return { 
      success: true,
      borrower 
    }
  } catch (error) {
    console.error("Error updating borrower:", error)
    return { 
      error: "Internal server error" 
    }
  }
}

export async function deleteBorrower(id: number) {
  try {
    const borrowerWithLoans = await prisma.borrower.findUnique({
      where: { id },
      include: {
        loans: true
      }
    })
    
    if (!borrowerWithLoans) {
      return { error: "Borrower not found" }
    }
    
    if (borrowerWithLoans.loans.length > 0) {
      return { 
        error: "Cannot delete borrower with active loans" 
      }
    }
    
    await prisma.borrower.delete({
      where: { id },
    })
    
    return { 
      success: true 
    }
  } catch (error) {
    console.error("Error deleting borrower:", error)
    return { 
      error: "Internal server error" 
    }
  }
}