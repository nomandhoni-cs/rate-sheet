"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SectionsPage() {
  const { user } = useUser();
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const sections = useQuery(
    api.sections.getAllSections,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const users = useQuery(
    api.users.getUsersInOrganization,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const createSection = useMutation(api.sections.createSection);
  const deleteSection = useMutation(api.sections.deleteSection);

  // Filter users to only show managers and admins
  const managers =
    users?.filter((user) => user.role === "manager" || user.role === "admin") ||
    [];

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newSectionName.trim() ||
      !selectedManagerId ||
      !userData?.organizationId
    )
      return;

    try {
      await createSection({
        name: newSectionName.trim(),
        managerId: selectedManagerId as any,
        organizationId: userData.organizationId,
      });
      setNewSectionName("");
      setSelectedManagerId("");
      setIsAddingSection(false);
    } catch (error) {
      console.error("Failed to create section:", error);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this section? This will affect all workers in this section."
      )
    ) {
      try {
        await deleteSection({ sectionId: sectionId as any });
      } catch (error) {
        console.error("Failed to delete section:", error);
      }
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center animate-fadeInUp">
          <LoadingSpinner size="lg" className="mb-4 mx-auto" />
          <h2 className="text-lg font-sans font-medium text-foreground mb-2">Loading Sections</h2>
          <p className="text-sm text-muted-foreground">Fetching section data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold">Sections</h1>
          <p className="text-base lg:text-lg text-muted-foreground mt-2">
            Manage production sections and their assigned managers
          </p>
        </div>
        <Button
          onClick={() => setIsAddingSection(true)}
          className="w-full sm:w-auto"
        >
          Add Section
        </Button>
      </div>

      {isAddingSection && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Section</CardTitle>
            <CardDescription>
              Create a new production section and assign a manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <Label htmlFor="sectionName">Section Name</Label>
                <Input
                  id="sectionName"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Cutting Line A, Stitching Department"
                  required
                />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Select
                  value={selectedManagerId}
                  onValueChange={setSelectedManagerId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager._id} value={manager._id}>
                        {manager.name} ({manager.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Add Section
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsAddingSection(false);
                    setNewSectionName("");
                    setSelectedManagerId("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Sections</CardTitle>
          <CardDescription>
            {sections?.length || 0} sections in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sections || sections.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No sections found. Add your first section to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Manager
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Manager Role
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow key={section._id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{section.name}</div>
                          <div className="text-sm text-muted-foreground sm:hidden">
                            {section.manager?.name} ({section.manager?.role})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {section.manager?.name || "Unknown"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="capitalize">
                          {section.manager?.role || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSection(section._id)}
                        >
                          Delete
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
