import { NaturePageHeader } from "@/components/layout/NaturePageHeader";
import { useState } from "react";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, BookOpen, Star } from "lucide-react";
import { motion } from "framer-motion";

const categories = ["All", "Morning", "Evening", "Protection", "Forgiveness", "Travel", "Food", "Sleep"];

const duas = [
  { title: "Morning Remembrance", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", transliteration: "Asbahnaa wa asbahal mulku lillah", meaning: "We have reached the morning and at this very time the dominion belongs to Allah.", category: "Morning", favorite: true },
  { title: "Evening Remembrance", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", transliteration: "Amsaynaa wa amsal mulku lillah", meaning: "We have reached the evening and at this very time the dominion belongs to Allah.", category: "Evening", favorite: false },
  { title: "Protection from Evil", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", transliteration: "A'udhu bikalimatillahit-taammati min sharri ma khalaq", meaning: "I seek refuge in the perfect words of Allah from the evil of what He has created.", category: "Protection", favorite: true },
  { title: "Seeking Forgiveness", arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ", transliteration: "Astaghfirullahal-'Adheemal-ladhi la ilaha illa Huwa", meaning: "I seek the forgiveness of Allah the Mighty, whom there is no god but He.", category: "Forgiveness", favorite: false },
  { title: "Before Eating", arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", transliteration: "Bismillahi wa 'ala barakatillah", meaning: "In the name of Allah and with the blessings of Allah.", category: "Food", favorite: false },
  { title: "Before Sleeping", arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amutu wa ahya", meaning: "In Your name, O Allah, I die and I live.", category: "Sleep", favorite: true },
  { title: "Travel Dua", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ", transliteration: "Subhanalladhi sakhkhara lana hadha", meaning: "Glory to Him who has subjected this to us, and we could never have it by our efforts.", category: "Travel", favorite: false },
];

const DuaPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const filtered = duas.filter(d =>
    (category === "All" || d.category === category) &&
    (d.title.toLowerCase().includes(search.toLowerCase()) || d.meaning.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <SEO title="Dua Collection — ASTU Muslim Jemea" description="A curated collection of authentic duas for morning, evening, protection, travel, and more." path="/dua" jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Dua Collection", url: "https://astu-jemea-connect.lovable.app/dua" }} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-24">
        <NaturePageHeader title="Du’a Collection" subtitle="Supplications for every occasion" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search duas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 font-body rounded-xl" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full font-body text-xs whitespace-nowrap transition-all ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-secondary/80"}`}
            >{c}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((d, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border border-border bg-card hover:border-primary/20 transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-body">{d.category}</Badge>
                      <h3 className="font-body text-sm font-semibold">{d.title}</h3>
                    </div>
                    <Heart className={`h-4 w-4 ${d.favorite ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </div>
                  <p className="text-right text-xl leading-[2.5] text-foreground" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                    {d.arabic}
                  </p>
                  <p className="font-body text-xs text-primary italic">{d.transliteration}</p>
                  <p className="font-body text-sm text-muted-foreground">{d.meaning}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default DuaPage;
