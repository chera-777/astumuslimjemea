import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Check, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const reciters = [
  { name: "Abdul Basit", country: "🇪🇬 Egypt", style: "Classical Maqam", popular: true },
  { name: "Mishary Rashid", country: "🇰🇼 Kuwait", style: "Modern Clear", popular: true },
  { name: "Mansour al-Zahrani", country: "🇸🇦 Saudi Arabia", style: "Madinah Style", popular: false },
  { name: "Nasser Al Qatami", country: "🇸🇦 Saudi Arabia", style: "Emotional", popular: true },
  { name: "Ahmad al-Nufais", country: "🇰🇼 Kuwait", style: "Soft & Soothing", popular: false },
  { name: "Ali Ahmed Mulla", country: "🇸🇦 Saudi Arabia", style: "Masjid al-Haram", popular: true },
  { name: "Hafiz Mustafa Özcan", country: "🇹🇷 Turkey", style: "Ottoman Maqam", popular: false },
  { name: "Yusuf Islam", country: "🇬🇧 United Kingdom", style: "Contemporary", popular: false },
];

const AzanPage = () => {
  const [selectedReciter, setSelectedReciter] = useState("Mishary Rashid");
  const [playing, setPlaying] = useState(false);
  const pt = usePrayerTimes();

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🔔</span>
          </div>
          <h1 className="font-display text-2xl font-bold">Azan Settings</h1>
          <p className="text-muted-foreground font-body text-sm">Choose your preferred reciter</p>
        </motion.div>

        {/* Next prayer card */}
        <Card className="border-0 bg-gradient-to-br from-primary/15 to-primary/5">
          <CardContent className="p-5 text-center">
            <p className="font-body text-xs text-muted-foreground">Next Prayer</p>
            <h2 className="font-display text-3xl font-bold text-primary">{pt.nextPrayer}</h2>
            <p className="font-display text-2xl font-bold">{pt.nextTime}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">{pt.city} • {pt.hijriDate}</p>
          </CardContent>
        </Card>

        {/* All prayer times */}
        <Card className="border border-border bg-card">
          <CardContent className="p-4">
            <h3 className="font-display text-sm font-bold mb-3">Today's Prayer Times</h3>
            <div className="space-y-2">
              {pt.prayers.map(p => (
                <div key={p.name} className={`flex items-center justify-between p-2.5 rounded-xl ${p.name === pt.nextPrayer ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"}`}>
                  <div className="flex items-center gap-2">
                    <Volume2 className={`h-3.5 w-3.5 ${p.name === pt.nextPrayer ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-body text-sm font-medium">{p.name}</span>
                  </div>
                  <span className="font-display text-sm font-bold">{p.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reciters */}
        <h3 className="font-display text-base font-bold">Choose Reciter</h3>
        <div className="space-y-2">
          {reciters.map((r, i) => (
            <motion.div key={r.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card
                className={`border cursor-pointer transition-all ${selectedReciter === r.name ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/20"}`}
                onClick={() => setSelectedReciter(r.name)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedReciter === r.name ? "bg-primary" : "bg-secondary"}`}>
                    {selectedReciter === r.name ? <Check className="h-4 w-4 text-primary-foreground" /> : <Play className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-body text-sm font-semibold">{r.name}</p>
                      {r.popular && <Badge className="text-[8px] px-1.5 bg-accent/20 text-accent border-0">Popular</Badge>}
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground">{r.country} • {r.style}</p>
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

export default AzanPage;
