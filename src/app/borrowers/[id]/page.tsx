import { getBorrower } from '@/app/actions/borrower-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default async function BorrowerDetailsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  const id = parseInt((await Promise.resolve(params)).id);
  const { borrower, error } = await getBorrower(id);
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href="/borrowers">
            <Button>Back to Borrowers</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Show skeleton while loading
  if (!borrower) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Borrower Details</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID</p>
                      <Skeleton className="h-5 w-12 mt-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <Skeleton className="h-5 w-24 mt-1" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">Loans</h3>
                  <div className="mt-2 space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <Skeleton className="h-5 w-32 mb-2" />
                              <Skeleton className="h-4 w-48 mb-2" />
                              <Skeleton className="h-4 w-40 mt-1" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{borrower.name}</CardTitle>
                <CardDescription>{borrower.email}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Link href="/borrowers">
                  <Button variant="outline" size="sm">Back to List</Button>
                </Link>
                <Link href={`/borrowers/${borrower.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Borrower Details</h3>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">ID</p>
                    <p>{borrower.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p>{new Date(borrower.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Loans</h3>
                {borrower.loans && borrower.loans.length > 0 ? (
                  <div className="mt-2 space-y-4">
                    {borrower.loans.map((loan) => (
                      <Card key={loan.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{loan.title}</h4>
                              <p className="text-sm text-gray-500">{loan.description}</p>
                              <p className="text-sm mt-1">
                                Amount: ${parseFloat(loan.amount.toString()).toFixed(2)} | 
                                Status: {loan.status}
                              </p>
                            </div>
                            <Link href={`/loans/${loan.id}`}>
                              <Button variant="outline" size="sm">View Loan</Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No loans found for this borrower</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}