"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const { user } = useUser();
  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const convex = useConvex();
  const { getToken } = useAuth();
  const demoteUser = useMutation(api.users.demoteUserToPending);
  const updateOrganization = useMutation(api.organizations.updateOrganization);

  // Forward Clerk token to Convex from this page (without changing the provider)
  useEffect(() => {
    convex.setAuth(async () => {
      try {
        // Prefer the 'convex' JWT template if present; fallback to default
        const templated = await getToken({ template: "convex" } as any).catch(() => null);
        if (templated) return templated;
        const fallback = await getToken().catch(() => null);
        return fallback ?? null;
      } catch {
        return null;
      }
    });
    return () => {
      convex.setAuth(() => Promise.resolve(null));
    };
  }, [convex, getToken]);

  const usersInOrg = useQuery(
    api.users.getUsersInOrganization,
    userData?.organizationId ? { organizationId: userData.organizationId } : "skip"
  );

  const organization = useQuery(
    api.organizations.getOrganization,
    userData?.organizationId ? { organizationId: userData.organizationId as any } : "skip"
  );

  const [orgForm, setOrgForm] = useState({
    name: "",
    description: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (organization) {
      setOrgForm({
        name: organization.name || "",
        description: organization.description || "",
        addressLine1: organization.addressLine1 || "",
        addressLine2: organization.addressLine2 || "",
        city: organization.city || "",
        state: organization.state || "",
        postalCode: organization.postalCode || "",
        country: organization.country || "",
      });
    }
  }, [organization]);

  const onSaveOrg = async () => {
    if (!organization) return;
    try {
      await updateOrganization({
        organizationId: organization._id,
        name: orgForm.name,
        description: orgForm.description || undefined,
        addressLine1: orgForm.addressLine1 || undefined,
        addressLine2: orgForm.addressLine2 || undefined,
        city: orgForm.city || undefined,
        state: orgForm.state || undefined,
        postalCode: orgForm.postalCode || undefined,
        country: orgForm.country || undefined,
      } as any);
      toast.success("Organization updated");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update organization");
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner className="mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading admin settings...</p>
        </div>
      </div>
    );
  }

  if (userData.role !== "admin") {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You must be an admin to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const managers = (usersInOrg || []).filter((u: any) => u.role === "manager");

  const handleDemote = async (userId: string) => {
    if (!confirm("Change this user's role to Pending? They will be treated as a new user.")) return;
    try {
      await demoteUser({ userId: userId as any });
      toast.success("User role changed to Pending");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to change role to Pending");
    }
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold">Admin Settings</h1>
          <p className="text-base lg:text-lg text-muted-foreground mt-2">Manage your organization and team</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>Update organization name and address/location details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!organization ? (
            <div className="py-6 text-center"><LoadingSpinner className="mx-auto" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" value={orgForm.name} onChange={(e)=>setOrgForm(prev=>({...prev, name: e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="orgDesc">Description</Label>
                <Input id="orgDesc" value={orgForm.description} onChange={(e)=>setOrgForm(prev=>({...prev, description: e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addr1">Address Line 1</Label>
                <Input id="addr1" value={orgForm.addressLine1} onChange={(e)=>setOrgForm(prev=>({...prev, addressLine1: e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="addr2">Address Line 2</Label>
                <Input id="addr2" value={orgForm.addressLine2} onChange={(e)=>setOrgForm(prev=>({...prev, addressLine2: e.target.value}))} />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={orgForm.city} onChange={(e)=>setOrgForm(prev=>({...prev, city: e.target.value}))} />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" value={orgForm.state} onChange={(e)=>setOrgForm(prev=>({...prev, state: e.target.value}))} />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code</Label>
                <Input id="postal" value={orgForm.postalCode} onChange={(e)=>setOrgForm(prev=>({...prev, postalCode: e.target.value}))} />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={orgForm.country} onChange={(e)=>setOrgForm(prev=>({...prev, country: e.target.value}))} />
              </div>
              <div className="md:col-span-2">
                <Button onClick={onSaveOrg} className="w-full sm:w-auto">Save</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Managers</CardTitle>
          <CardDescription>Demote managers to Pending (keeps them in the organization)</CardDescription>
        </CardHeader>
        <CardContent>
          {!usersInOrg ? (
            <div className="py-10 text-center"><LoadingSpinner className="mx-auto" /></div>
          ) : managers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No managers found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers.map((m: any) => (
                    <TableRow key={m._id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="secondary" size="sm" onClick={() => handleDemote(m._id)}>
                          Demote to Pending
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
