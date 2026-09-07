import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
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

const achievements = [
  { icon: "📖", title: "Quran Explorer", desc: "Read 15 Juz", unlocked: true },
  { icon: "🤲", title: "Zikr Master", desc: "500 daily zikr", unlocked: true },
  { icon: "🕌", title: "Event Enthusiast", desc: "Attend 20 events", unlocked: false },
  { icon: "💡", title: "Top Donor", desc: "Donate 5000 ETB", unlocked: false },
  { icon: "🎓", title: "Academic Star", desc: "Help 10 students", unlocked: true },
  { icon: "🏆", title: "Community Leader", desc: "Complete all challenges", unlocked: false },
];

const XP_LABELS: Record<string, string> = {
  event_rsvp: "Joined an event",
  donation: "Made a donation",
  azan_daily: "Listened to the Azan",
  tasbih_100: "Completed 100 tasbih",
  quran_surah: "Finished a Surah",
};

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
};

const Profile = () => {
  const { signOut, profile: authProfile, user, roles } = useAuth();
  const { xp, level, recent, progress, nextLevelAt } = useXp();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [selectedAccent, setSelectedAccent] = useState(0);

  const [donations, setDonations] = useState<{ campaign: string | null; amount: number; created_at: string }[]>([]);
  const [universityName, setUniversityName] = useState<string>("—");

  useEffect(() => {
    const fetchExtras = async () => {
      if (!user) return;
      const { supabase } = await import("@/integrations/supabase/client");
      // donations
      const { data: dons } = await supabase
        .from("donations")
        .select("campaign, amount, created_at")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setDonations(dons || []);
      // university
      if (authProfile?.university_id) {
        const { data: uni } = await supabase
          .from("universities")
          .select("name, short_name, city")
          .eq("id", authProfile.university_id)
          .maybeSingle();
        if (uni) setUniversityName(`${uni.short_name} (${uni.city})`);
      }
    };
    fetchExtras();
  }, [user, authProfile?.university_id]);

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

  const displayName = authProfile?.full_name || user?.email?.split("@")[0] || "Guest";
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const totalDonated = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const completionPct = (() => {
    if (!authProfile) return 0;
    const fields = [authProfile.full_name, authProfile.phone, authProfile.gender, authProfile.department, authProfile.batch_year, authProfile.student_id, authProfile.profile_photo_url];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  })();
  const role = roles[0] ? roles[0].charAt(0).toUpperCase() + roles[0].slice(1) : "Student";
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";

  return (
    <AppLayout>
      <SEO title="My Profile — ASTU Muslim Jemea" description="Manage your profile, achievements, badges, and account preferences." path="/profile" />
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
                  <p className="font-body text-xs text-muted-foreground">
                    {authProfile?.student_id || user?.email || "—"} {authProfile?.department && `• ${authProfile.department}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">
                      <Award className="h-3 w-3 mr-1" /> {role}
                    </Badge>
                    {authProfile?.is_verified && (
                      <Badge variant="outline" className="font-body text-[10px]">✓ Verified</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-body rounded-xl text-xs">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-secondary">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs font-medium">Profile Completion</span>
                  <span className="font-body text-xs text-primary font-bold">{completionPct}%</span>
                </div>
                <Progress value={completionPct} className="h-2" />
                <p className="font-body text-[10px] text-muted-foreground mt-1">Complete your profile details to reach 100%</p>
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
            {/* Daily Goal · Group Sessions · Café — relocated from Home */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-primary/25 via-primary/10 to-card border-border/60">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <p className="font-display text-xs font-bold">Daily Goal</p>
                  </div>
                  <p className="font-display text-2xl font-bold text-primary">75%</p>
                  <Progress value={75} className="h-1.5 mt-1.5" />
                  <p className="font-body text-[10px] text-muted-foreground mt-1">10 / 14 today · Qur'an & Zikr</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500/25 via-blue-500/10 to-card border-border/60">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4 text-blue-500" />
                    <p className="font-display text-xs font-bold">Group Session</p>
                  </div>
                  <p className="font-display text-base font-bold text-blue-500">Halaqa Tonight</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">Group 7B · 8:00 PM · 14 members</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/25 via-green-500/10 to-card border-border/60">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gift className="h-4 w-4 text-green-500" />
                    <p className="font-display text-xs font-bold">Café Student</p>
                  </div>
                  <p className="font-display text-base font-bold text-green-500">
                    {authProfile?.is_cafe_student ? "Active" : "Not enrolled"}
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">
                    {authProfile?.is_cafe_student ? "Lunch & Dinner included" : "Apply via University Services"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="border border-border bg-card">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-display text-base font-bold">Personal Info</h3>
                  {[
                    { icon: Phone, label: "Phone", value: authProfile?.phone || "Not set" },
                    { icon: Mail, label: "Email", value: user?.email || "Not set" },
                    { icon: User, label: "Gender", value: authProfile?.gender || "Not set" },
                    { icon: Calendar, label: "Joined", value: joinedDate },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="font-body text-sm truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border border-border bg-card">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-display text-base font-bold">Academic & Community</h3>
                  {[
                    { icon: Building, label: "University", value: universityName },
                    { icon: GraduationCap, label: "Department", value: authProfile?.department || "Not set" },
                    { icon: User, label: "Batch Year", value: authProfile?.batch_year || "Not set" },
                    { icon: Shield, label: "Role", value: role },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="font-body text-sm truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {authProfile?.is_cafe_student && (
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
                  {donations.length === 0 ? (
                    <p className="font-body text-xs text-muted-foreground text-center py-4">No donations yet. Be the first to give! 💝</p>
                  ) : donations.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-secondary">
                      <div className="min-w-0">
                        <p className="font-body text-sm font-medium truncate">{d.campaign || "General"}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="font-body text-sm font-bold text-primary shrink-0 ml-2">{Number(d.amount).toFixed(0)} ETB</span>
                    </div>
                  ))}
                  {totalDonated > 0 && (
                    <div className="pt-2 border-t border-border flex justify-between text-sm font-body font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{totalDonated.toFixed(0)} ETB</span>
                    </div>
                  )}
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
