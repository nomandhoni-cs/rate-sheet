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

export default function WorkersPage() {
  const { user } = useUser();
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [manualId, setManualId] = useState("");
  const [editingId, setEditingId] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editSectionId, setEditSectionId] = useState<string>("");
  const [editManualId, setEditManualId] = useState("");

  const userData = useQuery(
    api.users.getUserByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const workers = useQuery(
    api.workers.getAllWorkers,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const sections = useQuery(
    api.sections.getAllSections,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const createWorker = useMutation(api.workers.createWorker);
  const deleteWorker = useMutation(api.workers.deleteWorker);
  const updateWorker = useMutation(api.workers.updateWorker);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newWorkerName.trim() ||
      !selectedSectionId ||
      !userData?.organizationId
    )
      return;

    try {
      await createWorker({
        name: newWorkerName.trim(),
        sectionId: selectedSectionId as any,
        organizationId: userData.organizationId,
        manualId: manualId.trim() || undefined,
      });
      setNewWorkerName("");
      setSelectedSectionId("");
      setManualId("");
      setIsAddingWorker(false);
    } catch (error) {
      console.error("Failed to create worker:", error);
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (confirm("Are you sure you want to delete this worker?")) {
      try {
        await deleteWorker({ workerId: workerId as any });
      } catch (error) {
        console.error("Failed to delete worker:", error);
      }
    }
  };

  const startEdit = (w: any) => {
    setEditingId(w._id);
    setEditName(w.name || "");
    setEditSectionId(w.sectionId);
    setEditManualId(w.manualId || "");
  };

  const cancelEdit = () => {
    setEditingId("");
    setEditName("");
    setEditSectionId("");
    setEditManualId("");
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim() || !editSectionId) return;
    try {
      await updateWorker({
        workerId: editingId as any,
        name: editName.trim(),
        sectionId: editSectionId as any,
        manualId: editManualId.trim() || undefined,
      });
      cancelEdit();
    } catch (error) {
      console.error("Failed to update worker:", error);
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center animate-fadeInUp">
          <LoadingSpinner size="lg" className="mb-4 mx-auto" />
          <h2 className="text-lg font-sans font-medium text-foreground mb-2">Loading Workers</h2>
          <p className="text-sm text-muted-foreground">Fetching worker data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold">Workers</h1>
          <p className="text-base lg:text-lg text-muted-foreground mt-2">
            Manage workers and their section assignments
          </p>
        </div>
        <Button
          onClick={() => setIsAddingWorker(true)}
          className="w-full sm:w-auto"
        >
          Add Worker
        </Button>
      </div>

      {isAddingWorker && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Worker</CardTitle>
            <CardDescription>
              Create a new worker and assign them to a section
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddWorker} className="space-y-4">
              <div>
                <Label htmlFor="workerName">Worker Name</Label>
                <Input
                  id="workerName"
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="Enter worker name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="manualId">Manual ID Number</Label>
                <Input
                  id="manualId"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  required
                  placeholder="e.g., W-1024"
                />
              </div>
              <div>
                <Label htmlFor="section">Section</Label>
                <Select
                  value={selectedSectionId}
                  onValueChange={setSelectedSectionId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map((section) => (
                      <SelectItem key={section._id} value={section._id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Add Worker
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsAddingWorker(false);
                    setNewWorkerName("");
                    setSelectedSectionId("");
                    setManualId("");
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
          <CardTitle>All Workers</CardTitle>
          <CardDescription>
            {workers?.length || 0} workers in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!workers || workers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No workers found. Add your first worker to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Section
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Manager
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker._id}>
                      {editingId === worker._id ? (
                        <>
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <Input value={editName} onChange={(e)=>setEditName(e.target.value)} placeholder="Worker name" />
                              <div className="text-xs text-muted-foreground">ID (Manual):</div>
                              <Input value={editManualId} onChange={(e)=>setEditManualId(e.target.value)} placeholder="e.g., W-1024" />
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Select value={editSectionId} onValueChange={setEditSectionId}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a section" />
                              </SelectTrigger>
                              <SelectContent>
                                {sections?.map((section) => (
                                  <SelectItem key={section._id} value={section._id}>
                                    {section.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {sections?.find((s) => s._id === editSectionId)?.manager?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" onClick={saveEdit}>Save</Button>
                            <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">
                            <div>
                              <div>{worker.name}</div>
                              <div className="text-xs text-muted-foreground">ID: {worker.manualId || '-'}</div>
                              <div className="text-sm text-muted-foreground sm:hidden">
                                {worker.section?.name}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {worker.section?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {sections?.find((s) => s._id === worker.sectionId)
                              ?.manager?.name || "Unknown"}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="sm" onClick={() => startEdit(worker)}>Edit</Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteWorker(worker._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </>
                      )}
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
