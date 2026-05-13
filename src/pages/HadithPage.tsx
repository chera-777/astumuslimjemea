import { useState } from "react";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";

const collections = [
  { name: "Sahih al-Bukhari", author: "Imam al-Bukhari", hadiths: 7563, books: 97, icon: "📕", color: "from-red-500/20 to-red-600/10", desc: "The most authentic collection of hadith, compiled over 16 years" },
  { name: "Sahih Muslim", author: "Imam Muslim", hadiths: 7500, books: 56, icon: "📗", color: "from-green-500/20 to-green-600/10", desc: "Second most authentic, organized by topic with strict authentication" },
  { name: "Sunan Abu Dawud", author: "Imam Abu Dawud", hadiths: 5274, books: 43, icon: "📘", color: "from-blue-500/20 to-blue-600/10", desc: "Focuses on jurisprudence-related traditions" },
  { name: "Jami at-Tirmidhi", author: "Imam at-Tirmidhi", hadiths: 3956, books: 49, icon: "📙", color: "from-yellow-500/20 to-yellow-600/10", desc: "Includes commentary on hadith authenticity rulings" },
  { name: "Sunan an-Nasa'i", author: "Imam an-Nasa'i", hadiths: 5758, books: 51, icon: "📓", color: "from-purple-500/20 to-purple-600/10", desc: "Known for strict narrator criteria" },
  { name: "Sunan Ibn Majah", author: "Imam Ibn Majah", hadiths: 4341, books: 37, icon: "📔", color: "from-orange-500/20 to-orange-600/10", desc: "Completes the six major hadith collections" },
  { name: "Muwatta Malik", author: "Imam Malik", hadiths: 1851, books: 61, icon: "📒", color: "from-teal-500/20 to-teal-600/10", desc: "Earliest written collection, foundation of Maliki fiqh" },
  { name: "40 Hadith Nawawi", author: "Imam an-Nawawi", hadiths: 42, books: 1, icon: "⭐", color: "from-amber-500/20 to-amber-600/10", desc: "Essential hadiths every Muslim should know" },
  { name: "Riyadh as-Salihin", author: "Imam an-Nawawi", hadiths: 1896, books: 19, icon: "🌟", color: "from-emerald-500/20 to-emerald-600/10", desc: "Garden of the Righteous — practical daily guidance" },
];

const sampleHadiths = [
  { text: "Actions are judged by intentions, and every person will get what they intended.", narrator: "Umar ibn al-Khattab", source: "Bukhari & Muslim", number: 1 },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", narrator: "Anas ibn Malik", source: "Bukhari & Muslim", number: 13 },
  { text: "Leave that which makes you doubt for that which does not make you doubt.", narrator: "Hasan ibn Ali", source: "Tirmidhi & Nasa'i", number: 11 },
];

const HadithPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const filtered = collections.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  if (selectedCollection) {
    const col = collections.find(c => c.name === selectedCollection);
    return (
      <AppLayout>
      <SEO title="Hadith Collections — Bukhari, Muslim & More" description="Browse authentic Hadith collections including Bukhari, Muslim, Tirmidhi, and others." path="/hadith" jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Hadith Collections", url: "https://astu-jemea-connect.lovable.app/hadith" }} />
        <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-24">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCollection(null)} className="font-body text-xs">
              ← Back
            </Button>
            <h1 className="font-display text-lg font-bold">{col?.name}</h1>
          </div>
          <Card className={`border-0 bg-gradient-to-br ${col?.color}`}>
            <CardContent className="p-5 text-center">
              <span className="text-4xl">{col?.icon}</span>
              <p className="font-body text-sm text-muted-foreground mt-2">{col?.desc}</p>
              <div className="flex items-center justify-center gap-3 mt-2 font-body text-xs text-muted-foreground">
                <span>{col?.hadiths.toLocaleString()} hadiths</span>
                <span>•</span>
                <span>{col?.books} books</span>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {sampleHadiths.map((h, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="border border-border bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-[10px] font-bold text-primary">#{h.number}</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-body">{h.source}</Badge>
                    </div>
                    <p className="font-body text-sm leading-relaxed text-foreground mb-2">"{h.text}"</p>
                    <p className="font-body text-xs text-muted-foreground">— {h.narrator}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <p className="text-center font-body text-xs text-muted-foreground">More hadiths coming soon • Full API integration planned</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📚</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Hadith Collections</h1>
          <p className="text-muted-foreground font-body text-sm">The six major books and more</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search collections..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 font-body rounded-xl" />
        </div>

        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="border border-border bg-card hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setSelectedCollection(c.name)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center shrink-0`}>
                    <span className="text-2xl">{c.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-bold">{c.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground mt-0.5">{c.author}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{c.hadiths.toLocaleString()} hadiths • {c.books} books</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default HadithPage;
