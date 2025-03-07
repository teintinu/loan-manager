"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  totalAmount: number;
  averageAmount: number;
}

async function fetchLoanStats(): Promise<LoanStats> {
  const response = await fetch('/api/loans/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch loan statistics');
  }
  return response.json();
}

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['loanStats'],
    queryFn: fetchLoanStats,
    staleTime: 60000, // Cache for 60 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load dashboard statistics
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Total Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">{data?.totalLoans}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[50px]" />
          ) : (
            <div className="text-2xl font-bold">{data?.activeLoans}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">
              ${data?.totalAmount.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">Average Loan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-7 w-[100px]" />
          ) : (
            <div className="text-2xl font-bold">
              ${data?.averageAmount.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}