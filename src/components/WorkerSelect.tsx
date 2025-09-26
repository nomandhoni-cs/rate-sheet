"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type WorkerSelectProps = {
  organizationId?: string;
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export default function WorkerSelect({
  organizationId,
  value,
  onChange,
  placeholder = "Select a worker",
  disabled,
}: WorkerSelectProps) {
  const [search, setSearch] = useState("");
  const workers = useQuery(
    api.workers.getAllWorkers,
    organizationId ? { organizationId: organizationId as any } : "skip"
  );

  const filtered = useMemo(() => {
    if (!workers) return [] as any[];
    const q = search.trim().toLowerCase();
    if (!q) return workers as any[];
    return (workers as any[]).filter((w) => {
      const name = (w.name || "").toLowerCase();
      const id = (w.manualId || "").toLowerCase();
      const section = (w.section?.name || "").toLowerCase();
      return name.includes(q) || id.includes(q) || section.includes(q);
    });
  }, [workers, search]);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="min-w-[260px]">
        <div className="p-2 sticky top-0 bg-popover z-10">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or section"
          />
        </div>
        {filtered?.length ? (
          filtered.map((w: any) => (
            <SelectItem key={w._id} value={w._id}>
              {w.name}
              {w.manualId ? ` (${w.manualId})` : ""}
              {w.section?.name ? ` – ${w.section.name}` : ""}
            </SelectItem>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">No workers</div>
        )}
      </SelectContent>
    </Select>
  );
}
