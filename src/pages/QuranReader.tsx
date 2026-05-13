import { useState, useEffect, useRef, useCallback, TouchEvent } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft, ChevronRight, BookOpen, Loader2, Maximize2, Minimize2,
  Volume2, VolumeX, Pause, Play, SkipForward, Globe, Eye, MoreHorizontal,
  Bookmark, Share2, Copy, Settings, List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
  page?: number;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

const QURAN_FONT = "'Amiri Quran', 'Amiri', serif";

const QuranReader = () => {
  const { surahNumber } = useParams();
  const navigate = useNavigate();
  const num = parseInt(surahNumber || "1");
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // View & mode
  const [viewMode, setViewMode] = useState<"reading" | "mushaf">("reading");
  const [showTranslation, setShowTranslation] = useState(true);
  const [activeTab, setActiveTab] = useState<"arabic" | "translation" | "tafsir">("arabic");

  // Page-based navigation for Mushaf
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<Ayah[][]>([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

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
    setCurrentPage(0);
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

      // Split into pages (15 ayahs per page for Mushaf feel)
      const AYAHS_PER_PAGE = 10;
      const pgs: Ayah[][] = [];
      for (let i = 0; i < arabic.data.ayahs.length; i += AYAHS_PER_PAGE) {
        pgs.push(arabic.data.ayahs.slice(i, i + AYAHS_PER_PAGE));
      }
      setPages(pgs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [num]);

  const playAyah = useCallback((ayah: Ayah) => {
    if (audioRef.current) audioRef.current.pause();
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
    if (!audioRef.current) { if (ayahs[0]?.audio) playAyah(ayahs[0]); return; }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false); setCurrentAyah(null); setAudioProgress(0);
  };

  useEffect(() => { return () => { if (audioRef.current) audioRef.current.pause(); }; }, []);

  // Keyboard navigation: arrow keys for surah/page navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (viewMode === "mushaf") {
        if (e.key === "ArrowLeft") {
          if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
          else if (num < 114) navigate(`/quran/${num + 1}`);
        } else if (e.key === "ArrowRight") {
          if (currentPage > 0) setCurrentPage(p => p - 1);
          else if (num > 1) navigate(`/quran/${num - 1}`);
        }
      } else {
        if (e.key === "ArrowLeft" && num > 1) navigate(`/quran/${num - 1}`);
        else if (e.key === "ArrowRight" && num < 114) navigate(`/quran/${num + 1}`);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [viewMode, currentPage, pages.length, num, navigate]);

  // Swipe handlers for Mushaf mode (mobile only)
  const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // swipe left -> next page or next surah
        if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
        else if (num < 114) navigate(`/quran/${num + 1}`);
      } else {
        if (currentPage > 0) setCurrentPage(p => p - 1);
        else if (num > 1) navigate(`/quran/${num - 1}`);
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  // ========== MUSHAF MODE — Page-based, swipeable, Arabic-only ==========
  if (viewMode === "mushaf") {
    const currentPageAyahs = pages[currentPage] || [];
    return (
      <div className="fixed inset-0 z-50 bg-[#FFF8F0] dark:bg-[#1a1612] flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setViewMode("reading")} className="text-foreground">
            <Minimize2 className="h-4 w-4 mr-1" /> Exit
          </Button>
          <span className="font-body text-sm font-semibold text-foreground">{surahInfo?.name} — {surahInfo?.englishName}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Page content — swipeable */}
        <div
          className="flex-1 overflow-hidden flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl mx-auto px-6 py-8"
            >
              {/* Bismillah on first page */}
              {currentPage === 0 && num !== 9 && num !== 1 && (
                <p className="text-center text-2xl mb-6 text-[#4a3728] dark:text-[#d4b896]" style={{ fontFamily: QURAN_FONT }}>
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              )}
              <div
                className="text-right leading-[3.2] text-[22px] md:text-[26px] text-[#2c1810] dark:text-[#e8d5c0]"
                dir="rtl"
                style={{ fontFamily: QURAN_FONT, textAlign: "justify", wordSpacing: "0.1em" }}
              >
                {currentPageAyahs.map(ayah => (
                  <span
                    key={ayah.number}
                    className={`inline transition-colors cursor-pointer hover:text-primary ${currentAyah === ayah.numberInSurah ? "text-primary bg-primary/10 rounded px-1" : ""}`}
                    onClick={() => ayah.audio && playAyah(ayah)}
                  >
                    {ayah.text}
                    {" "}
                    <span className="text-[#b8860b] dark:text-[#d4a843] text-[16px]">﴿{ayah.numberInSurah}﴾</span>
                    {" "}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom page nav */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 shrink-0">
          <Button
            variant="ghost" size="sm"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronRight className="h-4 w-4 mr-1" /> السابق
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-muted-foreground">
              {currentPage + 1} / {pages.length}
            </span>
            <div className="flex gap-0.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          </div>
          <Button
            variant="ghost" size="sm"
            disabled={currentPage >= pages.length - 1}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            التالي <ChevronLeft className="h-4 w-4 ml-1" />
          </Button>
        </div>

      </div>
    );
  }

  // ========== READING MODE — Tabs: Arabic, Translation, More ==========
  return (
    <AppLayout>
      <SEO
        title={surahInfo ? `Surah ${surahInfo.englishName} — Quran Reader` : "Quran Reader — ASTU Muslim Jemea"}
        description={surahInfo ? `Read Surah ${surahInfo.englishName} (${surahInfo.englishNameTranslation}) with translation and recitation.` : "Read the Quran with translation and recitation."}
        path={`/quran/${num}`}
      />
      <div
        className="p-4 md:p-6 max-w-3xl mx-auto space-y-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => {
          touchEndX.current = e.changedTouches[0].clientX;
          const diff = touchStartX.current - touchEndX.current;
          if (Math.abs(diff) > 80) {
            if (diff > 0 && num < 114) navigate(`/quran/${num + 1}`);
            else if (diff < 0 && num > 1) navigate(`/quran/${num - 1}`);
          }
        }}
      >
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <Link to="/resources">
              <Button variant="ghost" size="sm" className="font-body text-xs">
                <ChevronLeft className="h-4 w-4 mr-1" /> Surahs
              </Button>
            </Link>
            <span className="font-body text-[10px] text-muted-foreground hidden sm:inline">Use ← / → keys or swipe to navigate</span>
          </div>

          {/* Surah info card */}
          <Card className="border-0 bg-gradient-to-br from-primary/15 to-primary/5 overflow-hidden">
            <CardContent className="p-5 text-center relative">
              <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
              }} />
              <p className="text-4xl mb-1" style={{ fontFamily: QURAN_FONT }}>{surahInfo?.name}</p>
              <h1 className="font-display text-xl font-bold">{surahInfo?.englishName}</h1>
              <p className="font-body text-sm text-muted-foreground">{surahInfo?.englishNameTranslation}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline" className="font-body text-[10px]">{surahInfo?.revelationType}</Badge>
                <Badge variant="outline" className="font-body text-[10px]">{surahInfo?.numberOfAyahs} Ayahs</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mode tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto">
            <TabsTrigger value="arabic" className="font-body text-xs py-2">🕌 Arabic</TabsTrigger>
            <TabsTrigger value="translation" className="font-body text-xs py-2">🌐 Translation</TabsTrigger>
            <TabsTrigger value="tafsir" className="font-body text-xs py-2">📖 More</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Controls bar */}
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-2 gap-2">
          <div className="flex items-center gap-1">
            <Button variant={isPlaying ? "default" : "outline"} size="sm" className="h-8 gap-1 text-xs" onClick={togglePlayPause}>
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
            {isPlaying && (
              <Button variant="ghost" size="sm" className="h-8" onClick={stopAudio}>
                <VolumeX className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => setViewMode("mushaf")}>
              <Maximize2 className="h-3.5 w-3.5" /> Mushaf
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <Bookmark className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Audio progress */}
        {isPlaying && currentAyah && (
          <div className="space-y-1">
            <Progress value={audioProgress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground font-body text-center">
              Ayah {currentAyah} • Mishary Rashid Alafasy
            </p>
          </div>
        )}

        {/* Bismillah */}
        {num !== 9 && num !== 1 && (
          <p className="text-center text-xl text-foreground/80 py-2" style={{ fontFamily: QURAN_FONT }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}

        {/* ARABIC TAB — verse-by-verse */}
        {activeTab === "arabic" && (
          <div className="space-y-3">
            {ayahs.map((ayah, i) => (
              <motion.div
                key={ayah.number}
                ref={el => { ayahRefs.current[ayah.numberInSurah] = el; }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.015, 0.4) }}
              >
                <Card className={`border transition-all ${currentAyah === ayah.numberInSurah ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/20"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-display text-xs font-bold text-primary">{ayah.numberInSurah}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {ayah.audio && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => playAyah(ayah)}>
                            {currentAyah === ayah.numberInSurah && isPlaying
                              ? <Volume2 className="h-3.5 w-3.5 text-primary animate-pulse" />
                              : <Play className="h-3.5 w-3.5 text-muted-foreground" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-right text-[22px] leading-[2.8] text-foreground mb-2" dir="rtl" style={{ fontFamily: QURAN_FONT }}>
                      {ayah.text}
                    </p>
                    {showTranslation && translations[ayah.numberInSurah] && (
                      <p className="font-body text-sm text-muted-foreground leading-relaxed border-t border-border/50 pt-3 mt-1">
                        {translations[ayah.numberInSurah]}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* TRANSLATION TAB — English focus */}
        {activeTab === "translation" && (
          <div className="space-y-2">
            {ayahs.map((ayah, i) => (
              <motion.div key={ayah.number} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.01, 0.3) }}>
                <div className="flex gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <span className="font-display text-xs font-bold text-primary mt-1 shrink-0 w-6 text-center">{ayah.numberInSurah}</span>
                  <div className="flex-1">
                    <p className="font-body text-sm leading-relaxed text-foreground">{translations[ayah.numberInSurah]}</p>
                    <p className="text-right text-base text-muted-foreground mt-2 leading-loose" dir="rtl" style={{ fontFamily: QURAN_FONT }}>
                      {ayah.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MORE TAB — Options */}
        {activeTab === "tafsir" && (
          <div className="space-y-3">
            <Card className="border border-border bg-card">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-display text-base font-bold">Reading Options</h3>
                {[
                  { icon: <Maximize2 className="h-4 w-4" />, label: "Mushaf Mode (Full Screen)", desc: "Page-based Arabic view with swipe navigation", action: () => setViewMode("mushaf") },
                  { icon: <Globe className="h-4 w-4" />, label: showTranslation ? "Hide Translation" : "Show Translation", desc: "Toggle English translation below verses", action: () => setShowTranslation(!showTranslation) },
                  { icon: <Share2 className="h-4 w-4" />, label: "Share Surah", desc: "Copy link to this surah", action: () => {} },
                  { icon: <Bookmark className="h-4 w-4" />, label: "Bookmark", desc: "Save your reading position", action: () => {} },
                ].map((opt, i) => (
                  <button key={i} onClick={opt.action} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">{opt.icon}</div>
                    <div>
                      <p className="font-body text-sm font-semibold">{opt.label}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-border bg-card">
              <CardContent className="p-4">
                <h3 className="font-display text-base font-bold mb-2">Surah Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm font-body">
                  <div className="p-2 rounded-lg bg-secondary/50"><span className="text-muted-foreground text-xs">Name</span><p className="font-semibold">{surahInfo?.englishName}</p></div>
                  <div className="p-2 rounded-lg bg-secondary/50"><span className="text-muted-foreground text-xs">Arabic</span><p style={{ fontFamily: QURAN_FONT }}>{surahInfo?.name}</p></div>
                  <div className="p-2 rounded-lg bg-secondary/50"><span className="text-muted-foreground text-xs">Verses</span><p className="font-semibold">{surahInfo?.numberOfAyahs}</p></div>
                  <div className="p-2 rounded-lg bg-secondary/50"><span className="text-muted-foreground text-xs">Type</span><p className="font-semibold">{surahInfo?.revelationType}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="pb-20" />

      </div>
    </AppLayout>
  );
};

export default QuranReader;
