import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { createLoan } from "@/app/actions/loan-actions";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name") || "";
    const status = searchParams.get("status") || "";

    // Build the query with filters
    const whereClause: any = {};
    
    if (name) {
      whereClause.borrowerName = {
        contains: name,
        mode: 'insensitive'
      };
    }
    
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Fetch loans from database
    const loans = await prisma.loan.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(loans);
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return NextResponse.json(
      { error: "Failed to fetch loans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user.lenderId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = {...(await request.json()), lenderId: session.user.lenderId};
    
    const {loan, installments}= await createLoan(body)

    return NextResponse.json({ loan, installments }, { status: 201 });
  } catch (error) {
    console.error("Failed to create loan:", error);
    return NextResponse.json(
      { error: "Failed to create loan" },
      { status: 500 }
    );
  }
}