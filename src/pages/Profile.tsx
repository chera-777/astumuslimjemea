import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Phone, GraduationCap, Building, Calendar, Shield, Edit, Settings } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const profile = {
    name: "Ahmed Mohammed",
    id: "ASTU/1234/15",
    phone: "+251 912 345 678",
    email: "ahmed@astu.edu.et",
    university: "ASTU (Adama)",
    department: "Computer Science",
    year: "3rd Year",
    gender: "Brother",
    cafe: true,
    group: "Group 7",
    role: "Amir",
    joinedDate: "Sep 2023",
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <Card className="overflow-hidden">
            <div className="h-24 gradient-emerald islamic-pattern" />
            <CardContent className="relative pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                <Avatar className="w-20 h-20 border-4 border-card">
                  <AvatarFallback className="bg-primary text-primary-foreground font-display text-2xl">AM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">{profile.name}</h1>
                  <p className="font-body text-sm text-muted-foreground">{profile.id} • {profile.department}</p>
                </div>
                <Button variant="outline" size="sm" className="font-body">
                  <Edit className="h-4 w-4 mr-1" /> Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-display text-lg font-bold">Personal Info</h3>
              {[
                { icon: Phone, label: "Phone", value: profile.phone },
                { icon: Mail, label: "Email", value: profile.email },
                { icon: User, label: "Gender", value: profile.gender },
                { icon: Calendar, label: "Joined", value: profile.joinedDate },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                  <item.icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="font-body text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-display text-lg font-bold">Academic & Community</h3>
              {[
                { icon: Building, label: "University", value: profile.university },
                { icon: GraduationCap, label: "Year", value: profile.year },
                { icon: User, label: "Group", value: profile.group },
                { icon: Shield, label: "Role", value: profile.role },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                  <item.icon className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="font-body text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
              {profile.cafe && (
                <Badge variant="default" className="font-body">☕ Café Student — Meal Card Eligible</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="font-body text-sm">Account Settings</span>
            </div>
            <Button variant="ghost" size="sm" className="font-body">Manage</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
