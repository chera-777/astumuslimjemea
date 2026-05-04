import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Star } from "lucide-react";
import { motion } from "framer-motion";
import eventTafsir from "@/assets/event-tafsir.jpg";
import eventHadith from "@/assets/event-hadith.jpg";
import eventFiqh from "@/assets/event-fiqh.jpg";
import eventChallenge from "@/assets/event-challenge.jpg";
import eventCoding from "@/assets/event-coding.jpg";
import eventMath from "@/assets/event-math.jpg";

const events = [
  { title: "Jumu'ah Khutbah", date: "Every Friday", time: "12:15 PM", location: "Campus Masjid", category: "Weekly", attendees: 300, image: eventTafsir, featured: true, color: "bg-primary/20 text-primary border-primary/30" },
  { title: "Ramadan Iftar Gathering", date: "March 15, 2026", time: "6:20 PM", location: "Student Center", category: "Ramadan", attendees: 150, image: eventFiqh, featured: true, color: "bg-gold/20 text-gold border-gold/30" },
  { title: "Qur'an Hifz Competition", date: "April 1, 2026", time: "9:00 AM", location: "Auditorium", category: "Competition", attendees: 50, image: eventChallenge, featured: false, color: "bg-accent/20 text-accent border-accent/30" },
  { title: "Career Workshop: CV Building", date: "March 20, 2026", time: "2:00 PM", location: "Room 301", category: "Career", attendees: 40, image: eventCoding, featured: false, color: "bg-blue-500/20 text-blue-500 border-blue-500/30" },
  { title: "Community Service Day", date: "March 25, 2026", time: "8:00 AM", location: "Campus Wide", category: "Social", attendees: 100, image: eventMath, featured: false, color: "bg-green-500/20 text-green-500 border-green-500/30" },
  { title: "Eid Celebration", date: "April 10, 2026", time: "8:00 AM", location: "Main Field", category: "Celebration", attendees: 500, image: eventHadith, featured: true, color: "bg-purple-500/20 text-purple-500 border-purple-500/30" },
];

const Events = () => {
  const featured = events.filter((e) => e.featured);
  const others = events.filter((e) => !e.featured);

  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto p-3 md:p-5 space-y-4 overflow-x-hidden">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground font-body text-xs">Upcoming programs & community activities</p>
        </motion.div>

        {/* Featured grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {featured.map((e, i) => (
            <motion.div key={e.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden border-border/60 hover:shadow-glow transition-all group h-full">
                <div className="relative h-40 overflow-hidden">
                  <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                  <Badge className={`absolute top-2 left-2 text-[9px] border ${e.color}`}>
                    <Star className="h-3 w-3 mr-1" /> Featured
                  </Badge>
                  <Badge className="absolute top-2 right-2 bg-card/70 backdrop-blur text-foreground text-[9px] border-border">{e.category}</Badge>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-display text-base font-bold drop-shadow">{e.title}</p>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-[10px] flex items-center gap-1 text-primary"><Calendar className="h-3 w-3" />{e.date}</span>
                    <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" />{e.time}</span>
                    <span className="text-[10px] flex items-center gap-1 text-muted-foreground"><MapPin className="h-3 w-3" />{e.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{e.attendees} going</span>
                    <Button size="sm" className="h-7 text-[10px]">RSVP</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <h3 className="font-display text-base font-bold mt-2">More Events</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {others.map((e, i) => (
            <motion.div key={e.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden border-border/60 hover:shadow-glow transition-all group h-full">
                <div className="relative h-24 overflow-hidden">
                  <img src={e.image} alt={e.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className={`absolute top-1.5 left-1.5 text-[8px] border ${e.color}`}>{e.category}</Badge>
                </div>
                <CardContent className="p-2.5">
                  <p className="font-display text-xs font-bold leading-tight line-clamp-2">{e.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" />{e.date}</p>
                  <p className="text-[9px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</p>
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
