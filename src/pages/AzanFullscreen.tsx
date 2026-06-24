import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { X, Pause, Play, BookOpen, Compass, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { RECITERS, getReciter, getSavedReciterId, saveReciterId } from "@/lib/reciters";
import mosqueHero from "@/assets/mosque-hero.jpg";

const AzanFullscreen = () => {
  const pt = usePrayerTimes();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reciterId, setReciterId] = useState(getSavedReciterId());
  const [pickerOpen, setPickerOpen] = useState(false);

  const reciter = useMemo(() => getReciter(reciterId), [reciterId]);
  const prayer = params.get("prayer") || pt.nextPrayer;
  const time = pt.prayers.find(p => p.name === prayer)?.time || pt.nextTime;
  const auto = params.get("auto") === "1";

  useEffect(() => { saveReciterId(reciterId); }, [reciterId]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.src = reciter.url;
    if (auto) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    const onEnd = () => setPlaying(false);
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
  }, [reciter.url, auto]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { try { await a.play(); setPlaying(true); } catch { /* ignore */ } }
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden text-white">
      <SEO title={`${prayer} Adhan — ASTU Muslim Jemea`} description="It's time for prayer. Listen to the adhan." path="/azan/now" />
      <div className="absolute inset-0">
        <img src={mosqueHero} alt="Mosque" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/80" />
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-between p-4">
        <button onClick={() => navigate(-1)} aria-label="Close" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          <X className="h-5 w-5" />
        </button>
        <p className="font-display text-lg tracking-wide">مسلمونا</p>
        <button onClick={() => setPickerOpen(v => !v)} aria-label="Choose reciter" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
          <Volume2 className="h-5 w-5" />
        </button>
      </div>

      {/* Center prayer */}
      <div className="relative flex flex-col items-center justify-center text-center px-6" style={{ minHeight: "55vh" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full border border-white/30"
        />
        <motion.div
          animate={{ scale: playing ? [1, 1.05, 1] : 1 }}
          transition={{ repeat: playing ? Infinity : 0, duration: 2.2 }}
          className="relative"
        >
          <h1 className="font-display text-5xl sm:text-6xl font-bold drop-shadow-lg">{prayer}</h1>
          <p className="font-display text-3xl sm:text-4xl font-bold mt-3 drop-shadow">{time}</p>
          <p className="font-body text-xs text-white/75 mt-2">{reciter.name} • {reciter.style}</p>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="relative px-6 pb-10 space-y-3 max-w-md mx-auto">
        <Button onClick={toggle} className="w-full h-14 rounded-full text-base font-semibold bg-emerald-500/90 hover:bg-emerald-500 text-white border-0 shadow-glow">
          {playing ? <><Pause className="h-5 w-5 mr-2" /> Pause Adhan</> : <><Play className="h-5 w-5 mr-2" /> Pray Now</>}
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button asChild variant="outline" className="h-12 rounded-full bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20">
            <Link to="/quran/1"><BookOpen className="h-4 w-4 mr-2" /> Quran</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 rounded-full bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20">
            <Link to="/prayer-times"><Compass className="h-4 w-4 mr-2" /> Qibla</Link>
          </Button>
        </div>
      </div>

      {/* Reciter picker drawer */}
      {pickerOpen && (
        <motion.div
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          className="absolute inset-x-0 bottom-0 bg-background/95 backdrop-blur-xl text-foreground rounded-t-3xl p-4 max-h-[70vh] overflow-y-auto z-10"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold">Choose Reciter</h2>
            <button onClick={() => setPickerOpen(false)} className="text-sm text-muted-foreground">Done</button>
          </div>
          <div className="space-y-2">
            {RECITERS.map(r => (
              <button
                key={r.id}
                onClick={() => { setReciterId(r.id); setPickerOpen(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${reciterId === r.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/30"}`}
              >
                <p className="font-body text-sm font-semibold">{r.name}</p>
                <p className="font-body text-[11px] text-muted-foreground">{r.country} • {r.style}</p>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            Note: Browsers can't play adhan when the tab is fully closed. For background playback, install us as a PWA or use the upcoming mobile app.
          </p>
        </motion.div>
      )}

      <audio ref={audioRef} preload="auto" />
    </div>
  );
};

export default AzanFullscreen;
