"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import { OnboardingFlow } from "./OnboardingFlow";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const createUser = useMutation(api.users.createUser);
  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  useEffect(() => {
    if (isLoaded && user && !userData) {
      // Sync user with Convex database
      createUser({
        clerkId: user.id,
        name: user.fullName || user.firstName || "Unknown",
        email: user.primaryEmailAddress?.emailAddress || "",
      }).catch(console.error);
    }
  }, [isLoaded, user, userData, createUser]);

  // Show onboarding if user exists but hasn't completed onboarding
  if (isLoaded && user && userData && !userData.hasCompletedOnboarding) {
    return <OnboardingFlow />;
  }

  return null; // This component doesn't render anything
}
