import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, Shield, GraduationCap, User } from "lucide-react";
import { motion } from "framer-motion";

const groups = [
  {
    name: "Group 7",
    type: "Brothers",
    members: [
      { name: "Ahmed M.", year: "3rd", role: "Amir", icon: Crown },
      { name: "Yusuf K.", year: "4th", role: "Naqeeb", icon: Shield },
      { name: "Ibrahim A.", year: "5th", role: "Murshid", icon: GraduationCap },
      { name: "Hassan B.", year: "1st", role: "Member", icon: User },
      { name: "Omar S.", year: "2nd", role: "Member", icon: User },
      { name: "Bilal H.", year: "1st", role: "Member", icon: User },
      { name: "Hamza T.", year: "3rd", role: "Member", icon: User },
    ],
    activities: ["Weekly Halaqa — Fridays 5 PM", "Group Tutoring — Wednesdays", "Monthly Outing"],
  },
  {
    name: "Group 12",
    type: "Sisters",
    members: [
      { name: "Fatima R.", year: "4th", role: "Amirah", icon: Crown },
      { name: "Aisha K.", year: "3rd", role: "Naqeebah", icon: Shield },
      { name: "Maryam H.", year: "5th", role: "Murshida", icon: GraduationCap },
      { name: "Khadijah A.", year: "2nd", role: "Member", icon: User },
      { name: "Zahra M.", year: "1st", role: "Member", icon: User },
    ],
    activities: ["Sisters' Halaqa — Thursdays 4 PM", "Study Circle — Tuesdays", "Community Service"],
  },
];

const Groups = () => {
  return (
    <AppLayout>
      <SEO title="Student Groups — ASTU Muslim Jemea" description="Browse and join the 14-student community groups led by appointed Amirs." path="/groups" />
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Group System</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Annual gender-segregated groups of 14 students (1st–5th year)</p>
        </motion.div>

        <div className="space-y-6">
          {groups.length === 0 && (
            <Card><CardContent className="p-0">
              <EmptyState icon={Users} title="No group yet" description="Groups are formed at the start of each academic year. You'll see yours here once assigned." actionLabel="Back to home" actionTo="/dashboard" />
            </CardContent></Card>
          )}
          {groups.map((g, gi) => (
            <motion.div key={g.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.1 }}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-xl">{g.name}</CardTitle>
                    <Badge variant={g.type === "Brothers" ? "default" : "secondary"} className="font-body">{g.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {g.members.map((m) => (
                      <div key={m.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <m.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-medium">{m.name}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{m.year} Year • {m.role}</p>
                        </div>
                        {m.role !== "Member" && (
                          <Badge variant="outline" className="font-body text-[9px]">{m.role}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold text-muted-foreground uppercase mb-2">Activities</p>
                    <div className="flex flex-wrap gap-2">
                      {g.activities.map((a) => (
                        <Badge key={a} variant="outline" className="font-body text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Groups;
