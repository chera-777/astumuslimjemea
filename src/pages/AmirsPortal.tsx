import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, GraduationCap, DollarSign, Users, Star, ArrowRight, BarChart3, Megaphone, FileText, Plus, CheckCircle, Clock, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const brothersSectors = [
  { icon: Star, title: "Main Sector", desc: "Overall leadership & community vision", head: "Amir Ahmed", members: 5, path: "/portal/amirs/main", gradient: "gradient-teal" },
  { icon: BookOpen, title: "Qira'at Sector", desc: "Qur'an recitation, tajweed & hifz", head: "Amir Yusuf", members: 8, path: "/portal/amirs/qiraat", gradient: "gradient-green" },
  { icon: GraduationCap, title: "Academic Sector", desc: "Tutoring & mentoring", head: "Amir Ibrahim", members: 12, path: "/portal/amirs/academic", gradient: "gradient-blue" },
  { icon: DollarSign, title: "Financial Sector", desc: "Donations & transparency", head: "Amir Omar", members: 4, path: "/portal/amirs/financial", gradient: "gradient-gold" },
  { icon: Users, title: "Social Sector", desc: "Events & welfare", head: "Amir Hamza", members: 10, path: "/portal/amirs/social", gradient: "gradient-pink" },
];

const sistersSectors = [
  { icon: Star, title: "Main Sector", desc: "Overall sisters' leadership", head: "Amirah Fatima", members: 4, path: "/portal/amirs/main-s", gradient: "gradient-teal" },
  { icon: BookOpen, title: "Qira'at Sector", desc: "Qur'an circles & tajweed", head: "Amirah Khadija", members: 6, path: "/portal/amirs/qiraat-s", gradient: "gradient-green" },
  { icon: GraduationCap, title: "Academic Sector", desc: "Study groups & mentoring", head: "Amirah Aisha", members: 9, path: "/portal/amirs/academic-s", gradient: "gradient-blue" },
  { icon: DollarSign, title: "Financial Sector", desc: "Budget & charity drives", head: "Amirah Maryam", members: 3, path: "/portal/amirs/financial-s", gradient: "gradient-gold" },
  { icon: Users, title: "Social Sector", desc: "Sisters' events & welfare", head: "Amirah Safiya", members: 8, path: "/portal/amirs/social-s", gradient: "gradient-pink" },
];

const recentTasks = [
  { title: "Review semester budget", status: "pending", due: "Apr 2" },
  { title: "Approve Khadim applications", status: "done", due: "Mar 28" },
  { title: "Plan Ramadan iftar schedule", status: "in-progress", due: "Apr 5" },
  { title: "Coordinate tutoring assignments", status: "pending", due: "Apr 8" },
];

const announcements = [
  { title: "Semester Planning Meeting", date: "April 2, 2026", priority: "high" },
  { title: "Khadim Registration Open", date: "March 28, 2026", priority: "normal" },
  { title: "Budget Report Due", date: "March 25, 2026", priority: "normal" },
];

const memberStats = { total: 147, brothers: 89, sisters: 58, active: 120, newThisMonth: 12 };

