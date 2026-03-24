import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser, addUsageRecord, getUsagePreview, isOTPVerified } from "@/lib/store";
import { PlusCircle, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AddUsage = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { toast } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reading, setReading] = useState("");
  const [preview, setPreview] = useState<{ dailyUsage: number; amount: number; totalUnits: number; totalBill: number } | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (!isOTPVerified()) navigate("/otp");
  }, []);

  const handlePreview = () => {
    if (!user) return;
    const val = parseFloat(reading);
    if (isNaN(val) || val < 0) return;
    const result = getUsagePreview(user.id, date, val);
    setPreview({
      dailyUsage: result.dailyUsage,
      amount: result.amount,
      totalUnits: result.totalUnits,
      totalBill: result.totalBill,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const val = parseFloat(reading);
    if (isNaN(val) || val < 0) {
      toast({ title: "Invalid reading", description: "Please enter a valid meter reading.", variant: "destructive" });
      return;
    }
    const record = addUsageRecord(user.id, date, val);
    toast({
      title: "Reading added!",
      description: `${record.dailyUsage} units used • ₹${record.amount} bill`,
    });
    if (record.dailyUsage > 6) {
      toast({ title: "⚠️ High Usage Alert", description: `Daily usage of ${record.dailyUsage} units exceeds 6 units!`, variant: "destructive" });
    }
    setReading("");
    setPreview(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              Add Meter Reading
            </CardTitle>
            <CardDescription>Enter your daily electricity meter reading</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading">Meter Reading (kWh)</Label>
                <Input id="reading" type="number" placeholder="Enter current meter reading" value={reading} onChange={e => { setReading(e.target.value); setPreview(null); }} min="0" step="0.01" required />
              </div>

              <Button type="button" variant="outline" className="w-full" onClick={handlePreview}>
                <Calculator className="w-4 h-4 mr-2" /> Preview Bill
              </Button>

              {preview && (
                <div className="bg-accent/60 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-foreground">Bill Preview (Slab-based)</h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-card rounded-md p-2 border border-border/50">
                      <p className="text-muted-foreground">Today's Usage</p>
                      <p className="font-semibold text-foreground">{preview.dailyUsage} units</p>
                    </div>
                    <div className="bg-card rounded-md p-2 border border-border/50">
                      <p className="text-muted-foreground">Today's Added Bill</p>
                      <p className="font-semibold text-primary">₹{preview.amount.toLocaleString()}</p>
                    </div>
                    <div className="bg-card rounded-md p-2 border border-border/50">
                      <p className="text-muted-foreground">Month Total Units</p>
                      <p className="font-semibold text-foreground">{preview.totalUnits} units</p>
                    </div>
                    <div className="bg-card rounded-md p-2 border border-border/50">
                      <p className="text-muted-foreground">Month Total Bill</p>
                      <p className="font-semibold text-primary">₹{preview.totalBill.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground border-t border-border pt-2 space-y-1">
                    <p>0–100 units: Free</p>
                    <p>101–200 units: ₹5/unit</p>
                    <p>Above 200 units: ₹7/unit</p>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
                <PlusCircle className="w-4 h-4 mr-2" /> Submit Reading
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddUsage;
