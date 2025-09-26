"use client";

import { useMemo, useState } from "react";
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
import WorkerSelect from "@/components/WorkerSelect";
import { toast } from "sonner";

export default function ProductionPage() {
  const { user } = useUser();
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [productionDate, setProductionDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [focusedStyleId, setFocusedStyleId] = useState<string>("");
  const [allSectionsChecked, setAllSectionsChecked] = useState(true);
  const [selectedSectionIds, setSelectedSectionIds] = useState<Record<string, boolean>>({});

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

  const styles = useQuery(
    api.styles.getAllStyles,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const sections = useQuery(
    api.sections.getAllSections,
    userData?.organizationId ? { organizationId: userData.organizationId } : "skip"
  );

  const productionLogs = useQuery(
    api.productionLogs.getProductionLogsByDate,
    userData?.organizationId
      ? {
        date: selectedDate,
        organizationId: userData.organizationId,
      }
      : "skip"
  );

  const createProductionLog = useMutation(
    api.productionLogs.createProductionLog
  );
  const deleteProductionLog = useMutation(
    api.productionLogs.deleteProductionLog
  );

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleQuantityChange = (styleId: string, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [styleId]: parseInt(value) || 0,
    }));
  };

  const filteredStyles = useMemo(() => {
    if (!styles) return [] as any[];
    if (allSectionsChecked) return styles;
    const ids = Object.keys(selectedSectionIds).filter((id) => selectedSectionIds[id]);
    if (ids.length === 0) return styles; // fallback to all if none selected
    return styles.filter((s: any) => (s.sectionId ? ids.includes(s.sectionId) : false));
  }, [styles, allSectionsChecked, selectedSectionIds]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      toast.error("Please select a worker");
      return;
    }
    if (!productionDate) {
      toast.error("Please choose a production date");
      return;
    }
    if (!userData?.organizationId) return;

    const orgId = userData.organizationId as any;

    const logsToCreate = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([styleId, quantity]) => ({
        workerId: selectedWorkerId as any,
        styleId: styleId as any,
        organizationId: orgId,
        quantity,
        productionDate,
      }));

    if (logsToCreate.length === 0) {
      toast.error("Enter at least one quantity");
      return;
    }

    try {
      await Promise.all(logsToCreate.map((args) => createProductionLog(args)));
      toast.success("Production logs added");
      setSelectedWorkerId("");
      setQuantities({});
      setProductionDate("");
      setIsAddingLog(false);
    } catch (error) {
      console.error("Failed to create production logs:", error);
      toast.error("Failed to add production logs");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (confirm("Are you sure you want to delete this production log?")) {
      try {
        await deleteProductionLog({ logId: logId as any });
        toast.success("Production log deleted");
      } catch (error) {
        console.error("Failed to delete production log:", error);
        toast.error("Failed to delete production log");
      }
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center animate-fadeInUp">
          <LoadingSpinner size="lg" className="mb-4 mx-auto" />
          <h2 className="text-lg font-sans font-medium text-foreground mb-2">Loading Production</h2>
          <p className="text-sm text-muted-foreground">Fetching production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold">Production Logs</h1>
          <p className="text-base lg:text-lg text-muted-foreground mt-2">
            Track daily worker production output
          </p>
        </div>
        <Button
          onClick={() => setIsAddingLog(true)}
          className="w-full sm:w-auto"
        >
          Add Production Log
        </Button>
      </div>

      {isAddingLog && (
        <Card>
          <CardHeader>
            <CardTitle>Add Production Log</CardTitle>
            <CardDescription>
              Record worker production for a specific style and date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <Label htmlFor="worker">Worker</Label>
                <WorkerSelect
                  organizationId={userData?.organizationId as any}
                  value={selectedWorkerId}
                  onChange={setSelectedWorkerId}
                  placeholder="Search worker by name or ID"
                />
              </div>
              <div>
                <Label>Filter Styles by Section</Label>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 text-sm p-2 rounded border">
                    <input
                      type="checkbox"
                      checked={allSectionsChecked}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAllSectionsChecked(checked);
                        if (checked) setSelectedSectionIds({});
                      }}
                    />
                    <span>All</span>
                  </label>
                  {sections?.map((sec) => (
                    <label key={sec._id} className="flex items-center gap-2 text-sm p-2 rounded border">
                      <input
                        type="checkbox"
                        checked={allSectionsChecked ? true : !!selectedSectionIds[sec._id]}
                        disabled={allSectionsChecked}
                        onChange={(e) =>
                          setSelectedSectionIds((prev) => ({ ...prev, [sec._id]: e.target.checked }))
                        }
                      />
                      <span>{sec.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Styles</Label>
                {filteredStyles?.map((style) => (
                  <div
                    key={style._id}
                    className={`flex items-center justify-between rounded px-2 py-1 ${focusedStyleId === style._id ? "bg-muted" : ""}`}
                  >
                    <Label htmlFor={`style-${style._id}`}>
                      {style.name}
                      {style.sectionId && (
                        <span className="ml-2 text-xs text-muted-foreground">(
                          {sections?.find((s) => s._id === style.sectionId)?.name}
                        )</span>
                      )}
                    </Label>
                    <Input
                      id={`style-${style._id}`}
                      type="number"
                      min="0"
                      value={quantities[style._id] || ""}
                      onFocus={() => setFocusedStyleId(style._id)}
                      onBlur={() => setFocusedStyleId("")}
                      onChange={(e) =>
                        handleQuantityChange(style._id, e.target.value)
                      }
                      placeholder="Quantity"
                      className="w-24"
                    />
                  </div>
                ))}
              </div>
              <div>
                <Label htmlFor="productionDate">Production Date</Label>
                <Input
                  id="productionDate"
                  type="date"
                  value={productionDate}
                  onChange={(e) => setProductionDate(e.target.value)}
                  max={today}
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className="w-full sm:w-auto">
                  Add Log
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setIsAddingLog(false);
                    setSelectedWorkerId("");
                    setQuantities({});
                    setProductionDate("");
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
          <CardTitle>Production Logs</CardTitle>
          <CardDescription>
            View production logs for a specific date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Label htmlFor="dateFilter">Filter by Date</Label>
            <Input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="w-full sm:w-auto"
            />
          </div>

          {!productionLogs || productionLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No production logs found for {selectedDate}. Add production logs
              to get started.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Section
                    </TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionLogs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>
                            {log.worker?.name}
                            {log.worker?.manualId ? ` (${log.worker.manualId})` : ""}
                          </div>
                          <div className="text-sm text-muted-foreground sm:hidden">
                            {log.worker?.section?.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {log.worker?.section?.name}
                      </TableCell>
                      <TableCell>{log.style?.name}</TableCell>
                      <TableCell className="font-medium">
                        {log.quantity}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {log.productionDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLog(log._id)}
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
