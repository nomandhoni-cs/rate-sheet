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
import WorkerSelect from "@/components/WorkerSelect";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PayrollPage() {
  const { user } = useUser();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBonusRuleId, setSelectedBonusRuleId] = useState<string>("none");
  const [showPayroll, setShowPayroll] = useState(false);
  const [customColName, setCustomColName] = useState<string>("");

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

  const organization = useQuery(
    api.organizations.getOrganization,
    userData?.organizationId ? { organizationId: userData.organizationId as any } : "skip"
  );

  // Cast to any to avoid TS error until Convex codegen includes bonuses module
  const bonusRules = useQuery(
    (api as any).bonuses.listActiveBonusRules,
    userData?.organizationId ? { organizationId: userData.organizationId as any, onDate: endDate || undefined } : "skip"
  );

  const payrollData = useQuery(
    api.productionLogs.calculateWorkerPayroll,
    selectedWorkerId && startDate && endDate && showPayroll
      ? {
        workerId: selectedWorkerId as any,
        startDate,
        endDate,
        bonusRuleId: selectedBonusRuleId !== "none" ? (selectedBonusRuleId as any) : undefined,
      }
      : "skip"
  );

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  const handleCalculatePayroll = () => {
    if (selectedWorkerId && startDate && endDate) {
      setShowPayroll(true);
    }
  };

  const handleReset = () => {
    setSelectedWorkerId("");
    setStartDate("");
    setEndDate("");
    setSelectedBonusRuleId("none");
    setShowPayroll(false);
  };

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

  function exportPayrollCSV() {
    if (!payrollData) return;
    const orgName = organization?.name ?? "Organization";
    const workerName = workers?.find((w) => w._id === selectedWorkerId)?.name ?? "Worker";
    const header = ["Date", "Style", "Quantity", "Rate", "Pay", ...(customColName.trim() ? [customColName.trim()] : [])];
    const rows = [
      ["Organization", orgName],
      ["Worker", workerName],
      ["Period", `${startDate} to ${endDate}`],
      ...(payrollData.bonus && payrollData.bonus.applied ? [["Bonus Rule", payrollData.bonus.name]] : []),
      [],
      header,
      ...payrollData.details.map((d: any) => [
        d.productionDate,
        d.style?.name ?? "",
        String(d.quantity),
        String(d.rate),
        String(d.pay),
        ...(customColName.trim() ? [""] : []),
      ]),
      [],
      ["Base Total Pay", String(payrollData.totalPay)],
      ...(payrollData.bonus ? [["Bonus Amount", String(payrollData.bonus.bonusAmount)]] : []),
      ["Total With Bonus", String(payrollData.totalWithBonus)],
    ];
    const csv = rows.map(r => r.map(v => `"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    download(`payroll-${workerName}-${startDate}-${endDate}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportPayrollPDF() {
    if (!payrollData) return;
    const orgName = organization?.name ?? "Organization";
    const workerName = workers?.find((w) => w._id === selectedWorkerId)?.name ?? "Worker";
    const headerCols = ["Date", "Style", "Quantity", "Rate", "Pay", ...(customColName.trim() ? [customColName.trim()] : [])];
    const tableRows = payrollData.details.map((d: any) => `
      <tr>
        <td>${d.productionDate}</td>
        <td>${d.style?.name ?? ""}</td>
        <td>${d.quantity}</td>
        <td>৳${d.rate.toFixed(2)}</td>
        <td>৳${d.pay.toFixed(2)}</td>
        ${customColName.trim() ? '<td></td>' : ''}
      </tr>
    `).join("");
    const bonusHtml = payrollData.bonus ? `
      <h2>Bonus</h2>
      <div><strong>Rule:</strong> ${payrollData.bonus.name}</div>
      <div><strong>Criteria:</strong> ${payrollData.bonus.criteriaType} > ${payrollData.bonus.threshold} (value: ${payrollData.bonus.criteriaValue})</div>
      <div><strong>Bonus:</strong> ${payrollData.bonus.bonusType === 'percent' ? payrollData.bonus.bonusValue + '%' : '৳' + payrollData.bonus.bonusValue.toFixed(2)} ${payrollData.bonus.applied ? '(Applied)' : '(Not Applied)'} </div>
      <div><strong>Bonus Amount:</strong> ৳${payrollData.bonus.bonusAmount.toFixed(2)}</div>
    ` : '';
    const html = `
      <h1>${orgName}</h1>
      <div class="muted">Generated: ${new Date().toLocaleString()}</div>
      <h2>Payroll</h2>
      <div><strong>Worker:</strong> ${workerName}</div>
      <div><strong>Period:</strong> ${startDate} to ${endDate}</div>
      <table><thead><tr>${headerCols.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows || `<tr><td colspan="${headerCols.length}">No data</td></tr>`}</tbody></table>
      ${bonusHtml}
      <h2>Total</h2>
      <div><strong>Base Total Pay:</strong> ৳${payrollData.totalPay.toFixed(2)}</div>
      <div><strong>Total With Bonus:</strong> ৳${payrollData.totalWithBonus.toFixed(2)}</div>
    `;
    printHtml(`Payroll - ${workerName}`, html);
  }

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl lg:text-4xl font-sans font-bold">Payroll Calculator</h1>
        <p className="text-base lg:text-lg text-muted-foreground mt-2">
          Calculate worker payroll based on production logs and style rates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calculate Payroll</CardTitle>
          <CardDescription>
            Select a worker and date range to calculate their payroll
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="worker">Worker</Label>
            <WorkerSelect
              organizationId={userData?.organizationId as any}
              value={selectedWorkerId}
              onChange={setSelectedWorkerId}
              placeholder="Search worker by name or ID"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <Label htmlFor="bonusRule">Bonus Rule (optional)</Label>
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

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleCalculatePayroll}
              disabled={!selectedWorkerId || !startDate || !endDate}
              className="w-full sm:w-auto"
            >
              Calculate Payroll
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full sm:w-auto"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPayroll && payrollData && (
        <Card>
          <CardHeader>
            <CardTitle>Payroll Results</CardTitle>
            <CardDescription>
              Payroll calculation for {(() => { const w = workers?.find((x)=>x._id===selectedWorkerId); return w ? `${w.name}${w.manualId ? ` (${w.manualId})` : ""}` : ""; })()} from {startDate} to {endDate}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-1">
              <div className="text-2xl font-semibold">Base Total: ৳{payrollData.totalPay.toFixed(2)}</div>
              {payrollData.bonus && (
                <div className="text-sm text-muted-foreground">
                  Bonus Rule: <span className="font-medium">{payrollData.bonus.name}</span> — {payrollData.bonus.applied ? (
                    <span className="text-green-600">Applied (+৳{payrollData.bonus.bonusAmount.toFixed(2)})</span>
                  ) : (
                    <span className="text-amber-600">Not applied</span>
                  )}
                </div>
              )}
              <div className="text-3xl font-bold text-green-600">Total With Bonus: ৳{payrollData.totalWithBonus.toFixed(2)}</div>
            </div>

            {payrollData.details.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No production logs found for the selected period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Style</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead className="text-right">Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollData.details.map((detail, index) => (
                      <TableRow key={index}>
                        <TableCell>{detail.productionDate}</TableCell>
                        <TableCell>{detail.style?.name}</TableCell>
                        <TableCell>{detail.quantity}</TableCell>
                        <TableCell>৳{detail.rate.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">
                          ৳{detail.pay.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-4">
              <Label htmlFor="payrollCustomCol">Custom Column (optional)</Label>
              <Input id="payrollCustomCol" placeholder="e.g., Notes" value={customColName} onChange={(e)=>setCustomColName(e.target.value)} />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button onClick={exportPayrollCSV} variant="outline" className="w-full sm:w-auto">Export CSV</Button>
              <Button onClick={exportPayrollPDF} className="w-full sm:w-auto">Export PDF</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
