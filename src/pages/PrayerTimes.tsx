import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, ChevronLeft, ChevronRight, MapPin, Settings } from "lucide-react";
import { motion } from "framer-motion";

const prayerData = [
  { name: "Imsak", time: "5:02 AM", icon: "🌑", notify: false },
  { name: "Fajr", time: "5:12 AM", icon: "🌅", notify: true },
  { name: "Sunrise", time: "6:22 AM", icon: "☀️", notify: false },
  { name: "Dhuhr", time: "12:27 PM", icon: "🌞", notify: true },
  { name: "Asr", time: "3:37 PM", icon: "🌤️", notify: true },
  { name: "Maghrib", time: "6:33 PM", icon: "🌇", notify: true },
  { name: "Isha'a", time: "7:39 PM", icon: "🌙", notify: true },
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const islamicEvents = [
  { name: "Hajj", hijri: "1447H/12/8", gregorian: "2026/5/25" },
  { name: "Eid al-Adha", hijri: "1447H/12/10", gregorian: "2026/5/27" },
  { name: "Al-Hijira", hijri: "1448H/1/1", gregorian: "2026/6/16" },
  { name: "Ashura", hijri: "1448H/1/10", gregorian: "2026/6/25" },
  { name: "Mawlid al-Nabi", hijri: "1448H/3/12", gregorian: "2026/8/25" },
  { name: "Laylat al-Miraj", hijri: "1448H/7/27", gregorian: "2027/1/5" },
  { name: "Laylat al-Baraat", hijri: "1448H/8/15", gregorian: "2027/1/23" },
  { name: "Ramadan (start)", hijri: "1448H/9/1", gregorian: "2027/2/8" },
  { name: "Laylat al-Qadr", hijri: "1448H/9/27", gregorian: "2027/3/6" },
  { name: "Eid al-Fitr", hijri: "1448H/10/1", gregorian: "2027/3/9" },
];

const hijriMonths = ["Muharram","Safar","Rabi al-Awwal","Rabi al-Thani","Jumada al-Ula","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhul Qi'dah","Dhul Hijjah"];

const PrayerTimes = () => {
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(prayerData.map(p => [p.name, p.notify]))
  );
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dateNum = today.getDate();

  const currentHour = today.getHours();
  const nextPrayer = currentHour < 5 ? "Fajr" : currentHour < 12 ? "Dhuhr" : currentHour < 15 ? "Asr" : currentHour < 18 ? "Maghrib" : "Isha'a";

  const toggleNotify = (name: string) => {
    setNotifications(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Generate calendar days for current month
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        {/* Location Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="font-display text-xl font-bold">Adama</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
          </div>
        </motion.div>

        {/* Mosque Banner with Prayer Time */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="overflow-hidden border-0 relative" style={{
            background: "linear-gradient(135deg, hsl(168 65% 20%), hsl(168 55% 35%), hsl(168 50% 45%))"
          }}>
            <CardContent className="p-6 text-center relative z-10">
              <div className="absolute inset-0 islamic-pattern opacity-20" />
              <p className="text-sm text-white/70 font-body relative z-10">
                {today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-white/50 font-body relative z-10">11 Shawwal 1447</p>

              {/* Week day selector */}
              <div className="flex items-center justify-center gap-1 mt-4 relative z-10">
                <ChevronLeft className="h-4 w-4 text-white/50" />
                {Array.from({ length: 7 }, (_, i) => {
                  const d = dateNum - dayOfWeek + i;
                  const isToday = i === dayOfWeek;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <span className="text-[10px] text-white/50 font-body">{weekDays[i]}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${isToday ? 'bg-primary text-white' : 'text-white/70'}`}>
                        <span className="text-sm font-body font-medium">{d > 0 ? d : ''}</span>
                      </div>
                    </div>
                  );
                })}
                <ChevronRight className="h-4 w-4 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prayer Times List */}
        <div className="space-y-2">
          {prayerData.map((p, i) => {
            const isNext = p.name === nextPrayer;
            return (
              <motion.div key={p.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className={`border-0 ${isNext ? 'ring-2 ring-primary bg-primary/5' : 'bg-card'}`}>
                  <CardContent className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.icon}</span>
                      <div>
                        <p className={`font-body text-sm font-semibold ${isNext ? 'text-primary' : ''}`}>{p.name}</p>
                        {isNext && <span className="text-[10px] text-primary font-body">Next Prayer</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-body text-sm font-medium">{p.time}</span>
                      <button onClick={() => toggleNotify(p.name)} className="text-muted-foreground hover:text-primary transition-colors">
                        {notifications[p.name] ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4" />}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Islamic Calendar */}
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-auto">
            <TabsTrigger value="calendar" className="font-body text-xs py-2">📅 Hijri Calendar</TabsTrigger>
            <TabsTrigger value="events" className="font-body text-xs py-2">🌟 Islamic Events</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-4">
            <Card className="border-0 bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                  <h3 className="font-display text-lg font-bold">Shawwal 1447 AH</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekDays.map(d => (
                    <div key={d} className="text-[10px] font-body text-muted-foreground font-medium py-1">{d[0]}</div>
                  ))}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`e${i}`} />)}
                  {calendarDays.map(d => (
                    <button
                      key={d}
                      className={`h-8 w-8 mx-auto rounded-full flex items-center justify-center text-sm font-body transition-colors ${
                        d === dateNum ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-secondary'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-4 space-y-2">
            {islamicEvents.map((e, i) => (
              <motion.div key={e.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="border-0 bg-card">
                  <CardContent className="p-3.5 flex items-center justify-between">
                    <div>
                      <p className="font-body text-sm font-semibold">{e.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{e.hijri}</p>
                    </div>
                    <span className="font-body text-sm text-primary font-medium">{e.gregorian}</span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PrayerTimes;
