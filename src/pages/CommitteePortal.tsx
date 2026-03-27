import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Vote, Megaphone, AlertTriangle, BarChart3, Plus, CheckCircle, Clock, FileText, Calendar, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const upcomingElections = [
  { sector: "Main Sector Amir", date: "April 15, 2026", status: "Nominations Open", candidates: 4 },
  { sector: "Qira'at Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Academic Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
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

const quickFeatures = [
  { icon: "📋", title: "Task Progress", value: "85%", desc: "8 of 10 tasks complete" },
  { icon: "📅", title: "Event Planning", value: "3", desc: "Upcoming events" },
  { icon: "📊", title: "Reports", value: "12", desc: "This month" },
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
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Assalamu Alaikum, Committee!</h1>
              <p className="text-muted-foreground font-body text-sm">Elections, announcements & oversight</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Feature Cards */}
        <div className="grid grid-cols-3 gap-3">
          {quickFeatures.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className="gamification-card">
                <CardContent className="p-3 text-center">
                  <span className="text-2xl block mb-1">{f.icon}</span>
                  <p className="font-display text-lg font-bold">{f.value}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{f.title}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="elections" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="elections" className="font-body text-xs py-2">🗳️ Elections</TabsTrigger>
            <TabsTrigger value="announcements" className="font-body text-xs py-2">📢 Announce</TabsTrigger>
            <TabsTrigger value="grievances" className="font-body text-xs py-2">⚠️ Grievances</TabsTrigger>
          </TabsList>

          <TabsContent value="elections" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-bold">Upcoming Elections</h3>
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> Schedule</Button>
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
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> New</Button>
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
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> Submit</Button>
            </div>
            {grievances.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {g.status === "Resolved" ? <CheckCircle className="h-5 w-5 text-green shrink-0" /> : <Clock className="h-5 w-5 text-muted-foreground shrink-0" />}
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
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default CommitteePortal;
