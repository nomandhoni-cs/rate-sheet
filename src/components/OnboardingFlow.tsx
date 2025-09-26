"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function OnboardingFlow() {
  const { user } = useUser();
  const [organizationName, setOrganizationName] = useState("");
  const [organizationDescription, setOrganizationDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const createOrganizationAndSetAdmin = useMutation(
    api.users.createOrganizationAndSetAdmin
  );
  const joinOrganization = useMutation(api.users.joinOrganization);
  const organizationByInviteCode = useQuery(
    api.organizations.getOrganizationByInviteCode,
    inviteCode.length >= 6 ? { inviteCode: inviteCode.toUpperCase() } : "skip"
  );

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !organizationName.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await createOrganizationAndSetAdmin({
        clerkId: user.id,
        organizationName: organizationName.trim(),
        organizationDescription: organizationDescription.trim() || undefined,
      });

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      await joinOrganization({
        clerkId: user.id,
        inviteCode: inviteCode.toUpperCase(),
      });

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to join organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome to RateSheet
          </h1>
          <p className="text-gray-600 mt-2">
            Let's get you set up with your production tracking system
          </p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Organization</TabsTrigger>
            <TabsTrigger value="join">Join Team</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Organization</CardTitle>
                <CardDescription>
                  Start fresh with a new organization. You'll be the admin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrganization} className="space-y-4">
                  <div>
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      placeholder="e.g., ABC Garments Ltd."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgDescription">
                      Description (Optional)
                    </Label>
                    <Input
                      id="orgDescription"
                      value={organizationDescription}
                      onChange={(e) =>
                        setOrganizationDescription(e.target.value)
                      }
                      placeholder="Brief description of your organization"
                    />
                  </div>
                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Organization"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Join an Organization</CardTitle>
                <CardDescription>
                  Enter the invite code provided by your organization admin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinOrganization} className="space-y-4">
                  <div>
                    <Label htmlFor="inviteCode">Invite Code</Label>
                    <Input
                      id="inviteCode"
                      value={inviteCode}
                      onChange={(e) =>
                        setInviteCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter 6-character code"
                      maxLength={6}
                      className="uppercase"
                      required
                    />
                  </div>

                  {organizationByInviteCode && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Found organization:{" "}
                        <strong>{organizationByInviteCode.name}</strong>
                      </p>
                      {organizationByInviteCode.description && (
                        <p className="text-sm text-green-600 mt-1">
                          {organizationByInviteCode.description}
                        </p>
                      )}
                    </div>
                  )}

                  {inviteCode.length >= 6 && !organizationByInviteCode && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        Invalid invite code. Please check and try again.
                      </p>
                    </div>
                  )}

                  {error && <div className="text-red-600 text-sm">{error}</div>}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !organizationByInviteCode}
                  >
                    {isLoading ? "Joining..." : "Join Organization"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
