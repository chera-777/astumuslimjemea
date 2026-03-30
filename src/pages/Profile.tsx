import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  User, Mail, Phone, GraduationCap, Building, Calendar, Shield, Edit,
  Heart, Gift, TrendingUp, Award, Zap, BookOpen, Moon, Bell, Lock, Palette,
  Globe, LogOut, ChevronRight, Star, Sun, Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const accentColors = [
  { name: "Teal", hsl: "168 65% 35%", class: "bg-primary" },
  { name: "Pink", hsl: "340 75% 55%", class: "bg-accent" },
  { name: "Blue", hsl: "215 80% 55%", class: "bg-[hsl(215,80%,55%)]" },
  { name: "Gold", hsl: "42 85% 55%", class: "bg-[hsl(42,85%,55%)]" },
  { name: "Green", hsl: "145 60% 40%", class: "bg-[hsl(145,60%,40%)]" },
  { name: "Purple", hsl: "270 60% 55%", class: "bg-[hsl(270,60%,55%)]" },
];

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
  completionPct: 72,
};

const achievements = [
  { icon: "📖", title: "Quran Explorer", desc: "Read 15 Juz", unlocked: true },
  { icon: "🤲", title: "Zikr Master", desc: "500 daily zikr", unlocked: true },
  { icon: "🕌", title: "Event Enthusiast", desc: "Attend 20 events", unlocked: false },
  { icon: "💡", title: "Top Donor", desc: "Donate 5000 ETB", unlocked: false },
  { icon: "🎓", title: "Academic Star", desc: "Help 10 students", unlocked: true },
  { icon: "🏆", title: "Community Leader", desc: "Complete all challenges", unlocked: false },
];

const donations = [
  { campaign: "Ramadan Iftar Fund", amount: 200, date: "Mar 5, 2026" },
  { campaign: "Scholarship Fund", amount: 500, date: "Feb 20, 2026" },
  { campaign: "Masjid Renovation", amount: 100, date: "Jan 15, 2026" },
];

const activityLog = [
  { action: "Completed Surah Al-Baqarah", time: "2h ago", xp: 50 },
  { action: "Attended Tafsir class", time: "Yesterday", xp: 30 },
  { action: "Donated to Iftar Fund", time: "2 days ago", xp: 20 },
  { action: "Helped in tutoring", time: "3 days ago", xp: 40 },
];

