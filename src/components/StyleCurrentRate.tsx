"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function StyleCurrentRate({ styleId, date }: { styleId: string; date: string }) {
  const rate = useQuery(api.styles.getStyleRate, styleId && date ? { styleId: styleId as any, date } : "skip");
  if (rate === undefined) return <span className="text-muted-foreground">—</span>;
  if (!rate) return <span className="text-muted-foreground">No rate</span>;
  return <span>৳{Number(rate.rate).toFixed(2)}</span>;
}