const SectorCard = ({ sector, i }: { sector: typeof brothersSectors[0]; i: number }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
    <Link to={sector.path}>
      <Card className="border border-border bg-card hover:shadow-glow hover:-translate-y-1 transition-all h-full group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-xl ${sector.gradient} flex items-center justify-center`}>
              <sector.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <Badge variant="secondary" className="font-body text-[10px]">{sector.members} members</Badge>
          </div>
          <h4 className="font-display text-base font-bold group-hover:text-primary transition-colors">{sector.title}</h4>
          <p className="text-muted-foreground font-body text-xs mt-1 mb-2">{sector.desc}</p>
          <div className="flex items-center justify-between">
            <p className="font-body text-[10px] text-primary font-medium">Led by: {sector.head}</p>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const AmirsPortal = () => {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(" ")[0] || "Amir";

  return (
    <AppLayout>
      <SEO title="Amirs Portal | ASTU Muslim Jemea" description="Sector leadership tools: announcements, member oversight, analytics and reports." path="/portal/amirs" />
      <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl gradient-teal flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Welcome, {displayName}!</h1>
              <p className="text-muted-foreground font-body text-sm">Amirs' Leadership Dashboard</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: memberStats.total, icon: Users, gradient: "gradient-blue" },
            { label: "Active", value: memberStats.active, icon: CheckCircle, gradient: "gradient-green" },
            { label: "New This Month", value: memberStats.newThisMonth, icon: Plus, gradient: "gradient-pink" },
            { label: "Pending Tasks", value: recentTasks.filter(t => t.status === "pending").length, icon: Clock, gradient: "gradient-gold" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border border-border bg-card">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${stat.gradient} flex items-center justify-center shrink-0`}>
                    <stat.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-lg font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="sectors" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="sectors" className="font-body text-xs py-2">🏛️ Sectors</TabsTrigger>
            <TabsTrigger value="tasks" className="font-body text-xs py-2">📋 Tasks</TabsTrigger>
            <TabsTrigger value="announcements" className="font-body text-xs py-2">📢 Announce</TabsTrigger>
            <TabsTrigger value="members" className="font-body text-xs py-2">👥 Members</TabsTrigger>
            <TabsTrigger value="analytics" className="font-body text-xs py-2">📊 Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="mt-4">
            <AnalyticsDashboard scope="university" />
          </TabsContent>

          <TabsContent value="sectors" className="mt-4">
            <Tabs defaultValue="brothers" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-auto">
                <TabsTrigger value="brothers" className="font-body text-sm py-2">👳 Brothers</TabsTrigger>
                <TabsTrigger value="sisters" className="font-body text-sm py-2">🧕 Sisters</TabsTrigger>
              </TabsList>
              <TabsContent value="brothers" className="mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {brothersSectors.map((s, i) => <SectorCard key={s.title + "b"} sector={s} i={i} />)}
                </div>
              </TabsContent>
              <TabsContent value="sisters" className="mt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sistersSectors.map((s, i) => <SectorCard key={s.title + "s"} sector={s} i={i} />)}
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="tasks" className="mt-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-lg font-bold">Recent Tasks</h3>
              <Button size="sm" className="font-body text-xs rounded-xl"><Plus className="mr-1 h-3 w-3" /> Add Task</Button>
            </div>
            {recentTasks.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {t.status === "done" ? <CheckCircle className="h-5 w-5 text-green shrink-0" /> : <Clock className="h-5 w-5 text-muted-foreground shrink-0" />}
                      <div>
                        <p className="font-body text-sm font-medium">{t.title}</p>
                        <p className="font-body text-[10px] text-muted-foreground">Due: {t.due}</p>
                      </div>
                    </div>
                    <Badge variant={t.status === "done" ? "secondary" : t.status === "in-progress" ? "default" : "outline"} className="font-body text-[10px] capitalize">
                      {t.status}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="announcements" className="mt-4 space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-display text-lg font-bold">Announcements</h3>
              <Button size="sm" className="font-body text-xs rounded-xl"><Megaphone className="mr-1 h-3 w-3" /> New</Button>
            </div>
            {announcements.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="font-body text-sm font-medium">{a.title}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{a.date}</p>
                      </div>
                    </div>
                    {a.priority === "high" && <Badge variant="destructive" className="font-body text-[10px]">Urgent</Badge>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="members" className="mt-4">
            <Card className="border border-border bg-card">
              <CardContent className="p-5">
                <h3 className="font-display text-lg font-bold mb-4">Member Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary text-center">
                    <p className="font-display text-2xl font-bold text-primary">{memberStats.brothers}</p>
                    <p className="font-body text-xs text-muted-foreground">Brothers</p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary text-center">
                    <p className="font-display text-2xl font-bold text-accent">{memberStats.sisters}</p>
                    <p className="font-body text-xs text-muted-foreground">Sisters</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <Button className="flex-1 gradient-teal text-primary-foreground border-0 rounded-xl font-body h-10">
                    <Users className="mr-2 h-4 w-4" /> View All Members
                  </Button>
                  <Button variant="outline" className="flex-1 rounded-xl font-body h-10">
                    <FileText className="mr-2 h-4 w-4" /> Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AmirsPortal;
