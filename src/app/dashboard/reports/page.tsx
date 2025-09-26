"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
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

export default function ReportsPage() {
  const { user } = useUser();
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [selectedBonusRuleId, setSelectedBonusRuleId] = useState<string>("none");
  const [workerCols, setWorkerCols] = useState({
    sl: true,
    style: true,
    buyer: false,
    quantity: true,
    rate: true,
    amount: true,
    remarks: false,
  });
  const [customColName, setCustomColName] = useState<string>("");
  const [sectionCustomColName, setSectionCustomColName] = useState<string>("");
  const [styleCustomColName, setStyleCustomColName] = useState<string>("");

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

  const styles = useQuery(
    api.styles.getAllStyles,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const workers = useQuery(
    api.workers.getAllWorkers,
    userData?.organizationId
      ? { organizationId: userData.organizationId }
      : "skip"
  );

  const organization = useQuery(
    api.organizations.getOrganization,
    userData?.organizationId ? { organizationId: userData.organizationId as any } : "skip"
  );

  // Active bonus rules for optional application in reports' worker payroll
  const bonusRules = useQuery(
    (api as any).bonuses.listActiveBonusRules,
    userData?.organizationId ? { organizationId: userData.organizationId as any, onDate: endDate || undefined } : "skip"
  );

  const sectionSummary = useQuery(
    api.sections.getSectionSummary,
    selectedSectionId && startDate && endDate
      ? {
          sectionId: selectedSectionId as any,
          startDate,
          endDate,
        }
      : "skip"
  );

  const styleSummary = useQuery(
    api.styles.getStyleSummaryForSection,
    selectedSectionId && selectedStyleId && selectedStyleId !== "all" && startDate && endDate
      ? {
          sectionId: selectedSectionId as any,
          styleId: selectedStyleId as any,
          startDate,
          endDate,
        }
      : "skip"
  );

  const workerPayroll = useQuery(
    api.productionLogs.calculateWorkerPayroll,
    selectedWorkerId && startDate && endDate
      ? { workerId: selectedWorkerId as any, startDate, endDate, bonusRuleId: selectedBonusRuleId !== "none" ? (selectedBonusRuleId as any) : undefined }
      : "skip"
  );

  const today = new Date().toISOString().split("T")[0];

  function download(filename: string, content: string, mime: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function printHtml(title: string, bodyHtml: string) {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset='utf-8'/><title>${title}</title>
      <style>
        @page { size: A4; margin: 14mm; }
        body{font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, "Apple Color Emoji","Segoe UI Emoji"; padding:24px;}
        h1{font-size:22px;margin:0 0 8px}
        h2{font-size:18px;margin:16px 0 8px}
        .muted{color:#666}
        table{border-collapse:collapse;width:100%;margin-top:8px}
        th,td{border:1px solid #ddd;padding:8px;font-size:12px}
        th{text-align:left;background:#f6f6f6}
      </style>
    </head><body>${bodyHtml}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  function exportSectionSummaryCSV() {
    if (!sectionSummary) return;
    const orgName = organization?.name ?? "Organization";
    const sectionName = sections?.find(s => s._id === selectedSectionId)?.name ?? "Section";
    const rows = [
      ["Organization", orgName],
      ["Section", sectionName],
      ["Period", `${startDate} to ${endDate}`],
      [],
      ["Style", "Quantity", "Pay"],
      ...sectionSummary.styleSummaries.map((s: any) => [s.name, String(s.quantity), String(s.pay)]),
      [],
      ["Total Quantity", String(sectionSummary.totalQuantity)],
      ["Total Pay", String(sectionSummary.totalPay)],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    download(`section-summary-${sectionName}-${startDate}-${endDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportSectionSummaryPDF() {
    if (!sectionSummary) return;
    const orgName = organization?.name ?? "Organization";
    const orgAddr = [organization?.addressLine1, organization?.addressLine2, [organization?.city, organization?.state].filter(Boolean).join(", "), [organization?.postalCode, organization?.country].filter(Boolean).join(" ")].filter(Boolean).join("<br/>");
    const sectionName = sections?.find(s => s._id === selectedSectionId)?.name ?? "Section";
    const headerCols = ["Style", "Quantity", "Pay", ...(sectionCustomColName.trim() ? [sectionCustomColName.trim()] : [])];
    const tableRows = sectionSummary.styleSummaries.map((s: any) => `<tr><td>${s.name}</td><td>${s.quantity}</td><td>৳${s.pay.toFixed(2)}</td>${sectionCustomColName.trim() ? '<td></td>' : ''}</tr>`).join("");
    const html = `
      <h1>${orgName}</h1>
      ${orgAddr ? `<div class="muted">${orgAddr}</div>` : ''}
      <div class="muted">Generated: ${new Date().toLocaleString()}</div>
      <h2>Section Summary</h2>
      <div><strong>Section:</strong> ${sectionName}</div>
      <div><strong>Period:</strong> ${startDate} to ${endDate}</div>
      <table><thead><tr>${headerCols.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows || `<tr><td colspan="${headerCols.length}">No data</td></tr>`}</tbody></table>
      <h2>Totals</h2>
      <div><strong>Total Quantity:</strong> ${sectionSummary.totalQuantity}</div>
      <div><strong>Total Pay:</strong> ৳${sectionSummary.totalPay.toFixed(2)}</div>
    `;
    printHtml(`Section Summary - ${sectionName}`, html);
  }

  function exportStyleSummaryCSV() {
    if (!styleSummary) return;
    const orgName = organization?.name ?? "Organization";
    const sectionName = sections?.find(s => s._id === selectedSectionId)?.name ?? "Section";
    const styleName = styles?.find(st => st._id === selectedStyleId)?.name ?? "Style";
    const rows = [
      ["Organization", orgName],
      ["Section", sectionName],
      ["Style", styleName],
      ["Period", `${startDate} to ${endDate}`],
      [],
      ["Total Quantity", String(styleSummary.totalQuantity)],
      ["Total Pay", String(styleSummary.totalPay)],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    download(`style-summary-${styleName}-${startDate}-${endDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportStyleSummaryPDF() {
    if (!styleSummary) return;
    const orgName = organization?.name ?? "Organization";
    const orgAddr = [organization?.addressLine1, organization?.addressLine2, [organization?.city, organization?.state].filter(Boolean).join(", "), [organization?.postalCode, organization?.country].filter(Boolean).join(" ")].filter(Boolean).join("<br/>");
    const sectionName = sections?.find(s => s._id === selectedSectionId)?.name ?? "Section";
    const styleName = styles?.find(st => st._id === selectedStyleId)?.name ?? "Style";
    const headerCols = ["TITLE", "AMOUNT", ...(styleCustomColName.trim() ? [styleCustomColName.trim()] : [])];
    const html = `
      <h1>${orgName}</h1>
      ${orgAddr ? `<div class="muted">${orgAddr}</div>` : ''}
      <div class="muted">Generated: ${new Date().toLocaleString()}</div>
      <h2>Style Summary</h2>
      <div><strong>Section:</strong> ${sectionName}</div>
      <div><strong>Style:</strong> ${styleName}</div>
      <div><strong>Period:</strong> ${startDate} to ${endDate}</div>
      <h2>Totals</h2>
      <table><thead><tr>${headerCols.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>
        <tr><td>Total Quantity</td><td>${styleSummary.totalQuantity}</td>${styleCustomColName.trim() ? '<td></td>' : ''}</tr>
        <tr><td>Total Pay</td><td>৳${styleSummary.totalPay.toFixed(2)}</td>${styleCustomColName.trim() ? '<td></td>' : ''}</tr>
      </tbody></table>
    `;
    printHtml(`Style Summary - ${styleName}`, html);
  }

  // Worker report helpers
  const worker = workers?.find((w: any) => w._id === selectedWorkerId);
  const workerLines = (() => {
    if (!workerPayroll?.details) return [] as any[];
    const map = new Map<string, { styleName: string; quantity: number; amount: number; totalRate: number; entries: number }>();
    for (const d of workerPayroll.details as any[]) {
      const key = d.style?._id || d.styleId || "unknown";
      const entry = map.get(key) || { styleName: d.style?.name ?? "", quantity: 0, amount: 0, totalRate: 0, entries: 0 };
      entry.quantity += d.quantity;
      entry.amount += d.pay;
      entry.totalRate += d.rate;
      entry.entries += 1;
      map.set(key, entry);
    }
    return Array.from(map.values()).map((e, idx) => ({
      sl: idx + 1,
      style: e.styleName,
      buyer: "", // not tracked currently
      quantity: e.quantity,
      rate: e.entries ? e.totalRate / e.entries : 0,
      amount: e.amount,
      remarks: "",
      custom: "",
    }));
  })();

  function exportWorkerCSV() {
    if (!worker || !workerPayroll) return;
    const orgName = organization?.name ?? "Organization";
    const rows: string[][] = [];
    rows.push(["Organization", orgName]);
    rows.push(["Worker's Name", worker.name]);
    rows.push(["ID", worker.manualId || ""]);
    rows.push(["Section", worker.section?.name || ""]);
    rows.push(["Production Period", `${startDate} to ${endDate}`]);
    rows.push([]);
    const headers: string[] = [];
    if (workerCols.sl) headers.push("SL");
    if (workerCols.style) headers.push("Style");
    if (workerCols.buyer) headers.push("Buyer");
    if (workerCols.quantity) headers.push("Quantity");
    if (workerCols.rate) headers.push("Rate");
    if (workerCols.amount) headers.push("Amount");
    if (workerCols.remarks) headers.push("Remarks");
    if (customColName.trim()) headers.push(customColName.trim());
    rows.push(headers);
    for (const line of workerLines) {
      const r: string[] = [];
      if (workerCols.sl) r.push(String(line.sl));
      if (workerCols.style) r.push(String(line.style));
      if (workerCols.buyer) r.push(String(line.buyer));
      if (workerCols.quantity) r.push(String(line.quantity));
      if (workerCols.rate) r.push(String(line.rate.toFixed(2)));
      if (workerCols.amount) r.push(String(line.amount.toFixed(2)));
      if (workerCols.remarks) r.push(String(line.remarks));
      if (customColName.trim()) r.push("");
      rows.push(r);
    }
    rows.push([]);
    rows.push(["Total Production Quantity (Pcs)", String(workerLines.reduce((a, b) => a + b.quantity, 0))]);
    const baseTotalAmt = workerLines.reduce((a, b) => a + b.amount, 0);
    rows.push(["Base Amount (TK)", String(baseTotalAmt.toFixed(2))]);
    if ((workerPayroll as any).bonus) {
      rows.push(["Bonus Amount (TK)", String((workerPayroll as any).bonus.bonusAmount.toFixed(2))]);
      rows.push(["Total Amount (TK)", String(((workerPayroll as any).totalWithBonus ?? baseTotalAmt).toFixed(2))]);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    download(`worker-report-${worker.name}-${startDate}-${endDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportWorkerPDF() {
    if (!worker || !workerPayroll) return;
    const orgName = organization?.name ?? "Organization";
    const orgAddr = [organization?.addressLine1, organization?.addressLine2, [organization?.city, organization?.state].filter(Boolean).join(", "), [organization?.postalCode, organization?.country].filter(Boolean).join(" ")].filter(Boolean).join("<br/>");
    const headerCols: string[] = [];
    if (workerCols.sl) headerCols.push("SL");
    if (workerCols.style) headerCols.push("Style");
    if (workerCols.buyer) headerCols.push("Buyer");
    if (workerCols.quantity) headerCols.push("Quantity");
    if (workerCols.rate) headerCols.push("Rate");
    if (workerCols.amount) headerCols.push("Amount");
    if (workerCols.remarks) headerCols.push("Remarks");
    if (customColName.trim()) headerCols.push(customColName.trim());
    const rows = workerLines.map((line) => {
      const cells: string[] = [];
      if (workerCols.sl) cells.push(String(line.sl));
      if (workerCols.style) cells.push(line.style);
      if (workerCols.buyer) cells.push(line.buyer);
      if (workerCols.quantity) cells.push(String(line.quantity));
      if (workerCols.rate) cells.push(`৳${line.rate.toFixed(2)}`);
      if (workerCols.amount) cells.push(`৳${line.amount.toFixed(2)}`);
      if (workerCols.remarks) cells.push(line.remarks);
      if (customColName.trim()) cells.push("");
      return `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
    }).join("");

    const bonusHtml = workerPayroll.bonus ? `
      <h2>Bonus</h2>
      <div><strong>Rule:</strong> ${workerPayroll.bonus.name}</div>
      <div><strong>Criteria:</strong> ${workerPayroll.bonus.criteriaType} > ${workerPayroll.bonus.threshold} (value: ${workerPayroll.bonus.criteriaValue})</div>
      <div><strong>Bonus:</strong> ${workerPayroll.bonus.bonusType === 'percent' ? workerPayroll.bonus.bonusValue + '%' : '৳' + workerPayroll.bonus.bonusValue.toFixed(2)} ${workerPayroll.bonus.applied ? '(Applied)' : '(Not Applied)'} </div>
      <div><strong>Bonus Amount:</strong> ৳${workerPayroll.bonus.bonusAmount.toFixed(2)}</div>
    ` : '';

    const baseTotalAmtPdf = workerLines.reduce((a,b)=>a+b.amount,0);
    const totalWithBonusPdf = (workerPayroll.totalWithBonus ?? baseTotalAmtPdf);
    const bonusAmountPdf = workerPayroll.bonus?.bonusAmount ?? 0;

    const html = `
      <h1>${orgName}</h1>
      ${orgAddr ? `<div class="muted">${orgAddr}</div>` : ''}
      <div class="muted">Month Wise Individual Production Summary</div>
      <div style="margin-top:12px"><strong>Worker's Name:</strong> ${worker.name} &nbsp;&nbsp; <strong>ID:</strong> ${worker.manualId || ""} &nbsp;&nbsp; <strong>Section:</strong> ${worker.section?.name || ""}</div>
      <div><strong>Production Period:</strong> ${startDate} to ${endDate}</div>
      <table><thead><tr>${headerCols.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows || '<tr><td colspan="8">No data</td></tr>'}</tbody></table>
      ${bonusHtml}
      <h2>SUMMARY</h2>
      <table><thead><tr><th>TITLE</th><th>AMOUNT</th></tr></thead><tbody>
        <tr><td>Total Production Quantity (Pcs)</td><td>${workerLines.reduce((a,b)=>a+b.quantity,0)}</td></tr>
        <tr><td>Base Amount (TK)</td><td>৳${baseTotalAmtPdf.toFixed(2)}</td></tr>
        ${workerPayroll.bonus ? `<tr><td>Bonus Amount (TK)</td><td>৳${bonusAmountPdf.toFixed(2)}</td></tr>` : ''}
        <tr><td>Total Amount (TK)</td><td>৳${totalWithBonusPdf.toFixed(2)}</td></tr>
      </tbody></table>
    `;
    printHtml(`Worker Report - ${worker.name}`, html);
  }

  if (!userData || !sections || !styles) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-sans font-bold">Reports</h1>
          <p className="text-base lg:text-lg text-muted-foreground mt-2">
            Section and style summaries for a specific time period
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select a section, optional style, and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="section">Section</Label>
              <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section._id} value={section._id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="style">Style (Optional)</Label>
              <Select
                value={selectedStyleId}
                onValueChange={setSelectedStyleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All styles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All styles</SelectItem>
                  {styles.map((style) => (
                    <SelectItem key={style._id} value={style._id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={today}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={today}
                min={startDate}
              />
            </div>
          </div>
        </CardContent>
      </Card>


      

      

      <Card>
        <CardHeader>
          <CardTitle>Section Summary</CardTitle>
          <CardDescription>
            Totals for the selected section and date range. Per-style breakdown shown below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedSectionId || !startDate || !endDate ? (
            <p className="text-muted-foreground">Select a section and date range to view the summary.</p>
          ) : !sectionSummary ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading section summary...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-md border">
                  <div className="text-sm text-muted-foreground">Total Quantity</div>
                  <div className="text-2xl font-bold">{sectionSummary.totalQuantity}</div>
                </div>
                <div className="p-4 rounded-md border">
                  <div className="text-sm text-muted-foreground">Total Pay</div>
                  <div className="text-2xl font-bold">৳{sectionSummary.totalPay.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <div className="font-semibold mb-2">Per-Style Breakdown</div>
                {sectionSummary.styleSummaries.length === 0 ? (
                  <p className="text-muted-foreground">No production in this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Style</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="text-right">Pay</TableHead>
                          {sectionCustomColName.trim() && <TableHead>{sectionCustomColName.trim()}</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sectionSummary.styleSummaries.map((item, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell className="text-right">৳{item.pay.toFixed(2)}</TableCell>
                            {sectionCustomColName.trim() && <TableCell></TableCell>}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <Label htmlFor="sectionCustomCol">Custom Column (optional)</Label>
                <Input id="sectionCustomCol" placeholder="e.g., Remarks" value={sectionCustomColName} onChange={(e)=>setSectionCustomColName(e.target.value)} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={exportSectionSummaryCSV} variant="outline" className="w-full sm:w-auto">Export CSV</Button>
                <Button onClick={exportSectionSummaryPDF} className="w-full sm:w-auto">Export PDF</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Style Summary (within Section)</CardTitle>
          <CardDescription>Totals for a specific style in the selected section and date range.</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedSectionId || selectedStyleId === "all" || !startDate || !endDate ? (
            <p className="text-muted-foreground">Select a section, style, and date range to view the style summary.</p>
          ) : !styleSummary ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Loading style summary...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Total Quantity</div>
                <div className="text-2xl font-bold">{styleSummary.totalQuantity}</div>
              </div>
              <div className="p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Total Pay</div>
                <div className="text-2xl font-bold">৳{styleSummary.totalPay.toFixed(2)}</div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="styleCustomCol">Custom Column (optional)</Label>
                <Input id="styleCustomCol" placeholder="e.g., Notes" value={styleCustomColName} onChange={(e)=>setStyleCustomColName(e.target.value)} />
              </div>
              <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
                <Button onClick={exportStyleSummaryCSV} variant="outline" className="w-full sm:w-auto">Export CSV</Button>
                <Button onClick={exportStyleSummaryPDF} className="w-full sm:w-auto">Export PDF</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Worker Report</CardTitle>
          <CardDescription>Generate a worker-wise production statement for a period. You can pick which columns to include.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label htmlFor="startDateWorker">Start Date</Label>
              <Input id="startDateWorker" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} max={today} />
            </div>
            <div>
              <Label htmlFor="endDateWorker">End Date</Label>
              <Input id="endDateWorker" type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} max={today} min={startDate} />
            </div>
          </div>

          <div>
            <Label htmlFor="bonusRule">Bonus Rule for Worker Report (optional)</Label>
            <Select value={selectedBonusRuleId} onValueChange={setSelectedBonusRuleId}>
              <SelectTrigger id="bonusRule">
                <SelectValue placeholder={bonusRules ? (bonusRules.length ? "Select a bonus rule" : "No active bonus rules") : "Loading..."} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {(bonusRules || []).map((r: any) => (
                  <SelectItem key={r._id} value={r._id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="font-semibold mb-2">Columns</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
              {[
                { key: 'sl', label: 'SL' },
                { key: 'style', label: 'Style' },
                { key: 'buyer', label: 'Buyer' },
                { key: 'quantity', label: 'Quantity' },
                { key: 'rate', label: 'Rate' },
                { key: 'amount', label: 'Amount' },
                { key: 'remarks', label: 'Remarks' },
              ].map(({key, label}) => (
                <label key={key} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(workerCols as any)[key]}
                    onChange={(e) => setWorkerCols(prev => ({ ...prev, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-2">
              <Label htmlFor="customCol">Custom Column (optional)</Label>
              <Input id="customCol" placeholder="e.g., Remarks 2" value={customColName} onChange={(e)=>setCustomColName(e.target.value)} />
            </div>
          </div>

          {!selectedWorkerId || !startDate || !endDate ? (
            <p className="text-muted-foreground">Select a worker and period to preview and export.</p>
          ) : !workerPayroll ? (
            <div className="text-sm text-muted-foreground">Loading worker data...</div>
          ) : (
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {workerCols.sl && <TableHead>SL</TableHead>}
                      {workerCols.style && <TableHead>Style</TableHead>}
                      {workerCols.buyer && <TableHead>Buyer</TableHead>}
                      {workerCols.quantity && <TableHead>Quantity</TableHead>}
                      {workerCols.rate && <TableHead>Rate</TableHead>}
                      {workerCols.amount && <TableHead className="text-right">Amount</TableHead>}
                      {workerCols.remarks && <TableHead>Remarks</TableHead>}
                      {customColName.trim() && <TableHead>{customColName.trim()}</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workerLines.map((line, idx)=> (
                      <TableRow key={idx}>
                        {workerCols.sl && <TableCell>{line.sl}</TableCell>}
                        {workerCols.style && <TableCell>{line.style}</TableCell>}
                        {workerCols.buyer && <TableCell>{line.buyer}</TableCell>}
                        {workerCols.quantity && <TableCell>{line.quantity}</TableCell>}
                        {workerCols.rate && <TableCell>৳{line.rate.toFixed(2)}</TableCell>}
                        {workerCols.amount && <TableCell className="text-right">৳{line.amount.toFixed(2)}</TableCell>}
                        {workerCols.remarks && <TableCell>{line.remarks}</TableCell>}
                        {customColName.trim() && <TableCell></TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-3 rounded-md border">
                  <div className="text-sm text-muted-foreground">Total Production Quantity (Pcs)</div>
                  <div className="text-xl font-bold">{workerLines.reduce((a,b)=>a+b.quantity,0)}</div>
                </div>
                <div className="p-3 rounded-md border">
                  <div className="text-sm text-muted-foreground">Base Amount (TK)</div>
                  <div className="text-xl font-bold">৳{(workerLines.reduce((a,b)=>a+b.amount,0)).toFixed(2)}</div>
                </div>
                {workerPayroll.bonus && (
                  <div className="p-3 rounded-md border">
                    <div className="text-sm text-muted-foreground">Bonus Amount (TK)</div>
                    <div className="text-xl font-bold">৳{workerPayroll.bonus.bonusAmount.toFixed(2)}</div>
                  </div>
                )}
                <div className="p-3 rounded-md border md:col-span-1 sm:col-span-2">
                  <div className="text-sm text-muted-foreground">Total Amount (TK)</div>
                  <div className="text-xl font-bold">৳{(workerPayroll.totalWithBonus ?? workerLines.reduce((a,b)=>a+b.amount,0)).toFixed(2)}</div>
                </div>
              </div>
              {workerPayroll.bonus && (
                <div className="p-4 rounded-md border">
                  <div className="font-semibold mb-2">Bonus</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Rule:</span> {workerPayroll.bonus.name}</div>
                    <div><span className="text-muted-foreground">Applied:</span> {workerPayroll.bonus.applied ? 'Yes' : 'No'}</div>
                    <div>
                      <span className="text-muted-foreground">Bonus:</span> {workerPayroll.bonus.bonusType === 'percent' ? `${workerPayroll.bonus.bonusValue}%` : `৳${workerPayroll.bonus.bonusValue.toFixed(2)}`}
                    </div>
                    <div><span className="text-muted-foreground">Bonus Amount:</span> ৳{workerPayroll.bonus.bonusAmount.toFixed(2)}</div>
                    <div className="sm:col-span-2"><span className="text-muted-foreground">Grand Total:</span> <span className="font-semibold">৳{(workerPayroll.totalWithBonus ?? workerLines.reduce((a,b)=>a+b.amount,0)).toFixed(2)}</span></div>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={exportWorkerCSV} variant="outline" className="w-full sm:w-auto">Export CSV</Button>
                <Button onClick={exportWorkerPDF} className="w-full sm:w-auto">Export PDF</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
