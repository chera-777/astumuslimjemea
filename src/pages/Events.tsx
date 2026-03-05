import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";

const events = [
  { title: "Jumu'ah Khutbah", date: "Every Friday", time: "12:15 PM", location: "Campus Masjid", category: "Weekly", attendees: 300 },
  { title: "Ramadan Iftar Gathering", date: "March 15, 2026", time: "6:20 PM", location: "Student Center", category: "Ramadan", attendees: 150 },
  { title: "Qur'an Hifz Competition", date: "April 1, 2026", time: "9:00 AM", location: "Auditorium", category: "Competition", attendees: 50 },
  { title: "Career Workshop: CV Building", date: "March 20, 2026", time: "2:00 PM", location: "Room 301", category: "Career", attendees: 40 },
  { title: "Community Service Day", date: "March 25, 2026", time: "8:00 AM", location: "Campus Wide", category: "Social", attendees: 100 },
  { title: "Eid Celebration", date: "April 10, 2026", time: "8:00 AM", location: "Main Field", category: "Celebration", attendees: 500 },
];

const Events = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Events Calendar</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Upcoming programs & community activities</p>
        </motion.div>

        <div className="space-y-3">
          {events.map((e, i) => (
            <motion.div key={e.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className="hover:shadow-emerald transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-lg font-bold text-foreground">{e.title}</h3>
                    <Badge variant="outline" className="font-body text-[10px] shrink-0">{e.category}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="font-body text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> {e.date}</span>
                    <span className="font-body text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> {e.time}</span>
                    <span className="font-body text-xs flex items-center gap-1"><MapPin className="h-3 w-3" /> {e.location}</span>
                    <span className="font-body text-xs flex items-center gap-1"><Users className="h-3 w-3" /> {e.attendees} expected</span>
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
