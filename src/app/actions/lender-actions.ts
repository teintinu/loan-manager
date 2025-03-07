"use server"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { z } from "zod"

const prisma = new PrismaClient()

const lenderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

type LenderData = z.infer<typeof lenderSchema>

export async function createLender(data: LenderData) {
  try {
    const validation = lenderSchema.safeParse(data)
    if (!validation.success) {
      return { 
        error: "Invalid input data" 
      }
    }
    
    const { name, email, password } = validation.data
    
    const existingLender = await prisma.lender.findUnique({
      where: { email },
    })
    
    if (existingLender) {
      return { 
        error: "A user with this email already exists" 
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const lender = await prisma.lender.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })
    
    return { 
      success: true,
      lender 
    }
  } catch (error) {
    console.error("Error creating lender:", error)
    return { 
      error: "Internal server error" 
    }
  }
}