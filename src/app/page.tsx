import { useSession } from "next-auth/react";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/options";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-7xl mx-auto">
        {session ? (
          <div className="space-y-8">
            <h1 className="text-3xl font-bold">Welcome, {session.user?.name}</h1>
            <Dashboard />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <h1 className="text-3xl font-bold">Welcome to Loan Management</h1>
            <p className="text-muted-foreground">Please sign in to access your dashboard</p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
