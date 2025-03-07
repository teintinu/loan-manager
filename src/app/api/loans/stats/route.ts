import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const [totalLoans, activeLoans, amounts] = await Promise.all([
      prisma.loan.count({
        where: { lenderId: session.user.lenderId },
      }),
      prisma.loan.count({
        where: {
          lenderId: session.user.lenderId,
          status: "APPROVED",
        },
      }),
      prisma.loan.aggregate({
        where: { lenderId: session.user.lenderId },
        _sum: {
          amount: true,
        },
        _avg: {
          amount: true,
        },
      }),
    ]);

    return NextResponse.json({
      totalLoans,
      activeLoans,
      totalAmount: amounts._sum.amount || 0,
      averageAmount: amounts._avg.amount || 0,
    });
  } catch (error) {
    console.error("Failed to fetch loan statistics:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}