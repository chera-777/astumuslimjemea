import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Moon, Utensils, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const prayerTimes = [
  { name: "Fajr", time: "5:15 AM" },
  { name: "Dhuhr", time: "12:30 PM" },
  { name: "Asr", time: "3:45 PM" },
  { name: "Maghrib", time: "6:20 PM" },
  { name: "Isha", time: "7:45 PM" },
];

const ramadanDays = Array.from({ length: 10 }, (_, i) => ({
  day: i + 1,
  suhoor: "4:45 AM",
  iftar: "6:20 PM",
  passed: i < 3,
}));

const Ramadan = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Moon className="h-6 w-6 text-accent" />
            <h1 className="font-display text-2xl font-bold text-foreground">Ramadan Hub</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Tools, meal cards, calendars & prayer times</p>
        </motion.div>

        {/* Meal Card */}
        <Card className="border-accent/30 overflow-hidden">
          <div className="h-2 gradient-gold" />
          <CardContent className="p-6 text-center">
            <Utensils className="h-10 w-10 text-accent mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold mb-1">Your Ramadan Meal Card</h3>
            <p className="text-muted-foreground font-body text-sm mb-4">Auto-generated for café students</p>
            <div className="inline-block px-6 py-3 rounded-xl bg-secondary">
              <p className="font-body text-xs text-muted-foreground">Card ID</p>
              <p className="font-display text-lg font-bold text-primary">RMC-2026-1234</p>
              <Badge variant="default" className="font-body mt-2">Active — Café Student</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Today's Prayer Times
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {prayerTimes.map((p) => (
                <div key={p.name} className="text-center p-2 rounded-lg bg-secondary">
                  <p className="font-body text-[10px] text-muted-foreground">{p.name}</p>
                  <p className="font-body text-sm font-semibold">{p.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fasting Calendar */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-display text-lg font-bold mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> Fasting Calendar
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {ramadanDays.map((d) => (
                <div key={d.day} className={`text-center p-2 rounded-lg ${d.passed ? "bg-primary/10" : "bg-secondary"}`}>
                  <p className="font-body text-xs font-bold">{d.day}</p>
                  <p className="font-body text-[8px] text-muted-foreground">{d.iftar}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button variant="hero" className="w-full" size="lg">🔊 Play Azan</Button>
      </div>
    </AppLayout>
  );
};

export default Ramadan;
