import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, GraduationCap, DollarSign, Users, Star, ArrowRight, BarChart3, Settings, Megaphone, FileText } from "lucide-react";
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
  { icon: Star, title: "Main Sector", desc: "Overall sisters' leadership", head: "Amirah Fatima", members: 4, path: "/portal/amirs/main", gradient: "gradient-teal" },
  { icon: BookOpen, title: "Qira'at Sector", desc: "Qur'an circles & tajweed", head: "Amirah Khadija", members: 6, path: "/portal/amirs/qiraat", gradient: "gradient-green" },
  { icon: GraduationCap, title: "Academic Sector", desc: "Study groups & mentoring", head: "Amirah Aisha", members: 9, path: "/portal/amirs/academic", gradient: "gradient-blue" },
  { icon: DollarSign, title: "Financial Sector", desc: "Budget & charity drives", head: "Amirah Maryam", members: 3, path: "/portal/amirs/financial", gradient: "gradient-gold" },
  { icon: Users, title: "Social Sector", desc: "Sisters' events & welfare", head: "Amirah Safiya", members: 8, path: "/portal/amirs/social", gradient: "gradient-pink" },
];

const quickStats = [
  { icon: Users, label: "Members", value: "147", gradient: "gradient-blue" },
  { icon: BarChart3, label: "Tasks", value: "12", gradient: "gradient-green" },
  { icon: Megaphone, label: "Announcements", value: "5", gradient: "gradient-pink" },
];

const SectorCard = ({ sector, i }: { sector: typeof brothersSectors[0]; i: number }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
    <Link to={sector.path}>
      <Card className="gamification-card h-full group">
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
      <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-xl gradient-teal flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Welcome, {displayName}!</h1>
              <p className="text-muted-foreground font-body text-sm">Amirs' Leadership Dashboard</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {quickStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="gamification-card">
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 gradient-teal text-white border-0 rounded-xl font-body h-10">
            <Megaphone className="mr-2 h-4 w-4" /> Send Announcement
          </Button>
          <Button variant="outline" className="flex-1 rounded-xl font-body h-10">
            <FileText className="mr-2 h-4 w-4" /> View Reports
          </Button>
        </div>

        {/* Sectors Tabs */}
        <Tabs defaultValue="brothers" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="brothers" className="font-body text-sm py-2.5">👳 Brothers' Leadership</TabsTrigger>
            <TabsTrigger value="sisters" className="font-body text-sm py-2.5">🧕 Sisters' Leadership</TabsTrigger>
          </TabsList>

          <TabsContent value="brothers" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {brothersSectors.map((s, i) => <SectorCard key={s.title + "b"} sector={s} i={i} />)}
            </div>
          </TabsContent>

          <TabsContent value="sisters" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sistersSectors.map((s, i) => <SectorCard key={s.title + "s"} sector={s} i={i} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AmirsPortal;
