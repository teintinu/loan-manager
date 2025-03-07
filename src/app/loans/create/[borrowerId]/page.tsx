"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getBorrower } from "@/app/actions/borrower-actions";
import { createLoan } from "@/app/actions/loan-actions";
import { createLoanFormSchema, CreateLoanFormSchema } from "../../../../../types/createLoan";
import { toast } from "sonner";

export default function CreateLoanPage({ params }: { params: { borrowerId: string } }) {
  const router = useRouter();
  const borrowerId = parseInt(params.borrowerId);
  
  const [borrower, setBorrower] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loanForm = useForm<CreateLoanFormSchema>({
    resolver: zodResolver(createLoanFormSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: undefined,
      interestRate: undefined,
      duration: undefined,
    },
  });

  useEffect(() => {
    async function loadBorrower() {
      try {
        const result = await getBorrower(borrowerId);
        if (result.borrower) {
          setBorrower(result.borrower);
        }
      } catch (error) {
        toast.error("Error loading borrower: " + error?.toString());
      } finally {
        setIsLoading(false);
      }
    }
    
    if (borrowerId) {
      loadBorrower();
    } else {
      setIsLoading(false);
    }
  }, [borrowerId]);

  async function onLoanSubmit(values: CreateLoanFormSchema) {
    console.log('Form submission started', { values, borrowerId });
    if (!borrowerId) {
      console.log('Submission blocked: No borrowerId');
      return;
    }

    setIsSubmitting(true);
    console.log('Setting isSubmitting to true');

    try {
      console.log('Attempting to create loan...');
      const result = await createLoan({ ...values, borrowerId });
      console.log('Create loan result:', result);
      
      if (!result.success) {
        console.log('Loan creation failed:', result.error);
        toast.error(result.error);
        return;
      }

      console.log('Loan created successfully, redirecting...');
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error('Loan creation error:', error);
      toast.error("Error creating loan: " + error?.toString()); 
    } finally {
      console.log('Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Loans
        </Link>
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Loan</CardTitle>
          <CardDescription>
            {isLoading ? "Loading borrower details..." : 
              borrower ? `Enter loan details for ${borrower.name}.` : "Enter loan details."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loanForm}>
            <form onSubmit={loanForm.handleSubmit(onLoanSubmit)} className="space-y-6">
              <FormField
                control={loanForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter loan title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loanForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter loan description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loanForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loanForm.control}
                name="interestRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loanForm.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="12"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="submit" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Creating..." : "Create Loan"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}