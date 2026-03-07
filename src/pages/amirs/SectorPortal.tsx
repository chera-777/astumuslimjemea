import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star, BookOpen, GraduationCap, DollarSign, Users,
  ArrowLeft, CheckCircle, Clock, AlertCircle, Plus, BarChart3, Calendar
} from "lucide-react";

const sectorData: Record<string, { title: string; icon: any; gradient: string; description: string; tasks: any[]; members: any[]; reports: any[] }> = {
  main: {
    title: "Main Sector",
    icon: Star,
    gradient: "gradient-teal",
    description: "Overall leadership, coordination & community vision",
    tasks: [
      { title: "Review quarterly goals", status: "in-progress", priority: "high" },
      { title: "Coordinate inter-sector meeting", status: "pending", priority: "medium" },
      { title: "Prepare annual report", status: "completed", priority: "high" },
      { title: "University admin liaison meeting", status: "pending", priority: "high" },
    ],
    members: [
      { name: "Amir Ahmed", role: "Sector Head", status: "active" },
      { name: "Br. Hassan", role: "Deputy", status: "active" },
      { name: "Br. Yusuf", role: "Secretary", status: "active" },
    ],
    reports: [
      { title: "Q1 2026 Summary Report", date: "March 1, 2026" },
      { title: "Community Growth Analysis", date: "Feb 15, 2026" },
    ],
  },
  qiraat: {
    title: "Qira'at Sector",
    icon: BookOpen,
    gradient: "gradient-green",
    description: "Qur'an recitation, tajweed classes, hifz competitions & Zikr challenges",
    tasks: [
      { title: "Organize Hifz competition", status: "in-progress", priority: "high" },
      { title: "Schedule weekly Tajweed class", status: "completed", priority: "medium" },
      { title: "Set up Zikr challenge leaderboard", status: "pending", priority: "medium" },
      { title: "Arrange Qur'an recitation event", status: "pending", priority: "low" },
    ],
    members: [
      { name: "Amir Yusuf", role: "Sector Head", status: "active" },
      { name: "Br. Bilal", role: "Tajweed Instructor", status: "active" },
      { name: "Br. Salim", role: "Hifz Coordinator", status: "active" },
    ],
    reports: [
      { title: "Hifz Progress Tracker", date: "March 3, 2026" },
      { title: "Tajweed Class Attendance", date: "Feb 28, 2026" },
    ],
  },
  academic: {
    title: "Academic Sector",
    icon: GraduationCap,
    gradient: "gradient-blue",
    description: "Tutoring, study groups, exam reminders & academic mentoring",
    tasks: [
      { title: "Launch freshman mentoring program", status: "in-progress", priority: "high" },
      { title: "Update tutoring schedule", status: "completed", priority: "medium" },
      { title: "Organize career workshop", status: "pending", priority: "medium" },
      { title: "Create exam prep materials", status: "pending", priority: "high" },
    ],
    members: [
      { name: "Amir Ibrahim", role: "Sector Head", status: "active" },
      { name: "Br. Mustafa", role: "Tutoring Coordinator", status: "active" },
      { name: "Br. Ali", role: "Mentoring Lead", status: "active" },
    ],
    reports: [
      { title: "Tutoring Impact Report", date: "March 2, 2026" },
      { title: "Student Performance Analysis", date: "Feb 20, 2026" },
    ],
  },
  financial: {
    title: "Financial Sector",
    icon: DollarSign,
    gradient: "gradient-gold",
    description: "Donations, sadaqah, scholarships, meal card funding & transparency",
    tasks: [
      { title: "Publish Q1 financial report", status: "completed", priority: "high" },
      { title: "Process scholarship applications", status: "in-progress", priority: "high" },
      { title: "Audit meal card fund", status: "pending", priority: "medium" },
      { title: "Launch donation campaign", status: "pending", priority: "medium" },
    ],
    members: [
      { name: "Amir Omar", role: "Sector Head", status: "active" },
      { name: "Br. Khalid", role: "Treasurer", status: "active" },
      { name: "Br. Anas", role: "Auditor", status: "active" },
    ],
    reports: [
      { title: "Q1 2026 Financial Statement", date: "March 1, 2026" },
      { title: "Donation Tracking Summary", date: "Feb 25, 2026" },
    ],
  },
  social: {
    title: "Social Sector",
    icon: Users,
    gradient: "gradient-pink",
    description: "Halal social activities, community events, welfare & lost-and-found",
    tasks: [
      { title: "Plan community service day", status: "in-progress", priority: "high" },
      { title: "Organize Eid celebration", status: "pending", priority: "high" },
      { title: "Launch lost-and-found system", status: "completed", priority: "medium" },
      { title: "Welfare check on new students", status: "pending", priority: "medium" },
    ],
    members: [
      { name: "Amir Hamza", role: "Sector Head", status: "active" },
      { name: "Br. Zayd", role: "Events Coordinator", status: "active" },
      { name: "Br. Luqman", role: "Welfare Officer", status: "active" },
    ],
    reports: [
      { title: "Event Participation Report", date: "March 4, 2026" },
      { title: "Community Welfare Summary", date: "Feb 22, 2026" },
    ],
  },
};

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "in-progress") return <Clock className="h-4 w-4 text-blue-500" />;
  return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
};

const priorityColor = (p: string) => {
  if (p === "high") return "destructive";
  if (p === "medium") return "default";
  return "secondary";
};

const SectorPortal = () => {
  const { sector } = useParams<{ sector: string }>();
  const data = sectorData[sector || "main"] || sectorData.main;
  const Icon = data.icon;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="ghost" size="sm" className="mb-2 font-body" asChild>
            <Link to="/portal/amirs"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Amirs</Link>
          </Button>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-11 h-11 rounded-xl ${data.gradient} flex items-center justify-center`}>
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{data.title}</h1>
              <p className="text-muted-foreground font-body text-sm">{data.description}</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="tasks" className="font-body text-xs py-2">Tasks</TabsTrigger>
            <TabsTrigger value="members" className="font-body text-xs py-2">Members</TabsTrigger>
            <TabsTrigger value="reports" className="font-body text-xs py-2">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-lg font-bold">Sector Tasks</h3>
              <Button size="sm" variant="default" className="font-body text-xs">
                <Plus className="mr-1 h-3 w-3" /> Add Task
              </Button>
            </div>
            {data.tasks.map((task, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center gap-3">
                    {statusIcon(task.status)}
                    <div className="flex-1">
                      <p className={`font-body text-sm font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{task.title}</p>
                    </div>
                    <Badge variant={priorityColor(task.priority) as any} className="font-body text-[10px]">{task.priority}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="members" className="mt-4 space-y-3">
            <h3 className="font-display text-lg font-bold">Sector Members</h3>
            {data.members.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-body text-sm font-bold text-primary">{m.name[0]}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold">{m.name}</p>
                      <p className="font-body text-xs text-muted-foreground">{m.role}</p>
                    </div>
                    <Badge variant="outline" className="font-body text-[10px]">{m.status}</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="mt-4 space-y-3">
            <h3 className="font-display text-lg font-bold">Reports & Documents</h3>
            {data.reports.map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="gamification-card">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-body text-sm font-medium">{r.title}</p>
                      <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {r.date}
                      </p>
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

export default SectorPortal;