const Profile = () => {
  const { signOut, profile: authProfile } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [selectedAccent, setSelectedAccent] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleTheme = (mode: "dark" | "light" | "system") => {
    setTheme(mode);
    if (mode === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  const displayName = authProfile?.full_name || mockProfile.name;
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-5 max-w-4xl mx-auto">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border border-border">
            <div className="h-20 gradient-hero islamic-pattern" />
            <CardContent className="relative pt-0 pb-5 px-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
                <Avatar className="w-20 h-20 border-4 border-card shadow-lg">
                  <AvatarFallback className="gradient-teal text-primary-foreground font-display text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="font-display text-xl font-bold">{displayName}</h1>
                  <p className="font-body text-xs text-muted-foreground">{mockProfile.id} • {mockProfile.department}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">
                      <Award className="h-3 w-3 mr-1" /> Lvl {mockProfile.level}
                    </Badge>
                    <Badge variant="outline" className="font-body text-[10px]">{mockProfile.xp} XP</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-body rounded-xl text-xs">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-secondary">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs font-medium">Profile Completion</span>
                  <span className="font-body text-xs text-primary font-bold">{mockProfile.completionPct}%</span>
                </div>
                <Progress value={mockProfile.completionPct} className="h-2" />
                <p className="font-body text-[10px] text-muted-foreground mt-1">Upload ID card & photo to reach 100%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="info" className="font-body text-[10px] sm:text-xs py-2">👤 Info</TabsTrigger>
            <TabsTrigger value="achievements" className="font-body text-[10px] sm:text-xs py-2">🏆 Badges</TabsTrigger>
            <TabsTrigger value="activity" className="font-body text-[10px] sm:text-xs py-2">⚡ Activity</TabsTrigger>
            <TabsTrigger value="donations" className="font-body text-[10px] sm:text-xs py-2">💝 Giving</TabsTrigger>
            <TabsTrigger value="settings" className="font-body text-[10px] sm:text-xs py-2">⚙️ Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border border-border bg-card">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-display text-base font-bold">Personal Info</h3>
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
              <Card className="border border-border bg-card">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-display text-base font-bold">Academic & Community</h3>
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
                    <Badge className="font-body bg-gold/10 text-gold border-gold/30">☕ Café Student</Badge>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`border border-border ${a.unlocked ? "bg-card" : "bg-muted/50 opacity-60"}`}>
                    <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                      <span className="text-3xl">{a.icon}</span>
                      <p className="font-body text-sm font-semibold">{a.title}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{a.desc}</p>
                      {a.unlocked ? (
                        <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">✓ Unlocked</Badge>
                      ) : (
                        <Badge variant="outline" className="font-body text-[10px]">🔒 Locked</Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4 space-y-2">
            {activityLog.map((a, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-body text-sm">{a.action}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                    <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">+{a.xp} XP</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="donations" className="space-y-3 mt-4">
            <Card className="border border-border bg-card">
              <CardContent className="p-5 text-center">
                <div className="w-12 h-12 rounded-xl gradient-pink flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Quick Sadaqah</h3>
                <div className="flex gap-2 justify-center flex-wrap mb-3">
                  {[50, 100, 500, 1000].map((amt) => (
                    <Button key={amt} variant="outline" size="sm" className="font-body rounded-full">{amt} ETB</Button>
                  ))}
                </div>
                <div className="flex gap-2 max-w-xs mx-auto">
                  <Input placeholder="Custom amount" className="font-body rounded-xl" type="number" />
                  <Button className="font-body gradient-teal text-primary-foreground border-0 rounded-xl">Donate</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Donation History
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

          <TabsContent value="settings" className="space-y-3 mt-4">
            {/* Appearance */}
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <h3 className="font-display text-base font-bold mb-3 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" /> Appearance
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-2">Theme</p>
                    <div className="flex gap-2">
                      {[
                        { mode: "dark" as const, icon: Moon, label: "Dark" },
                        { mode: "light" as const, icon: Sun, label: "Light" },
                        { mode: "system" as const, icon: Monitor, label: "System" },
                      ].map(t => (
                        <Button
                          key={t.mode}
                          variant={theme === t.mode ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleTheme(t.mode)}
                          className="flex-1 font-body text-xs rounded-xl"
                        >
                          <t.icon className="h-3.5 w-3.5 mr-1" /> {t.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-body text-xs text-muted-foreground mb-2">Accent Color</p>
                    <div className="flex gap-2">
                      {accentColors.map((c, i) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedAccent(i)}
                          className={`w-8 h-8 rounded-full ${c.class} ${selectedAccent === i ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''} transition-all`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other settings */}
            {[
              { icon: Bell, label: "Notifications", desc: "Push & email alerts", toggle: true },
              { icon: Lock, label: "Privacy", desc: "Profile visibility", toggle: true },
              { icon: Globe, label: "Language", desc: "English", action: true },
              { icon: Shield, label: "Security", desc: "Password & 2FA", action: true },
              { icon: BookOpen, label: "Quran Preferences", desc: "Translation & reciter", action: true },
              { icon: Moon, label: "Prayer Reminders", desc: "Fajr, Dhuhr, Asr...", toggle: true },
            ].map((item, i) => (
              <Card key={i} className="border border-border bg-card">
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium">{item.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  {item.toggle ? <Switch defaultChecked /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </CardContent>
              </Card>
            ))}

            {/* Sign Out */}
            <Card className="border border-border bg-card">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full justify-start p-3.5 h-auto text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  <span className="font-body text-sm font-medium">Sign Out</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
