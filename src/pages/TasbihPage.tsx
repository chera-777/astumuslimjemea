import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

const presets = [
  { label: "SubhanAllah", arabic: "سُبْحَانَ اللَّهِ", target: 33 },
  { label: "Alhamdulillah", arabic: "الْحَمْدُ لِلَّهِ", target: 33 },
  { label: "Allahu Akbar", arabic: "اللَّهُ أَكْبَرُ", target: 34 },
  { label: "La ilaha illallah", arabic: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
  { label: "Istighfar", arabic: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
  { label: "Salawat", arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 },
];

const TasbihPage = () => {
  const [activePreset, setActivePreset] = useState(0);
  const [count, setCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const preset = presets[activePreset];
  const progress = Math.min((count / preset.target) * 100, 100);

  const handleTap = () => {
    if (count < preset.target) {
      setCount(c => c + 1);
      setTotalToday(t => t + 1);
    }
  };

  const handleReset = () => setCount(0);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-2xl font-bold">📿 Tasbih Counter</h1>
          <p className="text-muted-foreground font-body text-sm">Tap to count your dhikr</p>
        </motion.div>

        {/* Preset pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide justify-center flex-wrap">
          {presets.map((p, i) => (
            <button key={i} onClick={() => { setActivePreset(i); setCount(0); }}
              className={`px-3 py-1.5 rounded-full font-body text-xs whitespace-nowrap transition-all ${activePreset === i ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}
            >{p.label}</button>
          ))}
        </div>

        {/* Main counter */}
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center">
          <Card className="border-0 bg-gradient-to-br from-primary/10 to-accent/5 w-full max-w-sm">
            <CardContent className="p-8 flex flex-col items-center">
              <p className="text-3xl mb-4 text-foreground" dir="rtl" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif" }}>
                {preset.arabic}
              </p>
              <p className="font-body text-sm text-muted-foreground mb-6">{preset.label}</p>

              {/* Tap circle */}
              <button
                onClick={handleTap}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-foreground font-display">{count}</p>
                  <p className="text-xs text-primary-foreground/70 font-body">/ {preset.target}</p>
                </div>
              </button>

              {/* Progress ring visual */}
              <div className="w-full mt-6">
                <div className="w-full bg-secondary rounded-full h-3">
                  <motion.div
                    className="bg-primary h-3 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 200 }}
                  />
                </div>
                <p className="text-center font-body text-xs text-muted-foreground mt-2">
                  {count >= preset.target ? "✅ Target reached!" : `${preset.target - count} remaining`}
                </p>
              </div>

              <Button variant="ghost" size="sm" className="mt-4" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reset
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="font-display text-2xl font-bold text-primary">{totalToday}</p>
              <p className="font-body text-xs text-muted-foreground">Total Today</p>
            </CardContent>
          </Card>
          <Card className="border border-border bg-card">
            <CardContent className="p-4 text-center">
              <p className="font-display text-2xl font-bold text-accent">{presets.length}</p>
              <p className="font-body text-xs text-muted-foreground">Dhikr Types</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default TasbihPage;
