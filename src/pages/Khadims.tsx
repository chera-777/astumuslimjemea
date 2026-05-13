import { useState } from "react";
import { SEO } from "@/components/SEO";
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

const mockSchedule = [
  { date: "Mar 12", day: "Ramadan 10", meal: "Iftar", role: "Food Serving", students: ["Ahmed M.", "Yusuf K.", "Ibrahim A."] },
  { date: "Mar 13", day: "Ramadan 11", meal: "Suhoor", role: "Drinks", students: ["Fatima H.", "Aisha B.", "Maryam T."] },
  { date: "Mar 14", day: "Ramadan 12", meal: "Iftar", role: "Cleaning", students: ["Omar S.", "Hamza D.", "Bilal R."] },
  { date: "Mar 15", day: "Ramadan 13", meal: "Both", role: "Ittikaf Support", students: ["Khadija M.", "Zainab A."] },
  { date: "Mar 16", day: "Ramadan 14", meal: "Iftar", role: "Meal Card Ticking", students: ["Ahmed M.", "Fatima H.", "Omar S."] },
];

const Khadims = () => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [period, setPeriod] = useState<string>("ramadan");

  const toggleRole = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = () => {
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role");
      return;
    }
    toast.success("🎉 JazakAllahu Khairan! Your Khadim registration has been submitted.");
  };

  return (
    <AppLayout>
      <SEO title="Khadims — Volunteer Scheduling" description="Volunteer scheduling and management for Khadims serving during Ramadan and beyond." path="/khadims" />
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
              <HandHeart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Khadims Service</h1>
              <p className="text-muted-foreground font-body text-sm">Volunteer to serve your brothers & sisters</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active Khadims", value: "42", icon: Users, gradient: "gradient-teal" },
            { label: "Days Covered", value: "28/30", icon: Calendar, gradient: "gradient-pink" },
            { label: "Meals Served", value: "1,240", icon: Utensils, gradient: "gradient-blue" },
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
                    <button
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${
                        period === p.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <p className="font-body text-sm font-semibold">{p.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{p.desc}</p>
                    </button>
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
                      <p className="font-body text-[10px] text-muted-foreground">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <Label className="font-body text-sm">Additional Notes (Optional)</Label>
                <Textarea placeholder="Any scheduling preferences or notes..." className="font-body" />
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} className="w-full gradient-green text-primary-foreground font-body" size="lg">
              <HandHeart className="mr-2 h-5 w-5" />
              Register as Khadim
            </Button>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Khadim Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSchedule.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-3 rounded-xl bg-secondary space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="font-body text-[10px] bg-primary/10 text-primary border-0">{s.day}</Badge>
                        <span className="font-body text-sm font-semibold">{s.date}</span>
                      </div>
                      <Badge variant="outline" className="font-body text-[10px]">{s.meal}</Badge>
                    </div>
                    <p className="font-body text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{s.role}:</span>{" "}
                      {s.students.join(", ")}
                    </p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ittikaf" className="space-y-4 mt-4">
            <Card className="gamification-card">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-purple flex items-center justify-center mx-auto mb-4">
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
