import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, LogOut, Users } from "lucide-react";
import {
  getAvailableMonthsForAdmin,
  getCurrentAdmin,
  getCurrentMonth,
  getHighUsageUsers,
  getUsageRecordsForAdmin,
  getUsers,
  logoutAdmin,
} from "@/lib/store";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const admin = getCurrentAdmin();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [months, setMonths] = useState<string[]>([getCurrentMonth()]);

  const users = getUsers();
  const usageRecords = getUsageRecordsForAdmin(selectedMonth);
  const highUsageUsers = getHighUsageUsers(selectedMonth);

  useEffect(() => {
    if (!admin) {
      navigate("/admin/login");
      return;
    }

    const allMonths = getAvailableMonthsForAdmin();
    setMonths(allMonths);
    if (!allMonths.includes(selectedMonth)) {
      setSelectedMonth(allMonths[0]);
    }
  }, []);

  const formatMonth = (month: string) => new Date(`${month}-01`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <p className="text-primary-foreground font-bold text-lg">Admin Dashboard</p>
            <p className="text-primary-foreground/80 text-xs">{admin?.username}</p>
          </div>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <h1 className="text-2xl font-bold text-foreground">System Overview</h1>
          <div className="space-y-1">
            <label htmlFor="admin-month" className="text-xs font-medium text-muted-foreground">Select Month</label>
            <select
              id="admin-month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {months.map(month => (
                <option key={month} value={month}>{formatMonth(month)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">Users</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Database className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">Usage Records</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{usageRecords.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <span className="text-xs text-muted-foreground">High Usage</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{highUsageUsers.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Service No</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Location</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b border-border/50">
                        <td className="py-2">{user.serviceNumber}</td>
                        <td>{user.name}</td>
                        <td>{user.location}</td>
                        <td>{user.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>High Usage Users ({formatMonth(selectedMonth)})</CardTitle>
          </CardHeader>
          <CardContent>
            {highUsageUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high-usage users for this month.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-muted-foreground font-medium">Service No</th>
                      <th className="text-left py-2 text-muted-foreground font-medium">Name</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Units</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Bill</th>
                      <th className="text-right py-2 text-muted-foreground font-medium">Max Daily</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highUsageUsers.map(user => (
                      <tr key={user.userId} className="border-b border-border/50">
                        <td className="py-2">{user.serviceNumber}</td>
                        <td>{user.name}</td>
                        <td className="text-right">{user.totalUnits}</td>
                        <td className="text-right text-primary font-medium">₹{user.totalBill.toLocaleString()}</td>
                        <td className="text-right">{user.maxDailyUsage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;