import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getBorrowers } from "@/app/actions/borrower-actions";

export default async function BorrowersPage({ searchParams }: { searchParams: { creatingLoan?: string } }) {
  const creatingLoan = searchParams.creatingLoan === 'true';   
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  const { borrowers, error } = await getBorrowers();
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Borrowers</h1>
        <Link href="/borrowers/create">
          <Button>Add New Borrower</Button>
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {borrowers && borrowers.length > 0 ? (
              borrowers.map((borrower) => (
                <TableRow key={borrower.id}>
                  <TableCell className="font-medium">{borrower.name}</TableCell>
                  <TableCell>{borrower.email}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {!creatingLoan?<Link href={`/borrowers/${borrower.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>:null}
                      {!creatingLoan?<Link href={`/borrowers/${borrower.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>:null}
                      {creatingLoan?<Link href={`/loans/create/${borrower.id}`}>
                        <Button variant="outline" size="sm">Create loan</Button>
                      </Link>:null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  No borrowers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}