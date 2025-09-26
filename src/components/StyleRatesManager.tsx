"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function isActiveOn(date: string, eff: string, end?: string | null) {
  if (end == null || end === "") return eff <= date;
  return eff <= date && date <= end;
}

export default function StyleRatesManager({ styleId, today }: { styleId: string; today: string }) {
  const rates = useQuery(api.styles.getStyleRates, { styleId: styleId as any });
  const current = useQuery(api.styles.getStyleRate, { styleId: styleId as any, date: today });
  const updateStyleRate = useMutation(api.styles.updateStyleRate);
  const deleteStyleRate = useMutation(api.styles.deleteStyleRate);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ rate: string; effectiveDate: string; endDate: string }>({ rate: "", effectiveDate: "", endDate: "" });

  const sortedRates = useMemo(() => {
    if (!rates) return [] as any[];
    return [...rates].sort((a: any, b: any) => b.effectiveDate.localeCompare(a.effectiveDate));
  }, [rates]);

  function startEdit(r: any) {
    setEditingId(r._id);
    setForm({ rate: String(r.rate), effectiveDate: r.effectiveDate, endDate: r.endDate || "" });
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await updateStyleRate({
      styleRateId: editingId as any,
      rate: parseFloat(form.rate || "0"),
      effectiveDate: form.effectiveDate,
      endDate: form.endDate || undefined,
    });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this rate?")) return;
    await deleteStyleRate({ styleRateId: id as any });
  }

  return (
    <div className="p-3 border rounded-md">
      <div className="mb-3">
        <div className="text-sm text-muted-foreground">Current rate (as of {today}):</div>
        <div className="text-base font-medium">
          {current ? `৳${Number(current.rate).toFixed(2)} — ${current.effectiveDate} to ${current.endDate || "open"}` : "No active rate"}
        </div>
      </div>

      <div className="space-y-3">
        {sortedRates.length === 0 ? (
          <div className="text-sm text-muted-foreground">No rates yet.</div>
        ) : (
          sortedRates.map((r: any) => {
            const active = isActiveOn(today, r.effectiveDate, r.endDate);
            const isEditing = editingId === r._id;
            return (
              <div key={r._id} className="p-3 rounded-md border flex flex-col gap-2">
                {!isEditing ? (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium">৳{Number(r.rate).toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {r.effectiveDate} to {r.endDate || "open"}
                        {active && <span className="ml-2 inline-block text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Active</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(r)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(r._id)}>Delete</Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
                    <div>
                      <Label>Rate</Label>
                      <Input type="number" step="0.01" min="0" value={form.rate} onChange={(e)=>setForm(f=>({...f, rate: e.target.value}))} />
                    </div>
                    <div>
                      <Label>Effective Date</Label>
                      <Input type="date" value={form.effectiveDate} onChange={(e)=>setForm(f=>({...f, effectiveDate: e.target.value}))} />
                    </div>
                    <div>
                      <Label>End Date (optional)</Label>
                      <Input type="date" value={form.endDate} onChange={(e)=>setForm(f=>({...f, endDate: e.target.value}))} min={form.effectiveDate || undefined} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save</Button>
                      <Button type="button" variant="outline" size="sm" onClick={()=>setEditingId(null)}>Cancel</Button>
                    </div>
                  </form>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
