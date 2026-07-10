import { AppLayout } from "@/components/layout/AppLayout";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Vote, Megaphone, BarChart3, Plus, CheckCircle, Clock, FileText, Calendar, Shield, AlertTriangle, Settings, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const upcomingElections = [
  { sector: "Main Sector Amir", date: "April 15, 2026", status: "Nominations Open", candidates: 4 },
  { sector: "Qira'at Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Academic Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Financial Sector Amir", date: "April 20, 2026", status: "Upcoming", candidates: 0 },
];

const announcements = [
  { title: "Annual Election Schedule Released", date: "March 1, 2026", priority: "high" },
  { title: "New Grievance Submission Form Available", date: "Feb 28, 2026", priority: "normal" },
  { title: "Committee Meeting Minutes — February", date: "Feb 25, 2026", priority: "normal" },
];

const grievances = [
  { id: "GR-001", subject: "Meal quality concerns", submitted: "March 3, 2026", status: "Under Review" },
  { id: "GR-002", subject: "Prayer room maintenance", submitted: "March 1, 2026", status: "Resolved" },
  { id: "GR-003", subject: "Group scheduling conflict", submitted: "Feb 28, 2026", status: "Pending" },
  { id: "GR-004", subject: "Library access hours", submitted: "Feb 20, 2026", status: "Resolved" },
];

const oversightReports = [
  { sector: "Financial Sector", status: "Reviewed", date: "March 15, 2026" },
  { sector: "Academic Sector", status: "Pending Review", date: "March 10, 2026" },
  { sector: "Social Sector", status: "Reviewed", date: "March 5, 2026" },
];

const CommitteePortal = () => {
  const { profile } = useAuth();

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Committee Dashboard</h1>
              <p className="text-muted-foreground font-body text-sm">Elections, oversight & governance</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: "🗳️", title: "Elections", value: upcomingElections.length, desc: "Upcoming" },
            { icon: "⚠️", title: "Grievances", value: grievances.filter(g => g.status !== "Resolved").length, desc: "Open" },
            { icon: "📊", title: "Reports", value: oversightReports.length, desc: "This month" },
            { icon: "📋", title: "Resolutions", value: grievances.filter(g => g.status === "Resolved").length, desc: "Resolved" },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="border border-border bg-card">
                <CardContent className="p-3 text-center">
                  <span className="text-2xl block mb-1">{f.icon}</span>
                  <p className="font-display text-lg font-bold">{f.value}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{f.title} • {f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="elections" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="elections" className="font-body text-xs py-2">🗳️ Elections</TabsTrigger>
            <TabsTrigger value="announcements" className="font-body text-xs py-2">📢 Announce</TabsTrigger>
            <TabsTrigger value="grievances" className="font-body text-xs py-2">⚠️ Grievances</TabsTrigger>
            <TabsTrigger value="oversight" className="font-body text-xs py-2">👁️ Oversight</TabsTrigger>
          </TabsList>

          <TabsContent value="elections" className="mt-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-lg font-bold">Upcoming Elections</h3>
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> Schedule</Button>
            </div>
            {upcomingElections.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Vote className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-body text-sm font-medium">{e.sector}</p>
                        <p className="font-body text-xs text-muted-foreground">{e.date} • {e.candidates} candidates</p>
                      </div>
                    </div>
                    <Badge variant={e.status === "Nominations Open" ? "default" : "secondary"} className="font-body text-[10px]">
                      {e.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="announcements" className="mt-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-lg font-bold">Announcements</h3>
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> New</Button>
            </div>
            {announcements.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Megaphone className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-body text-sm font-medium">{a.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{a.date}</p>
                      </div>
                    </div>
                    {a.priority === "high" && <Badge variant="destructive" className="font-body text-[10px]">Important</Badge>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="grievances" className="mt-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-lg font-bold">Grievances</h3>
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> Submit</Button>
            </div>
            {grievances.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {g.status === "Resolved" ? <CheckCircle className="h-5 w-5 text-green shrink-0" /> : <AlertTriangle className="h-5 w-5 text-gold shrink-0" />}
                      <div>
                        <p className="font-body text-sm font-medium">{g.subject}</p>
                        <p className="font-body text-xs text-muted-foreground">{g.id} • {g.submitted}</p>
                      </div>
                    </div>
                    <Badge variant={g.status === "Resolved" ? "secondary" : "outline"} className="font-body text-[10px]">{g.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="oversight" className="mt-4 space-y-2">
            <h3 className="font-display text-lg font-bold mb-2">Sector Oversight Reports</h3>
            {oversightReports.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-body text-sm font-medium">{r.sector}</p>
                        <p className="font-body text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <Badge variant={r.status === "Reviewed" ? "secondary" : "outline"} className="font-body text-[10px]">{r.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <Button variant="outline" className="w-full rounded-xl font-body mt-3">
              <FileText className="mr-2 h-4 w-4" /> Generate Full Report
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommitteePortal;
