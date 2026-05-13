import { useState } from "react";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Check } from "lucide-react";
import { motion } from "framer-motion";

const adhkarSections = [
  {
    title: "Morning Adhkar", icon: "🌅", time: "After Fajr",
    items: [
      { arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", count: 1, translation: "We have reached the morning and the dominion belongs to Allah" },
      { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, translation: "Glory and praise be to Allah" },
      { arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", count: 10, translation: "There is no god but Allah alone" },
      { arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", count: 100, translation: "I seek forgiveness from Allah and repent to Him" },
    ]
  },
  {
    title: "Evening Adhkar", icon: "🌙", time: "After Asr",
    items: [
      { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ", count: 1, translation: "We have reached the evening and the dominion belongs to Allah" },
      { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", count: 100, translation: "Glory and praise be to Allah" },
      { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ", count: 3, translation: "O Allah, I ask You for well-being" },
    ]
  },
  {
    title: "After Salah", icon: "🕌", time: "After every prayer",
    items: [
      { arabic: "أَسْتَغْفِرُ اللَّهَ", count: 3, translation: "I seek forgiveness from Allah" },
      { arabic: "سُبْحَانَ اللَّهِ", count: 33, translation: "Glory be to Allah" },
      { arabic: "الْحَمْدُ لِلَّهِ", count: 33, translation: "Praise be to Allah" },
      { arabic: "اللَّهُ أَكْبَرُ", count: 33, translation: "Allah is the Greatest" },
    ]
  },
];

const AdhkarPage = () => {
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState(0);
  const section = adhkarSections[activeSection];

  const getKey = (sIdx: number, iIdx: number) => `${sIdx}-${iIdx}`;
  const increment = (key: string) => setCounters(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  const reset = (key: string) => setCounters(prev => ({ ...prev, [key]: 0 }));

  return (
    <AppLayout>
      <SEO title="Adhkar — Daily Remembrances" description="Daily adhkar and remembrances for morning, evening, and after prayer." path="/adhkar" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🕌</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Daily Adhkar</h1>
          <p className="text-muted-foreground font-body text-sm">Morning, Evening & After Salah</p>
        </motion.div>

        {/* Section tabs */}
        <div className="flex gap-2 justify-center">
          {adhkarSections.map((s, i) => (
            <button key={i} onClick={() => setActiveSection(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-xs transition-all ${activeSection === i ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
            >
              <span>{s.icon}</span> {s.title.split(" ")[0]}
            </button>
          ))}
        </div>

        <p className="text-center font-body text-xs text-muted-foreground">{section.time}</p>

        <div className="space-y-3">
          {section.items.map((item, i) => {
            const key = getKey(activeSection, i);
            const current = counters[key] || 0;
            const done = current >= item.count;
            return (
              <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={`border transition-all ${done ? "border-green-500/50 bg-green-500/5" : "border-border bg-card"}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={done ? "default" : "outline"} className="text-[9px] font-body">
                        {done ? <><Check className="h-3 w-3 mr-1" /> Done</> : `${current}/${item.count}`}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => reset(key)}>
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    </div>
                    <button onClick={() => !done && increment(key)} className="w-full text-left" disabled={done}>
                      <p className="text-right text-xl leading-[2.5] text-foreground" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                        {item.arabic}
                      </p>
                    </button>
                    <p className="font-body text-sm text-muted-foreground">{item.translation}</p>
                    {/* Progress */}
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.min((current / item.count) * 100, 100)}%` }} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default AdhkarPage;
