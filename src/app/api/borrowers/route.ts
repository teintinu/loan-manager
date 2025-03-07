import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name") || "";
    
    // Build the query with filters
    const whereClause: any = {};
    
    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive'
      };
    }

    // Fetch borrowers from database
    const borrowers = await db.borrower.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(borrowers);
  } catch (error) {
    console.error("Failed to fetch borrowers:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrowers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if borrower with email already exists
    const existingBorrower = await db.borrower.findUnique({
      where: { email: body.email },
    });

    if (existingBorrower) {
      return NextResponse.json(
        { error: "A borrower with this email already exists" },
        { status: 400 }
      );
    }

    // Create new borrower
    const borrower = await db.borrower.create({
      data: {
        name: body.name,
        email: body.email,
      }
    });

    return NextResponse.json(borrower, { status: 201 });
  } catch (error) {
    console.error("Failed to create borrower:", error);
    return NextResponse.json(
      { error: "Failed to create borrower" },
      { status: 500 }
    );
  }
}