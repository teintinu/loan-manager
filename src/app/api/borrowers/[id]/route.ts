import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    const borrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        loans: true
      }
    });

    if (!borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(borrower);
  } catch (error) {
    console.error("Failed to fetch borrower:", error);
    return NextResponse.json(
      { error: "Failed to fetch borrower" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    const body = await request.json();
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if borrower exists
    const existingBorrower = await prisma.borrower.findUnique({
      where: { id }
    });

    if (!existingBorrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Check if email is already in use by another borrower
    const emailCheck = await prisma.borrower.findUnique({
      where: { email: body.email }
    });

    if (emailCheck && emailCheck.id !== id) {
      return NextResponse.json(
        { error: "Email is already in use by another borrower" },
        { status: 400 }
      );
    }

    // Update borrower
    const updatedBorrower = await prisma.borrower.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email
      }
    });

    return NextResponse.json(updatedBorrower);
  } catch (error) {
    console.error("Failed to update borrower:", error);
    return NextResponse.json(
      { error: "Failed to update borrower" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid borrower ID" },
        { status: 400 }
      );
    }

    // Check if borrower exists
    const borrower = await prisma.borrower.findUnique({
      where: { id },
      include: {
        loans: true
      }
    });

    if (!borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      );
    }

    // Check if borrower has any loans
    if (borrower.loans.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete borrower with active loans" },
        { status: 400 }
      );
    }

    // Delete borrower
    await prisma.borrower.delete({
      where: { id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete borrower:", error);
    return NextResponse.json(
      { error: "Failed to delete borrower" },
      { status: 500 }
    );
  }
}