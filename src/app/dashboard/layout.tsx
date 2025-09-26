"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { redirect } from "next/navigation";
import { LoadingPage } from "@/components/ui/loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  // Redirect if not authenticated or not onboarded
  if (isLoaded && (!user || (userData && !userData.hasCompletedOnboarding))) {
    redirect("/");
  }

  // Show loading while checking authentication
  if (!isLoaded || !userData) {
    return (
      <LoadingPage
        title="Loading Dashboard"
        description="Setting up your workspace..."
        variant="pulse"
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}