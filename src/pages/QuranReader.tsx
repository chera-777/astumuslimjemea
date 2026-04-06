import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft, ChevronRight, BookOpen, Loader2, Maximize2, Minimize2,
  Volume2, VolumeX, Pause, Play, SkipForward, Globe, Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

const QuranReader = () => {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const num = parseInt(surahNumber || "1");
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // View modes
  const [viewMode, setViewMode] = useState<"reading" | "fullscreen">("reading");
  const [showTranslation, setShowTranslation] = useState(true);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    setLoading(true);
    setCurrentAyah(null);
    setIsPlaying(false);
    setAudioProgress(0);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}/ar.alafasy`).then(r => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${num}/en.asad`).then(r => r.json()),
    ]).then(([arabic, english]) => {
      setSurahInfo(arabic.data);
      setAyahs(arabic.data.ayahs);
      const trans: Record<number, string> = {};
      english.data.ayahs.forEach((a: { numberInSurah: number; text: string }) => {
        trans[a.numberInSurah] = a.text;
      });
      setTranslations(trans);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [num]);

  const playAyah = useCallback((ayah: Ayah) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(ayah.audio);
    audioRef.current = audio;
    setCurrentAyah(ayah.numberInSurah);
    setIsPlaying(true);

    audio.addEventListener("timeupdate", () => {
      if (audio.duration) setAudioProgress((audio.currentTime / audio.duration) * 100);
    });
    audio.addEventListener("ended", () => {
      const next = ayahs.find(a => a.numberInSurah === ayah.numberInSurah + 1);
      if (next?.audio) {
        playAyah(next);
        ayahRefs.current[next.numberInSurah]?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setIsPlaying(false);
        setCurrentAyah(null);
        setAudioProgress(0);
      }
    });
    audio.play();
  }, [ayahs]);

  const togglePlayPause = () => {
    if (!audioRef.current) {
      if (ayahs[0]?.audio) playAyah(ayahs[0]);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentAyah(null);
    setAudioProgress(0);
  };

  useEffect(() => {
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // Full-screen Arabic-only mode
  if (viewMode === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setViewMode("reading")}>
              <Minimize2 className="h-4 w-4 mr-1" /> Exit
            </Button>
            <span className="font-display text-sm font-bold">{surahInfo?.englishName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {isPlaying && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={stopAudio}>
                <VolumeX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-6 md:p-10">
          {num !== 9 && num !== 1 && (
            <p className="text-center text-2xl mb-8 text-foreground/80" style={{ fontFamily: "'Amiri', serif" }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          )}
          <div className="text-right leading-[3] text-2xl md:text-3xl" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
            {ayahs.map(ayah => (
              <span
                key={ayah.number}
                className={`inline transition-colors cursor-pointer hover:text-primary ${currentAyah === ayah.numberInSurah ? "text-primary bg-primary/10 rounded px-1" : ""}`}
                onClick={() => ayah.audio && playAyah(ayah)}
              >
                {ayah.text}
                <span className="text-primary text-lg mx-1">﴿{ayah.numberInSurah}﴾</span>
              </span>
            ))}
          </div>
        </div>
        {/* Bottom nav */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border p-3 flex justify-between">
          {num > 1 ? (
            <Button variant="outline" size="sm" onClick={() => navigate(`/quran/${num - 1}`)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
          ) : <div />}
          {num < 114 && (
            <Button size="sm" onClick={() => navigate(`/quran/${num + 1}`)} className="bg-primary text-primary-foreground">
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <Link to="/resources">
              <Button variant="ghost" size="sm" className="font-body text-xs">
                <ChevronLeft className="h-4 w-4 mr-1" /> Surahs
              </Button>
            </Link>
            <div className="flex gap-1">
              {num > 1 && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/quran/${num - 1}`)} className="font-body text-xs">
                  <ChevronLeft className="h-3 w-3" /> Prev
                </Button>
              )}
              {num < 114 && (
                <Button variant="outline" size="sm" onClick={() => navigate(`/quran/${num + 1}`)} className="font-body text-xs">
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <Card className="border-0 bg-primary/10">
            <CardContent className="p-4 text-center">
              <p className="text-3xl mb-1" style={{ fontFamily: "'Amiri', serif" }}>{surahInfo?.name}</p>
              <h2 className="font-display text-xl font-bold">{surahInfo?.englishName}</h2>
              <p className="font-body text-sm text-muted-foreground">{surahInfo?.englishNameTranslation}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline" className="font-body text-[10px]">{surahInfo?.revelationType}</Badge>
                <Badge variant="outline" className="font-body text-[10px]">{surahInfo?.numberOfAyahs} Ayahs</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Controls bar */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2.5 gap-2">
          <div className="flex items-center gap-1.5">
            <Button variant={isPlaying ? "default" : "outline"} size="sm" className="h-8 gap-1 text-xs" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            {isPlaying && (
              <Button variant="ghost" size="sm" className="h-8" onClick={stopAudio}>
                <VolumeX className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant={showTranslation ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => setShowTranslation(!showTranslation)}
            >
              <Globe className="h-3.5 w-3.5" />
              {showTranslation ? "EN" : "AR"}
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setViewMode("fullscreen")}>
              <Maximize2 className="h-3.5 w-3.5" /> Mushaf
            </Button>
          </div>
        </div>

        {/* Audio progress */}
        {isPlaying && currentAyah && (
          <div className="space-y-1">
            <Progress value={audioProgress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground font-body text-center">
              Playing Ayah {currentAyah} • Reciter: Mishary Rashid Alafasy
            </p>
          </div>
        )}

        {/* Bismillah */}
        {num !== 9 && num !== 1 && (
          <p className="text-center text-xl text-foreground/80" style={{ fontFamily: "'Amiri', serif" }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}

        {/* Verses */}
        <div className="space-y-3">
          {ayahs.map((ayah, i) => (
            <motion.div
              key={ayah.number}
              ref={el => { ayahRefs.current[ayah.numberInSurah] = el; }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.5) }}
            >
              <Card className={`border transition-all ${currentAyah === ayah.numberInSurah ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-display text-xs font-bold text-primary">{ayah.numberInSurah}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {ayah.audio && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => playAyah(ayah)}
                        >
                          {currentAyah === ayah.numberInSurah && isPlaying
                            ? <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
                            : <Play className="h-3.5 w-3.5 text-muted-foreground" />
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-right text-xl leading-[2.2] text-foreground mb-3" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                    {ayah.text}
                    <span className="text-primary text-sm mx-1">﴿{ayah.numberInSurah}﴾</span>
                  </p>
                  {showTranslation && translations[ayah.numberInSurah] && (
                    <p className="font-body text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {translations[ayah.numberInSurah]}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Navigation footer */}
        <div className="flex justify-between pt-4">
          {num > 1 ? (
            <Button variant="outline" onClick={() => navigate(`/quran/${num - 1}`)} className="font-body">
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous Surah
            </Button>
          ) : <div />}
          {num < 114 && (
            <Button onClick={() => navigate(`/quran/${num + 1}`)} className="font-body bg-primary text-primary-foreground">
              Next Surah <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default QuranReader;
