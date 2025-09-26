"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading";
import { toast } from "sonner";

export default function BonusesPage() {
  const { user } = useUser();
  const userData = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");

  const styles = useQuery(
    api.styles.getAllStyles,
    userData?.organizationId ? { organizationId: userData.organizationId } : "skip"
  );
  const sections = useQuery(
    api.sections.getAllSections,
    userData?.organizationId ? { organizationId: userData.organizationId } : "skip"
  );

  // Cast bonuses api to any until codegen picks it up
  const rules = useQuery(
    (api as any).bonuses.listBonusRules,
    userData?.organizationId ? { organizationId: userData.organizationId } : "skip"
  ) as any[] | undefined;

  const createRule = useMutation((api as any).bonuses.createBonusRule);
  const updateRule = useMutation((api as any).bonuses.updateBonusRule);
  const deleteRule = useMutation((api as any).bonuses.deleteBonusRule);

  const [form, setForm] = useState({
    name: "",
    description: "",
    criteriaType: "quantity",
    threshold: "",
    bonusType: "percent",
    bonusValue: "",
    applyOn: "wage",
    styleId: "none",
    sectionId: "none",
    active: true,
    effectiveDate: "",
    endDate: "",
  });

  const onCreate = async () => {
    try {
      if (!userData?.organizationId) return;
      if (!form.name) { toast.error("Name is required"); return; }
      if (!form.threshold || isNaN(Number(form.threshold))) { toast.error("Valid threshold is required"); return; }
      if (!form.bonusValue || isNaN(Number(form.bonusValue))) { toast.error("Valid bonus value is required"); return; }

      await createRule({
        organizationId: userData.organizationId as any,
        name: form.name,
        description: form.description || undefined,
        criteriaType: form.criteriaType as any,
        threshold: Number(form.threshold),
        bonusType: form.bonusType as any,
        bonusValue: Number(form.bonusValue),
        applyOn: form.applyOn as any,
        styleId: form.styleId !== "none" ? (form.styleId as any) : undefined,
        sectionId: form.sectionId !== "none" ? (form.sectionId as any) : undefined,
        active: !!form.active,
        effectiveDate: form.effectiveDate || undefined,
        endDate: form.endDate || undefined,
      });
      toast.success("Bonus rule created");
      setForm({
        name: "",
        description: "",
        criteriaType: "quantity",
        threshold: "",
        bonusType: "percent",
        bonusValue: "",
        applyOn: "wage",
        styleId: "none",
        sectionId: "none",
        active: true,
        effectiveDate: "",
        endDate: "",
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to create rule");
    }
  };

  const onToggleActive = async (rule: any) => {
    try {
      await updateRule({ ruleId: rule._id, active: !rule.active });
      toast.success(`Rule ${!rule.active ? "activated" : "deactivated"}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update rule");
    }
  };

  const onDelete = async (rule: any) => {
    if (!confirm(`Delete rule "${rule.name}"?`)) return;
    try {
      await deleteRule({ ruleId: rule._id });
      toast.success("Rule deleted");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete rule");
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner className="mb-4 mx-auto" />
          <p className="text-muted-foreground">Loading bonuses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-sans font-bold">Bonuses</h1>
        <p className="text-base lg:text-lg text-muted-foreground mt-2">Configure organization bonus rules</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Bonus Rule</CardTitle>
          <CardDescription>Define thresholds and how bonuses are applied</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Quantity > 500 gets 5%" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" />
            </div>
            <div>
              <Label>Criteria Type</Label>
              <Select value={form.criteriaType} onValueChange={(v) => setForm({ ...form, criteriaType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantity">Quantity</SelectItem>
                  <SelectItem value="wage">Wage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Threshold</Label>
              <Input type="number" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} placeholder="e.g. 500" />
            </div>
            <div>
              <Label>Bonus Type</Label>
              <Select value={form.bonusType} onValueChange={(v) => setForm({ ...form, bonusType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bonus Value</Label>
              <Input type="number" value={form.bonusValue} onChange={(e) => setForm({ ...form, bonusValue: e.target.value })} placeholder="e.g. 5 or 100" />
            </div>
            <div>
              <Label>Apply On</Label>
              <Select value={form.applyOn} onValueChange={(v) => setForm({ ...form, applyOn: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wage">Wage</SelectItem>
                  <SelectItem value="quantity">Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Style (optional)</Label>
              <Select value={form.styleId} onValueChange={(v) => setForm({ ...form, styleId: v })}>
                <SelectTrigger><SelectValue placeholder="All styles" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All styles</SelectItem>
                  {(styles || []).map((s: any) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section (optional)</Label>
              <Select value={form.sectionId} onValueChange={(v) => setForm({ ...form, sectionId: v })}>
                <SelectTrigger><SelectValue placeholder="All sections" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All sections</SelectItem>
                  {(sections || []).map((sec: any) => (
                    <SelectItem key={sec._id} value={sec._id}>{sec.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Active</Label>
              <Select value={String(form.active)} onValueChange={(v) => setForm({ ...form, active: v === "true" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Effective Date (optional)</Label>
              <Input type="date" value={form.effectiveDate} onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })} />
            </div>
            <div>
              <Label>End Date (optional)</Label>
              <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <Button onClick={onCreate}>Create Rule</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Rules</CardTitle>
          <CardDescription>Manage and apply bonus rules</CardDescription>
        </CardHeader>
        <CardContent>
          {!rules ? (
            <div className="py-10 text-center"><LoadingSpinner className="mx-auto" /></div>
          ) : rules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rules yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((r: any) => (
                    <TableRow key={r._id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>
                        {r.criteriaType} &gt; {r.threshold}
                      </TableCell>
                      <TableCell>
                        {r.bonusType === 'percent' ? `${r.bonusValue}% of ${r.applyOn}` : `৳${Number(r.bonusValue).toFixed(2)}`}
                      </TableCell>
                      <TableCell>
                        {(r.sectionId || r.styleId) ? (
                          <div className="text-sm text-muted-foreground">
                            {r.sectionId ? `Section: ${sections?.find((s:any)=>s._id===r.sectionId)?.name || r.sectionId}` : null}
                            {r.sectionId && r.styleId ? ", " : null}
                            {r.styleId ? `Style: ${styles?.find((s:any)=>s._id===r.styleId)?.name || r.styleId}` : null}
                          </div>
                        ) : "All"}
                      </TableCell>
                      <TableCell>
                        {r.active ? <span className="text-green-600">Active</span> : <span className="text-muted-foreground">Inactive</span>}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => onToggleActive(r)}>
                          {r.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(r)}>
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
