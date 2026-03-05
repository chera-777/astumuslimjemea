import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Play, Video } from "lucide-react";
import { motion } from "framer-motion";

const quranSurahs = [
  "Al-Fatiha", "Al-Baqarah", "Aal-E-Imran", "An-Nisa", "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
  "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr",
];

const hadithCollections = [
  { name: "Sahih Bukhari", hadiths: 7563 },
  { name: "Sahih Muslim", hadiths: 7500 },
  { name: "Sunan Abu Dawud", hadiths: 5274 },
  { name: "Jami At-Tirmidhi", hadiths: 3956 },
  { name: "40 Nawawi", hadiths: 42 },
];

const kitabs = [
  { title: "Riyadh as-Salihin", author: "Imam Nawawi" },
  { title: "Bulugh al-Maram", author: "Ibn Hajar" },
  { title: "Tafsir Ibn Kathir", author: "Ibn Kathir" },
  { title: "Kitab at-Tawhid", author: "Muhammad ibn Abd al-Wahhab" },
];

const videoLectures = [
  { title: "The Beginning and the End", speaker: "Omar Suleiman", duration: "45 min" },
  { title: "Seerah of the Prophet ﷺ", speaker: "Yasir Qadhi", duration: "60 min" },
  { title: "Tafsir of Surah Al-Kahf", speaker: "Nouman Ali Khan", duration: "35 min" },
];

const Resources = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl font-bold text-foreground">Islamic Resources</h1>
          <p className="text-muted-foreground font-body text-sm">Qur'an, Hadith, Kitabs, Videos & more</p>
        </motion.div>

        <Tabs defaultValue="quran" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="quran" className="font-body text-xs py-2">Qur'an</TabsTrigger>
            <TabsTrigger value="hadith" className="font-body text-xs py-2">Hadith</TabsTrigger>
            <TabsTrigger value="kitabs" className="font-body text-xs py-2">Kitabs</TabsTrigger>
            <TabsTrigger value="videos" className="font-body text-xs py-2">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="quran" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><BookOpen className="h-5 w-5" /> Surahs</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {quranSurahs.map((s, i) => (
                    <div key={s} className="flex items-center gap-3 p-3 rounded-lg bg-secondary hover:bg-primary/10 transition-colors cursor-pointer">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-body font-bold text-primary">{i + 1}</span>
                      <span className="font-body text-sm">{s}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hadith" className="mt-4 space-y-3">
            {hadithCollections.map((h) => (
              <Card key={h.name} className="cursor-pointer hover:shadow-emerald transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-semibold">{h.name}</p>
                    <p className="font-body text-xs text-muted-foreground">{h.hadiths.toLocaleString()} hadiths</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-primary" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="kitabs" className="mt-4 space-y-3">
            {kitabs.map((k) => (
              <Card key={k.title} className="cursor-pointer hover:shadow-emerald transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-semibold">{k.title}</p>
                    <p className="font-body text-xs text-muted-foreground">{k.author}</p>
                  </div>
                  <BookOpen className="h-5 w-5 text-primary" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="videos" className="mt-4 space-y-3">
            {videoLectures.map((v) => (
              <Card key={v.title} className="cursor-pointer hover:shadow-emerald transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-body text-sm font-semibold">{v.title}</p>
                      <p className="font-body text-xs text-muted-foreground">{v.speaker} • {v.duration}</p>
                    </div>
                  </div>
                  <Video className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Resources;
