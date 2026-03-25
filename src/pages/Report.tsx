import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { getAvailableMonths, getCurrentMonth, getCurrentUser, getTotalUsage, getUsageRecords, isOTPVerified, type UsageRecord } from "@/lib/store";
import { FileText, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Report = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [availableMonths, setAvailableMonths] = useState<string[]>([getCurrentMonth()]);
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [totals, setTotals] = useState(getTotalUsage(user?.id || "", getCurrentMonth()));

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isOTPVerified()) navigate("/otp");
    else {
      const months = getAvailableMonths(user.id);
      setAvailableMonths(months);
      if (!months.includes(selectedMonth)) {
        setSelectedMonth(months[0]);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setRecords(getUsageRecords(user.id, selectedMonth));
    setTotals(getTotalUsage(user.id, selectedMonth));
  }, [selectedMonth, user]);

  const formatMonth = (month: string) => new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const generatePDF = () => {
    if (!user) return;
    const doc = new jsPDF();
    const monthLabel = formatMonth(selectedMonth);

    // Header
    doc.setFillColor(41, 121, 204);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Smart Electricity Usage Planner", 15, 20);
    doc.setFontSize(11);
    doc.text(`Electricity Bill Report - ${monthLabel}`, 15, 30);

    // User Info
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    let y = 55;
    doc.text(`Name: ${user.name}`, 15, y);
    doc.text(`Service No: ${user.serviceNumber}`, 110, y);
    y += 8;
    doc.text(`Location: ${user.location}`, 15, y);
    doc.text(`Email: ${user.email}`, 110, y);
    y += 8;
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 15, y);

    // Summary
    y += 15;
    doc.setFillColor(230, 240, 255);
    doc.roundedRect(15, y, 180, 25, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(41, 121, 204);
    doc.text(`Total Units: ${totals.totalUnits}`, 25, y + 10);
    doc.text(`Total Bill: Rs.${totals.totalBill.toLocaleString()}`, 90, y + 10);
    doc.text(`Records: ${records.length}`, 155, y + 10);

    // Table
    y += 35;
    const tableData = records.map(r => [
      new Date(r.date).toLocaleDateString('en-IN'),
      r.meterReading.toString(),
      r.dailyUsage.toString(),
      `Rs.${r.amount}`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Date", "Meter Reading", "Daily Usage (units)", "Amount"]],
      body: tableData,
      theme: "striped",
      headStyles: { fillColor: [41, 121, 204], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [230, 240, 255] },
      styles: { fontSize: 10 },
    });

    // Slab info
    const finalY = (doc as any).lastAutoTable?.finalY || y + 20;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Slab rates: 0-100 units = Free | 101-200 units = Rs.5/unit | Above 200 = Rs.7/unit", 15, finalY + 10);

    doc.save(`electricity-report-${user.serviceNumber}.pdf`);
    toast({ title: "PDF Downloaded!", description: "Your electricity report has been saved." });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Electricity Bill Report
            </CardTitle>
            <CardDescription>Generate and download your usage report as PDF for {formatMonth(selectedMonth)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="report-month" className="text-xs font-medium text-muted-foreground">Select Month (History)</label>
              <select
                id="report-month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>{formatMonth(month)}</option>
                ))}
              </select>
            </div>

            {/* Preview */}
            <div className="bg-accent/40 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Total Units</p>
                  <p className="text-xl font-bold text-foreground">{totals.totalUnits}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Bill</p>
                  <p className="text-xl font-bold text-primary">₹{totals.totalBill.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Records</p>
                  <p className="text-xl font-bold text-foreground">{records.length}</p>
                </div>
              </div>
            </div>

            {records.length > 0 && (
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Reading</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Units</th>
                      <th className="text-right py-2 font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(r => (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-2">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                        <td className="text-right">{r.meterReading}</td>
                        <td className="text-right">{r.dailyUsage}</td>
                        <td className="text-right text-primary font-medium">₹{r.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Button onClick={generatePDF} className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90" disabled={records.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              {records.length === 0 ? "No data to export" : "Download PDF Report"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Report;
