import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, BookOpen, GraduationCap, DollarSign, Users, Star, ArrowRight, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const brothersSectors = [
  { icon: Star, title: "Main Sector", desc: "Overall leadership & community vision", head: "Amir Ahmed", members: 5, path: "/portal/amirs/main", gradient: "gradient-teal" },
  { icon: BookOpen, title: "Qira'at Sector", desc: "Qur'an recitation, tajweed & hifz competitions", head: "Amir Yusuf", members: 8, path: "/portal/amirs/qiraat", gradient: "gradient-green" },
  { icon: GraduationCap, title: "Academic Sector", desc: "Tutoring, study groups & mentoring", head: "Amir Ibrahim", members: 12, path: "/portal/amirs/academic", gradient: "gradient-blue" },
  { icon: DollarSign, title: "Financial Sector", desc: "Donations, sadaqah & transparency", head: "Amir Omar", members: 4, path: "/portal/amirs/financial", gradient: "gradient-gold" },
  { icon: Users, title: "Social Sector", desc: "Events, welfare & community activities", head: "Amir Hamza", members: 10, path: "/portal/amirs/social", gradient: "gradient-pink" },
];

const sistersSectors = [
  { icon: Star, title: "Main Sector", desc: "Overall sisters' leadership & coordination", head: "Amirah Fatima", members: 4, path: "/portal/amirs/main", gradient: "gradient-teal" },
  { icon: BookOpen, title: "Qira'at Sector", desc: "Qur'an circles, tajweed classes & competitions", head: "Amirah Khadija", members: 6, path: "/portal/amirs/qiraat", gradient: "gradient-green" },
  { icon: GraduationCap, title: "Academic Sector", desc: "Study groups, mentoring & tutoring", head: "Amirah Aisha", members: 9, path: "/portal/amirs/academic", gradient: "gradient-blue" },
  { icon: DollarSign, title: "Financial Sector", desc: "Budget management & charity drives", head: "Amirah Maryam", members: 3, path: "/portal/amirs/financial", gradient: "gradient-gold" },
  { icon: Users, title: "Social Sector", desc: "Sisters' events & welfare programs", head: "Amirah Safiya", members: 8, path: "/portal/amirs/social", gradient: "gradient-pink" },
];

const SectorCard = ({ sector, i }: { sector: typeof brothersSectors[0]; i: number }) => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
    <Link to={sector.path}>
      <Card className="gamification-card h-full group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className={`w-11 h-11 rounded-xl ${sector.gradient} flex items-center justify-center`}>
              <sector.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <Badge variant="secondary" className="font-body text-[10px]">{sector.members} members</Badge>
          </div>
          <CardTitle className="font-display text-lg mt-2 group-hover:text-primary transition-colors">{sector.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground font-body text-sm mb-3">{sector.desc}</p>
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-primary font-medium">Led by: {sector.head}</p>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);

const AmirsPortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-teal flex items-center justify-center mx-auto mb-3">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Amirs' Portal</h1>
          <p className="text-muted-foreground font-body text-sm">Leadership sectors dashboard — select a sector to manage</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Total Members", value: "39", gradient: "gradient-blue" },
            { icon: BarChart3, label: "Active Tasks", value: "12", gradient: "gradient-green" },
            { icon: Settings, label: "Sectors", value: "5", gradient: "gradient-pink" },
          ].map((stat) => (
            <Card key={stat.label} className="gamification-card">
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
          ))}
        </div>

        <Tabs defaultValue="brothers" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="brothers" className="font-body text-sm py-2.5">👳 Brothers' Leadership</TabsTrigger>
            <TabsTrigger value="sisters" className="font-body text-sm py-2.5">🧕 Sisters' Leadership</TabsTrigger>
          </TabsList>

          <TabsContent value="brothers" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brothersSectors.map((s, i) => <SectorCard key={s.title} sector={s} i={i} />)}
            </div>
          </TabsContent>

          <TabsContent value="sisters" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sistersSectors.map((s, i) => <SectorCard key={s.title} sector={s} i={i} />)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default AmirsPortal;
