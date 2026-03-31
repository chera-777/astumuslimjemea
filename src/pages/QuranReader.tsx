import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  translation?: string;
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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${num}`).then(r => r.json()),
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
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

        {/* Bismillah */}
        {num !== 9 && num !== 1 && (
          <p className="text-center text-xl text-foreground/80" style={{ fontFamily: "'Amiri', serif" }}>
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        )}

        {/* Verses */}
        <div className="space-y-3">
          {ayahs.map((ayah, i) => (
            <motion.div key={ayah.number} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
              <Card className="border border-border bg-card hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="font-display text-xs font-bold text-primary">{ayah.numberInSurah}</span>
                    </div>
                  </div>
                  <p className="text-right text-xl leading-[2.2] text-foreground mb-3" dir="rtl" style={{ fontFamily: "'Amiri', serif" }}>
                    {ayah.text}
                    <span className="text-primary text-sm mx-1">﴿{ayah.numberInSurah}﴾</span>
                  </p>
                  {translations[ayah.numberInSurah] && (
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
