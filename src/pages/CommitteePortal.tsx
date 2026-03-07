import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Vote, Megaphone, AlertTriangle, BarChart3, Plus, CheckCircle, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";

const upcomingElections = [
  { sector: "Main Sector Amir", date: "April 15, 2026", status: "Nominations Open", candidates: 4 },
  { sector: "Qira'at Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Academic Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Financial Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Social Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
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
];

const reports = [
  { title: "Monthly Activity Report — Feb 2026", date: "March 1, 2026" },
  { title: "Election Oversight Report", date: "Feb 20, 2026" },
  { title: "Financial Audit Summary", date: "Feb 15, 2026" },
];

const CommitteePortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Committee Portal</h1>
          <p className="text-muted-foreground font-body text-sm">Elections, announcements, grievances & oversight</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Vote, label: "Elections", value: "5 upcoming", gradient: "gradient-teal" },
            { icon: Megaphone, label: "Announcements", value: "12 active", gradient: "gradient-pink" },
            { icon: AlertTriangle, label: "Grievances", value: "2 pending", gradient: "gradient-gold" },
            { icon: BarChart3, label: "Reports", value: "8 this month", gradient: "gradient-blue" },
          ].map((stat) => (
            <Card key={stat.label} className="gamification-card">
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 rounded-xl ${stat.gradient} flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-body text-sm font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="elections" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="elections" className="font-body text-xs py-2">Elections</TabsTrigger>
            <TabsTrigger value="announcements" className="font-body text-xs py-2">Announce</TabsTrigger>
            <TabsTrigger value="grievances" className="font-body text-xs py-2">Grievances</TabsTrigger>
            <TabsTrigger value="reports" className="font-body text-xs py-2">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="elections" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-bold">Upcoming Elections</h3>
              <Button size="sm" className="font-body text-xs"><Plus className="mr-1 h-3 w-3" /> Schedule</Button>
            </div>
            {upcomingElections.map((e, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
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

          <TabsContent value="announcements" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-bold">Announcements</h3>
              <Button size="sm" className="font-body text-xs"><Plus className="mr-1 h-3 w-3" /> New</Button>
            </div>
            {announcements.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
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

          <TabsContent value="grievances" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-bold">Grievances</h3>
              <Button size="sm" className="font-body text-xs"><Plus className="mr-1 h-3 w-3" /> Submit</Button>
            </div>
            {grievances.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {g.status === "Resolved" ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" /> : <Clock className="h-5 w-5 text-muted-foreground shrink-0" />}
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

          <TabsContent value="reports" className="mt-4 space-y-3">
            <h3 className="font-display text-lg font-bold">Reports & Documents</h3>
            {reports.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-body text-sm font-medium">{r.title}</p>
                        <p className="font-body text-xs text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="font-body text-xs">View</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommitteePortal;
