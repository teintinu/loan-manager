"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search, Edit } from "lucide-react";

interface Loan {
  id: number;
  borrowerName: string;
  amount: number;
  status: "ACTIVE" | "PAID" | "DEFAULTED" | "PENDING";
  dueDate: string;
  createdAt: string;
}

async function fetchLoans(name: string, status: string): Promise<Loan[]> {
  const params = new URLSearchParams();
  if (name) params.append("name", name);
  if (status) params.append("status", status);
  
  const response = await fetch(`/api/loans?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch loans");
  }
  return response.json();
}

export function LoansList() {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [debouncedName, setDebouncedName] = useState("");

  const { data: loans, isLoading, isError } = useQuery({
    queryKey: ["loans", debouncedName, statusFilter],
    queryFn: () => fetchLoans(debouncedName, statusFilter),
    staleTime: 30000,
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
    // Debounce search to avoid too many requests
    clearTimeout(Number(localStorage.getItem("searchTimeout")));
    const timeout = setTimeout(() => {
      setDebouncedName(e.target.value);
    }, 500);
    localStorage.setItem("searchTimeout", timeout.toString());
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>;
      case "PAID":
        return <Badge className="bg-blue-500">Paid</Badge>;
      case "DEFAULTED":
        return <Badge className="bg-red-500">Defaulted</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Loans</CardTitle>
        <Button asChild>
          <Link href="/loans/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Loan
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by borrower name"
              value={nameFilter}
              onChange={handleNameChange}
              className="pl-8"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="REQUESTED">Requested</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <div className="text-center py-4 text-red-500">
            Failed to load loans. Please try again.
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : loans?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No loans found. Create your first loan to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  loans?.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.borrowerName}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(loan.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${loan.amount.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(loan.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/loans/${loan.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}