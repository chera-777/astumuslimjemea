import { NaturePageHeader } from "@/components/layout/NaturePageHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { EmptyState } from "@/components/EmptyState";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HandHeart, Calendar, Users, Utensils, Droplets, Sparkles, Moon as MoonIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const khadimRoles = [
  { id: "meal_card", label: "Meal Card Ticking", icon: "🎫", desc: "Managing the student meal card system" },
  { id: "food_serving", label: "Food Serving", icon: "🍽️", desc: "Serving injera, cooked dishes, tea & shorba" },
  { id: "drinks", label: "Water & Drinks", icon: "💧", desc: "Preparing and distributing water and drinks" },
  { id: "cleaning", label: "Cleaning", icon: "🧹", desc: "Cleaning the meal hall after iftar or suhoor" },
  { id: "ittikaf_support", label: "Ittikaf Support", icon: "🕌", desc: "Delivering food to students in ittikaf at the masjid" },
];

type Shift = { id: string; assigned_date: string; assigned_role: string; meal_type: string };

const Khadims = () => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>("ramadan");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registrations, setRegistrations] = useState<{ id: string; period: string; is_approved: boolean | null }[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { user, profile } = useAuth();

  const load = async () => {
    if (!user) return;
    const { data: regs } = await supabase.from("khadim_registrations").select("id, period, is_approved").eq("user_id", user.id);
    setRegistrations(regs ?? []);
    const ids = (regs ?? []).map(r => r.id);
    if (ids.length) {
      const { data } = await supabase.from("khadim_schedule").select("id, assigned_date, assigned_role, meal_type").in("khadim_id", ids).order("assigned_date");
      setShifts(data ?? []);
    } else setShifts([]);
    setLoaded(true);
  };
  useEffect(() => { load(); }, [user?.id]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = shifts.filter(s => s.assigned_date >= today);
  const mySchedule = upcoming.map(s => ({
    ...s,
    label: new Date(s.assigned_date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
  }));

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }
    if (!user || !profile?.university_id) {
      toast.error("Please complete your profile first");
      return;
    }
    if (registrations.some(r => r.period === period)) {
      toast.info("You're already registered for this period");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("khadim_registrations").insert({
      user_id: user.id, university_id: profile.university_id, period,
      preferred_roles: selectedRoles, availability_notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (error) { toast.error("Couldn't submit registration"); return; }
    toast.success("JazakAllahu Khairan! Your Khadim registration has been submitted.");
    setSelectedRoles([]); setNotes("");
    load();
  };

  return (
    <AppLayout>
      <SEO title="Khadims — Volunteer Scheduling" description="Volunteer scheduling and management for Khadims serving during Ramadan and beyond." path="/khadims" />
      <div className="p-4 md:p-6 space-y-6">
        <NaturePageHeader title="Khadims Service" subtitle="Serve your community" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Registrations", value: String(registrations.length), icon: Users, gradient: "gradient-teal" },
            { label: "Upcoming Shifts", value: String(upcoming.length), icon: Calendar, gradient: "gradient-pink" },
            { label: "Shifts Served", value: String(shifts.length - upcoming.length), icon: Utensils, gradient: "gradient-blue" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="gamification-card">
                <CardContent className="p-3 text-center">
                  <div className={`w-8 h-8 rounded-lg ${stat.gradient} flex items-center justify-center mx-auto mb-2`}>
                    <stat.icon className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <p className="font-display text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="register" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="register" className="font-body text-xs py-2">Register</TabsTrigger>
            <TabsTrigger value="schedule" className="font-body text-xs py-2">Schedule</TabsTrigger>
            <TabsTrigger value="ittikaf" className="font-body text-xs py-2">Ittikaf</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="space-y-4 mt-4">
            {/* Period Selection */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-display text-base font-bold mb-3">Service Period</h3>
                <div className="flex gap-2">
                  {[
                    { id: "ramadan", label: "🌙 Ramadan", desc: "Iftar & Suhoor" },
                    { id: "regular", label: "📅 Regular", desc: "Outside Ramadan" },
                  ].map((p) => (
                    <Button
                      variant="outline"
                      aria-pressed={period === p.id}
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`block flex-1 h-auto p-4 rounded-lg border text-center transition-all ${
                        period === p.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-body text-sm font-semibold">{p.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{p.desc}</p>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Selection */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="font-display text-base">Choose Your Roles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {khadimRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => toggleRole(role.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition-all ${
                      selectedRoles.includes(role.id)
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-secondary hover:border-primary/20"
                    }`}
                  >
                    <Checkbox checked={selectedRoles.includes(role.id)} />
                    <span className="text-xl">{role.icon}</span>
                    <div className="flex-1">
                      <p className="font-body text-sm font-semibold">{role.label}</p>
                      <p className="font-body text-xs text-muted-foreground leading-relaxed mt-1">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Label className="font-body text-sm">Additional Notes (Optional)</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder="Any scheduling preferences or notes..." className="font-body" />
              </CardContent>
            </Card>

            <Button variant="nature" onClick={handleSubmit} disabled={submitting} className="w-full h-12 font-body" size="lg">
              <HandHeart className="mr-2 h-5 w-5" />
              {submitting ? "Submitting…" : "Register as Khadim"}
            </Button>
            {registrations.length > 0 && (
              <p className="font-body text-xs text-center text-muted-foreground">
                Registered: {registrations.map(r => `${r.period} (${r.is_approved ? "approved" : "pending approval"})`).join(", ")}
              </p>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> My Booked Shifts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loaded && mySchedule.length === 0 && (
                  <EmptyState icon={Calendar} title="No upcoming shifts" description={registrations.length ? "Your registration is in. Shifts will appear here once the committee books you." : "Register as a Khadim and your service shifts will appear here."} />
                )}
                {mySchedule.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-3 rounded-xl bg-secondary space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-body text-sm font-semibold">{s.label}</span>
                      </div>
                      <Badge variant="outline" className="font-body text-[10px] capitalize">{s.meal_type}</Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Your role:</span> {s.assigned_role}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ittikaf" className="space-y-4 mt-4">
            <Card className="gamification-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-lg gradient-purple flex items-center justify-center mx-auto mb-4">
                  <MoonIcon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold mb-2">Ittikaf Support</h3>
                <p className="text-muted-foreground font-body text-sm mb-4 max-w-md mx-auto">
                  For students in ittikaf at the masjid, Khadims ensure they receive meals. 
                  Food is collected from the school and delivered directly by assigned volunteers.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                  <div className="p-3 rounded-xl bg-secondary text-center">
                    <p className="font-display text-lg font-bold text-primary">8</p>
                    <p className="font-body text-[10px] text-muted-foreground">Students in Ittikaf</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary text-center">
                    <p className="font-display text-lg font-bold text-accent">4</p>
                    <p className="font-body text-[10px] text-muted-foreground">Delivery Khadims</p>
                  </div>
                </div>
                <Button className="mt-4 gradient-teal text-primary-foreground font-body" size="sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Volunteer for Ittikaf Support
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Khadims;
