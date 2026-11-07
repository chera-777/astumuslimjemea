import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Newspaper, Calendar, Star, MapPin, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import eventTafsir from "@/assets/event-tafsir.jpg";
import eventHadith from "@/assets/event-hadith.jpg";
import eventFiqh from "@/assets/event-fiqh.jpg";
import eventChallenge from "@/assets/event-challenge.jpg";
import eventMath from "@/assets/event-math.jpg";
import eventCoding from "@/assets/event-coding.jpg";
import { NaturePageHeader } from "@/components/layout/NaturePageHeader";

const newsItems = [
  {
    title: "Annual Ramadan Program Announced",
    summary: "The committee has released the full schedule for this year's Ramadan activities, including daily iftars, tarawih, and special lectures from renowned scholars.",
    date: "March 5, 2026", readTime: "3 min read", category: "Ramadan", featured: true,
    image: eventTafsir, location: "Main Masjid",
  },
  {
    title: "New Tutoring Initiative for Freshmen",
    summary: "Academic sector launches peer mentoring program pairing 4th and 5th year students with incoming freshmen across all departments.",
    date: "March 4, 2026", readTime: "2 min read", category: "Academic", featured: false,
    image: eventMath, location: "Academic Block",
  },
  {
    title: "Inter-University Qur'an Competition",
    summary: "ASTU Muslim Jemea will host the annual Qur'an recitation competition with participants from 6 universities. Registration open until April 10.",
    date: "March 3, 2026", readTime: "4 min read", category: "Qira'at", featured: true,
    image: eventChallenge, location: "Auditorium A",
  },
  {
    title: "Community Service Day — Campus Cleanup",
    summary: "Social sector organizing a campus-wide cleanup and beautification project. All groups encouraged to participate.",
    date: "March 2, 2026", readTime: "2 min read", category: "Social", featured: false,
    image: eventFiqh, location: "Campus-wide",
  },
  {
    title: "Financial Transparency Report Published",
    summary: "The financial sector has released Q1 2026 report detailing all donations received and allocations made.",
    date: "March 1, 2026", readTime: "5 min read", category: "Financial", featured: false,
    image: eventCoding, location: "Online",
  },
  {
    title: "Election Timeline for 2026 Released",
    summary: "The committee has published the official election schedule. Nominations open April 1st.",
    date: "Feb 28, 2026", readTime: "3 min read", category: "Governance", featured: false,
    image: eventHadith, location: "Committee Hall",
  },
];

const categoryColors: Record<string, string> = {
  Ramadan: "bg-teal/15 text-teal border-teal/30",
  Academic: "bg-blue/15 text-blue border-blue/30",
  "Qira'at": "bg-primary/15 text-primary border-primary/30",
  Social: "bg-accent/15 text-accent border-accent/30",
  Financial: "bg-primary/15 text-primary border-primary/30",
  Governance: "bg-accent/15 text-accent border-accent/30",
};

const eventCategories = new Set(["Ramadan", "Qira'at", "Social"]);

const News = () => {
  const [tab, setTab] = useState<"all" | "news" | "events">("all");

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#events") {
      setTab("events");
    }
  }, []);

  const filtered = newsItems.filter((n) =>
    tab === "all" ? true : tab === "events" ? eventCategories.has(n.category) : !eventCategories.has(n.category)
  );
  const featured = filtered.find((n) => n.featured) || filtered[0];
  const rest = filtered.filter((n) => n !== featured);

  return (
    <AppLayout>
      <SEO
        title="News & Events — ASTU Muslim Jemea"
        description="Latest news, announcements, and upcoming community events from ASTU Muslim Jemea."
        path="/news"
        jsonLd={newsItems.map((n) => ({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: n.title,
          description: n.summary,
          datePublished: n.date,
          articleSection: n.category,
        }))}
      />
      <div className="space-y-6">
        <NaturePageHeader title="News & Events" subtitle="University updates and community gatherings" />

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="all" className="text-sm font-body">All</TabsTrigger>
            <TabsTrigger value="news" className="text-sm font-body">News</TabsTrigger>
            <TabsTrigger value="events" id="events" className="text-sm font-body">Events</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="mt-5 space-y-5">
            {featured && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <article className="border-b border-border pb-6 group">
                  <div className="relative aspect-[16/7] min-h-40 overflow-hidden rounded-lg">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <Badge className="absolute top-3 left-3 bg-card/95 text-primary border-border text-xs font-body">
                      <Star className="h-3 w-3 mr-1" /> Featured
                    </Badge>
                  </div>
                    <div className="pt-5">
                      <Badge className={`${categoryColors[featured.category]} text-xs font-body border mb-3`}>{featured.category}</Badge>
                      <h2 className="font-display text-2xl font-bold text-foreground leading-tight">{featured.title}</h2>
                      <p className="font-body text-sm leading-relaxed text-muted-foreground mt-2 max-w-3xl">{featured.summary}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {featured.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.readTime}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {featured.location}</span>
                      </div>
                    </div>
                </article>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rest.map((n, i) => (
                <motion.div key={n.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden border-border/60 hover:border-primary/40 transition-all group h-full">
                    <div className="flex flex-col">
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img src={n.image} alt={n.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <Badge className="absolute top-3 left-3 bg-card/95 text-primary text-xs font-body border-border">{n.category}</Badge>
                        {n.featured && (
                          <Badge className="absolute top-3 right-3 bg-card/95 text-primary border-border text-xs font-body">
                            <Star className="h-2.5 w-2.5 mr-0.5" /> Featured
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-5 flex flex-col gap-3">
                        <h3 className="font-display text-xl font-bold text-foreground leading-tight">{n.title}</h3>
                        <p className="font-body text-sm leading-relaxed text-muted-foreground">{n.summary}</p>
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-border/50">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground font-body">
                            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {n.date}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {n.location}</span>
                          </div>
                          <span className="sr-only">{n.readTime}</span>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default News;
