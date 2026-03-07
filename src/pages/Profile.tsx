import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  User, Mail, Phone, GraduationCap, Building, Calendar, Shield, Edit, Settings,
  Heart, DollarSign, Gift, TrendingUp, Award, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockProfile = {
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
  role: "Student",
  joinedDate: "Sep 2023",
  xp: 750,
  level: 5,
  streak: 7,
};

const donations = [
  { campaign: "Ramadan Iftar Fund", amount: 200, date: "Mar 5, 2026" },
  { campaign: "Scholarship Fund", amount: 500, date: "Feb 20, 2026" },
  { campaign: "Masjid Renovation", amount: 100, date: "Jan 15, 2026" },
];

const Profile = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden">
            <div className="h-24 gradient-hero islamic-pattern" />
            <CardContent className="relative pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                <Avatar className="w-20 h-20 border-4 border-card">
                  <AvatarFallback className="gradient-teal text-primary-foreground font-display text-2xl">AM</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-display text-2xl font-bold text-foreground">{mockProfile.name}</h1>
                  <p className="font-body text-sm text-muted-foreground">{mockProfile.id} • {mockProfile.department}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="streak-badge">🔥 {mockProfile.streak} streak</span>
                    <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">
                      <Award className="h-3 w-3 mr-1" /> Lvl {mockProfile.level}
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-body">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="info" className="font-body text-xs py-2">Info</TabsTrigger>
            <TabsTrigger value="donations" className="font-body text-xs py-2">Donations</TabsTrigger>
            <TabsTrigger value="settings" className="font-body text-xs py-2">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-display text-lg font-bold">Personal Info</h3>
                  {[
                    { icon: Phone, label: "Phone", value: mockProfile.phone },
                    { icon: Mail, label: "Email", value: mockProfile.email },
                    { icon: User, label: "Gender", value: mockProfile.gender },
                    { icon: Calendar, label: "Joined", value: mockProfile.joinedDate },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
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
                    { icon: Building, label: "University", value: mockProfile.university },
                    { icon: GraduationCap, label: "Year", value: mockProfile.year },
                    { icon: User, label: "Group", value: mockProfile.group },
                    { icon: Shield, label: "Role", value: mockProfile.role },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="font-body text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {mockProfile.cafe && (
                    <Badge className="font-body bg-gold/10 text-gold border-gold/30">☕ Café Student — Meal Card Eligible</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donations" className="space-y-4 mt-4">
            {/* Quick Donate */}
            <Card className="gamification-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl gradient-pink flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Quick Sadaqah</h3>
                <p className="text-muted-foreground font-body text-sm mb-4">Every contribution matters</p>
                <div className="flex gap-2 justify-center flex-wrap mb-4">
                  {[50, 100, 500, 1000].map((amt) => (
                    <Button key={amt} variant="outline" size="sm" className="font-body rounded-full">{amt} ETB</Button>
                  ))}
                </div>
                <div className="flex gap-2 max-w-xs mx-auto">
                  <Input placeholder="Custom amount" className="font-body" type="number" />
                  <Button className="font-body gradient-teal text-primary-foreground border-0">Donate</Button>
                </div>
              </CardContent>
            </Card>

            {/* Donation History */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Your Donations
                </h3>
                <div className="space-y-2">
                  {donations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary">
                      <div>
                        <p className="font-body text-sm font-medium">{d.campaign}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{d.date}</p>
                      </div>
                      <span className="font-body text-sm font-bold text-primary">{d.amount} ETB</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-body text-sm">Account Settings</span>
                </div>
                <Button variant="ghost" size="sm" className="font-body">Manage</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
