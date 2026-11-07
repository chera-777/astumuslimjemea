import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useXp } from "@/hooks/useXp";
import { ProfileDetailsEditor } from "@/components/ProfileDetailsEditor";
import { profileCompletion } from "@/lib/profileDetails";
import { AVATAR_BUCKET, useProfileFileUrl } from "@/lib/profileFiles";
import { portalHome } from "@/lib/portalAccess";


const accentColors = [
  { name: "Teal", class: "bg-teal" },
  { name: "Blue", class: "bg-blue" },
  { name: "Green", class: "bg-primary" },
  { name: "Purple", class: "bg-accent" },
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
  const [searchParams, setSearchParams] = useSearchParams();
  const editorOpen = searchParams.get("edit") === "1";
  const setEditorOpen = (open: boolean) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous);
      if (open) next.set("edit", "1"); else next.delete("edit");
      return next;
    }, { replace: true });
  };
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
  const photoUrl = useProfileFileUrl(authProfile?.profile_photo_url, AVATAR_BUCKET);
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const totalDonated = donations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const completionPct = profileCompletion(authProfile);
  const primaryRole = portalHome(roles) === "/admin" ? "admin" : portalHome(roles) === "/portal/committee" ? "committee" : portalHome(roles) === "/portal/amirs" ? "amir" : roles.includes("student") ? "student" : "guest";
  const role = primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1);
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—";

  return (
    <AppLayout>
      <SEO title="My Profile — ASTU Muslim Jemea" description="Manage your profile, achievements, badges, and account preferences." path="/profile" />
      <div className="space-y-6">
        {/* Profile Card */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-6">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true" />
              <div className="flex flex-wrap items-start gap-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-primary/10 shrink-0">
                  {photoUrl && <AvatarImage src={photoUrl} alt={displayName} className="object-cover" />}
                  <AvatarFallback className="bg-primary/15 text-primary font-display text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 basis-40">
                  <h2 className="font-display text-2xl font-bold break-words leading-tight">{displayName}</h2>
                  {user?.email && <p className="font-body text-xs text-muted-foreground break-all mt-1">{user.email}</p>}
                  {authProfile?.student_id && <p className="font-body text-sm text-foreground mt-2 break-words">{authProfile.student_id}{authProfile.department && ` · ${authProfile.department}`}</p>}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">
                      <Award className="h-3 w-3 mr-1" /> {role}
                    </Badge>
                    {authProfile?.is_verified && (
                      <Badge variant="outline" className="font-body text-[10px]">✓ Verified</Badge>
                    )}
                    {!authProfile?.is_verified && authProfile?.id_verification_status === "pending" && (
                      <Badge variant="outline" className="font-body text-[10px]">ID under review</Badge>
                    )}
                    {!authProfile?.is_verified && authProfile?.id_verification_status === "rejected" && (
                      <Badge variant="outline" className="font-body text-[10px] text-destructive border-destructive/40">ID not verified</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="font-body text-xs shrink-0 h-10" onClick={() => setEditorOpen(true)} aria-label="Edit profile">
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-xs font-medium">Profile Completion</span>
                  <span className="font-body text-xs text-primary font-bold">{completionPct}%</span>
                </div>
                <Progress value={completionPct} className="h-2" />
              </div>
        </motion.section>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full grid grid-cols-5 h-auto">
            <TabsTrigger value="info" className="font-body text-xs py-2">Info</TabsTrigger>
            <TabsTrigger value="achievements" className="font-body text-xs py-2">Badges</TabsTrigger>
            <TabsTrigger value="activity" className="font-body text-xs py-2">Activity</TabsTrigger>
            <TabsTrigger value="donations" className="font-body text-xs py-2">Giving</TabsTrigger>
            <TabsTrigger value="settings" className="font-body text-xs py-2">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3 mt-4">
            {/* Daily Goal · Group Sessions · Café — relocated from Home */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="border-border/60 bg-card">
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
              <Card className="border-border/60 bg-card">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <User className="h-4 w-4 text-blue" />
                    <p className="font-display text-xs font-bold">Group Session</p>
                  </div>
                  <p className="font-display text-base font-bold text-blue">Halaqa Tonight</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-1">Group 7B · 8:00 PM · 14 members</p>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card">
                <CardContent className="p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Gift className="h-4 w-4 text-primary" />
                    <p className="font-display text-xs font-bold">Café Student</p>
                  </div>
                  <p className="font-display text-base font-bold text-primary">
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
                    { icon: User, label: "Full Name", value: authProfile?.full_name || "Not set" },
                    { icon: Phone, label: "Phone", value: authProfile?.phone || "Not set" },
                    { icon: Mail, label: "Email", value: user?.email || "Not set" },
                    { icon: User, label: "Gender", value: authProfile?.gender || "Not set" },
                    { icon: Calendar, label: "Joined", value: joinedDate },
                  ].map((item) => (
                    <div key={item.label} className="leaf-profile-details flex items-center gap-3 py-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="font-body text-sm break-words">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="border border-border bg-card">
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-display text-base font-bold">Academic & Community</h3>
                  {[
                    { icon: GraduationCap, label: "Student ID", value: authProfile?.student_id || "Not set" },
                    { icon: Building, label: "University", value: universityName },
                    { icon: GraduationCap, label: "Department", value: authProfile?.department || "Not set" },
                    { icon: User, label: "Batch Year", value: authProfile?.batch_year || "Not set" },
                    { icon: Shield, label: "Role", value: role },
                  ].map((item) => (
                    <div key={item.label} className="leaf-profile-details flex items-center gap-3 py-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-[10px] text-muted-foreground">{item.label}</p>
                        <p className="font-body text-sm break-words">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {authProfile?.is_cafe_student && (
                    <Badge className="font-body bg-teal/10 text-teal border-teal/30">☕ Café Student</Badge>
                  )}
                  {authProfile?.id_card_url && (
                    <p className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5 text-primary" /> ID card uploaded
                      {authProfile.id_verification_status === "verified" && " · verified ✓"}
                      {authProfile.id_verification_status === "pending" && " · being checked"}
                      {authProfile.id_verification_status === "rejected" && ` · ${authProfile.id_verification_note ?? "could not be verified"}`}
                    </p>
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
                      <p className="font-body text-xs text-muted-foreground">{a.desc}</p>
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
            <Card className="border border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display text-sm font-bold">Level {level}</p>
                  <Badge className="font-body text-[10px] bg-primary/15 text-primary border-0">
                    {xp} XP
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="font-body text-[10px] text-muted-foreground mt-2">
                  {Math.max(0, nextLevelAt - xp)} XP to level {level + 1}
                </p>
              </CardContent>
            </Card>

            {recent.length === 0 ? (
              <Card className="border border-border bg-card">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                  <p className="font-body text-sm text-muted-foreground">
                    No activity yet. Join an event or read Qur'an to start earning points.
                  </p>
                </CardContent>
              </Card>
            ) : (
              recent.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-border bg-card">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Zap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-body text-sm">{XP_LABELS[a.source] || a.source}</p>
                          <p className="font-body text-[10px] text-muted-foreground">{timeAgo(a.created_at)}</p>
                        </div>
                      </div>
                      <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">+{a.delta} XP</Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
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
                        <Button
                          key={c.name}
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedAccent(i)}
                          aria-label={`${c.name} accent`}
                          aria-pressed={selectedAccent === i}
                          className={`h-11 w-11 rounded-full ${c.class} hover:opacity-80 ${selectedAccent === i ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''} transition-all`}
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
      <ProfileDetailsEditor open={editorOpen} onOpenChange={setEditorOpen} />
    </AppLayout>
  );
};

export default Profile;
