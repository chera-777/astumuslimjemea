import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";

const newsItems = [
  { title: "Annual Ramadan Program Announced", summary: "The committee has released the full schedule for this year's Ramadan activities, including daily iftars, tarawih, and special lectures.", date: "March 5, 2026", category: "Ramadan", featured: true },
  { title: "New Tutoring Initiative for Freshmen", summary: "Academic sector launches peer mentoring program pairing 4th and 5th year students with incoming freshmen.", date: "March 4, 2026", category: "Academic", featured: false },
  { title: "Inter-University Qur'an Competition", summary: "ASTU Muslim Jemea will host the annual Qur'an recitation competition with participants from 6 universities.", date: "March 3, 2026", category: "Qira'at", featured: false },
  { title: "Community Service Day — Campus Cleanup", summary: "Social sector organizing a campus-wide cleanup and beautification project. All groups encouraged to participate.", date: "March 2, 2026", category: "Social", featured: false },
  { title: "Financial Transparency Report Published", summary: "The financial sector has released Q1 2026 report detailing all donations received and allocations made.", date: "March 1, 2026", category: "Financial", featured: false },
  { title: "Election Timeline for 2026 Released", summary: "The committee has published the official election schedule. Nominations open April 1st.", date: "Feb 28, 2026", category: "Governance", featured: false },
];

const News = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Newspaper className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Campus News Hub</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">University updates, Islamic events & student announcements</p>
        </motion.div>

        <div className="space-y-4">
          {newsItems.map((n, i) => (
            <motion.div key={n.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`cursor-pointer hover:shadow-emerald transition-all ${n.featured ? "border-accent/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {n.featured && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-3 w-3 text-accent fill-accent" />
                          <span className="font-body text-[10px] text-accent font-semibold uppercase">Featured</span>
                        </div>
                      )}
                      <h3 className="font-display text-lg font-bold text-foreground mb-1">{n.title}</h3>
                      <p className="font-body text-sm text-muted-foreground mb-2">{n.summary}</p>
                      <div className="flex items-center gap-3">
                        <span className="font-body text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {n.date}
                        </span>
                        <Badge variant="outline" className="font-body text-[10px]">{n.category}</Badge>
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
