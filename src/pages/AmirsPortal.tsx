import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, BookOpen, GraduationCap, DollarSign, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const sectors = [
  { icon: Star, title: "Main Sector", desc: "Overall leadership, coordination & community vision", head: "Amir Ahmed", members: 5, color: "bg-accent/20" },
  { icon: BookOpen, title: "Qira'at Sector", desc: "Qur'an recitation, tajweed classes, hifz competitions & Zikr challenges", head: "Amir Yusuf", members: 8, color: "bg-primary/10" },
  { icon: GraduationCap, title: "Academic Sector", desc: "Tutoring, study groups, exam reminders & academic mentoring", head: "Amir Ibrahim", members: 12, color: "bg-accent/20" },
  { icon: DollarSign, title: "Financial Sector", desc: "Donations, sadaqah, scholarships, meal card funding & transparency", head: "Amir Omar", members: 4, color: "bg-primary/10" },
  { icon: Users, title: "Social Sector", desc: "Halal social activities, community events, welfare & lost-and-found", head: "Amir Hamza", members: 10, color: "bg-accent/20" },
];

const AmirsPortal = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Amirs' Portal</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Leadership sectors dashboard — Brothers & Sisters</p>
        </motion.div>

        <div className="flex gap-2">
          <Badge variant="default" className="font-body">Brothers' Leadership</Badge>
          <Badge variant="outline" className="font-body">Sisters' Leadership</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sectors.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="hover:shadow-emerald transition-all h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center`}>
                      <s.icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="font-body text-[10px]">{s.members} members</Badge>
                  </div>
                  <CardTitle className="font-display text-lg mt-2">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-body text-sm mb-3">{s.desc}</p>
                  <p className="font-body text-xs text-primary font-medium">Led by: {s.head}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default AmirsPortal;
