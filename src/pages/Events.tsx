import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users, Star } from "lucide-react";
import { motion } from "framer-motion";

const events = [
  { title: "Jumu'ah Khutbah", date: "Every Friday", time: "12:15 PM", location: "Campus Masjid", category: "Weekly", attendees: 300, gradient: "gradient-teal", featured: true },
  { title: "Ramadan Iftar Gathering", date: "March 15, 2026", time: "6:20 PM", location: "Student Center", category: "Ramadan", attendees: 150, gradient: "gradient-gold", featured: true },
  { title: "Qur'an Hifz Competition", date: "April 1, 2026", time: "9:00 AM", location: "Auditorium", category: "Competition", attendees: 50, gradient: "gradient-green", featured: false },
  { title: "Career Workshop: CV Building", date: "March 20, 2026", time: "2:00 PM", location: "Room 301", category: "Career", attendees: 40, gradient: "gradient-blue", featured: false },
  { title: "Community Service Day", date: "March 25, 2026", time: "8:00 AM", location: "Campus Wide", category: "Social", attendees: 100, gradient: "gradient-pink", featured: false },
  { title: "Eid Celebration", date: "April 10, 2026", time: "8:00 AM", location: "Main Field", category: "Celebration", attendees: 500, gradient: "gradient-purple", featured: true },
];

const Events = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-pink flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Events Calendar</h1>
          <p className="text-muted-foreground font-body text-sm">Upcoming programs & community activities</p>
        </motion.div>

        <div className="space-y-4">
          {events.map((e, i) => (
            <motion.div key={e.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`gamification-card cursor-pointer ${e.featured ? "ring-2 ring-primary/20" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl ${e.gradient} flex items-center justify-center shrink-0 mt-0.5`}>
                      {e.featured ? <Star className="h-5 w-5 text-primary-foreground" /> : <Calendar className="h-5 w-5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      {e.featured && <span className="font-body text-[10px] text-primary font-semibold uppercase">⭐ Featured</span>}
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{e.title}</h3>
                      <div className="flex flex-wrap gap-3 text-muted-foreground">
                        <span className="font-body text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.date}</span>
                        <span className="font-body text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> {e.time}</span>
                        <span className="font-body text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                        <span className="font-body text-xs flex items-center gap-1"><Users className="h-3 w-3" /> {e.attendees}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-body text-[10px] shrink-0">{e.category}</Badge>
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

export default Events;
