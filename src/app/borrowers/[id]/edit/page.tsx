'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBorrower, updateBorrower } from '@/app/actions/borrower-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default async function EditBorrowerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = parseInt((await Promise.resolve(params)).id);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBorrower = async () => {
      try {
        const { borrower, error } = await getBorrower(id);
        
        if (error) {
          setError(error);
          return;
        }
        
        if (borrower) {
          setName(borrower.name);
          setEmail(borrower.email);
        }
      } catch (err) {
        setError('Failed to load borrower data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBorrower();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await updateBorrower(id, { name, email });
      
      if (result.error) {
        setError(result.error);
      } else {
        router.push(`/borrowers/${id}`);
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <p>Loading borrower data...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Borrower</CardTitle>
                <CardDescription>Update borrower information</CardDescription>
              </div>
              <Link href={`/borrowers/${id}`}>
                <Button variant="outline" size="sm">Cancel</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter borrower name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter borrower email"
                />
              </div>
              <div className="flex justify-between">
                <Link href={`/borrowers/${id}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}