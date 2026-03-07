import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const newsItems = [
  { title: "Annual Ramadan Program Announced", summary: "The committee has released the full schedule for this year's Ramadan activities, including daily iftars, tarawih, and special lectures.", date: "March 5, 2026", category: "Ramadan", featured: true, color: "gradient-gold" },
  { title: "New Tutoring Initiative for Freshmen", summary: "Academic sector launches peer mentoring program pairing 4th and 5th year students with incoming freshmen.", date: "March 4, 2026", category: "Academic", featured: false, color: "gradient-blue" },
  { title: "Inter-University Qur'an Competition", summary: "ASTU Muslim Jemea will host the annual Qur'an recitation competition with participants from 6 universities.", date: "March 3, 2026", category: "Qira'at", featured: false, color: "gradient-green" },
  { title: "Community Service Day — Campus Cleanup", summary: "Social sector organizing a campus-wide cleanup and beautification project. All groups encouraged to participate.", date: "March 2, 2026", category: "Social", featured: false, color: "gradient-pink" },
  { title: "Financial Transparency Report Published", summary: "The financial sector has released Q1 2026 report detailing all donations received and allocations made.", date: "March 1, 2026", category: "Financial", featured: false, color: "gradient-teal" },
  { title: "Election Timeline for 2026 Released", summary: "The committee has published the official election schedule. Nominations open April 1st.", date: "Feb 28, 2026", category: "Governance", featured: false, color: "gradient-purple" },
];

const News = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
              <Newspaper className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mt-2">Campus News Hub</h1>
          <p className="text-muted-foreground font-body text-sm">University updates, Islamic events & announcements</p>
        </motion.div>

        <div className="space-y-4">
          {newsItems.map((n, i) => (
            <motion.div key={n.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`gamification-card cursor-pointer ${n.featured ? "ring-2 ring-gold/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${n.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {n.featured ? <Star className="h-5 w-5 text-primary-foreground" /> : <TrendingUp className="h-5 w-5 text-primary-foreground" />}
                    </div>
                    <div className="flex-1">
                      {n.featured && (
                        <span className="font-body text-[10px] text-gold font-semibold uppercase">⭐ Featured</span>
                      )}
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{n.title}</h3>
                      <p className="font-body text-sm text-muted-foreground mb-2">{n.summary}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {n.date}
                        </span>
                        <Badge variant="outline" className="font-body text-[10px] rounded-full">{n.category}</Badge>
                      </div>
                    </div>
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

export default News;
