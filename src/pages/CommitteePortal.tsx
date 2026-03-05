import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Vote, Megaphone, AlertTriangle, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const upcomingElections = [
  { sector: "Main Sector Amir", date: "April 15, 2026", status: "Nominations Open", candidates: 4 },
  { sector: "Qira'at Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
  { sector: "Academic Sector Amir", date: "April 15, 2026", status: "Upcoming", candidates: 0 },
];

const recentAnnouncements = [
  { title: "Annual Election Schedule Released", date: "March 1, 2026", priority: "high" },
  { title: "New Grievance Submission Form Available", date: "Feb 28, 2026", priority: "normal" },
  { title: "Committee Meeting Minutes — February", date: "Feb 25, 2026", priority: "normal" },
];

const CommitteePortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Committee Portal</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Elections management, announcements & oversight</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Vote, label: "Elections", value: "3 upcoming" },
            { icon: Megaphone, label: "Announcements", value: "12 active" },
            { icon: AlertTriangle, label: "Grievances", value: "2 pending" },
            { icon: BarChart3, label: "Reports", value: "8 this month" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-3 text-center">
                <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-body text-sm font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Upcoming Elections</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {upcomingElections.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="font-body text-sm font-medium">{e.sector}</p>
                  <p className="font-body text-xs text-muted-foreground">{e.date}</p>
                </div>
                <Badge variant={e.status === "Nominations Open" ? "default" : "secondary"} className="font-body text-[10px]">
                  {e.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg">Recent Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentAnnouncements.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="font-body text-sm font-medium">{a.title}</p>
                  <p className="font-body text-xs text-muted-foreground">{a.date}</p>
                </div>
                {a.priority === "high" && <Badge variant="destructive" className="font-body text-[10px]">Important</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CommitteePortal;
