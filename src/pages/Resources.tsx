import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, Play, ThumbsUp, Eye } from "lucide-react";
import { motion } from "framer-motion";

const allSurahs = [
  "Al-Fatiha","Al-Baqarah","Aal-E-Imran","An-Nisa","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas"
];

const surahMeta: Record<number, { verses: number; type: "Meccan" | "Medinan" }> = {
  1:{verses:7,type:"Meccan"},2:{verses:286,type:"Medinan"},3:{verses:200,type:"Medinan"},4:{verses:176,type:"Medinan"},5:{verses:120,type:"Medinan"},
  6:{verses:165,type:"Meccan"},7:{verses:206,type:"Meccan"},8:{verses:75,type:"Medinan"},9:{verses:129,type:"Medinan"},10:{verses:109,type:"Meccan"},
  11:{verses:123,type:"Meccan"},12:{verses:111,type:"Meccan"},13:{verses:43,type:"Medinan"},14:{verses:52,type:"Meccan"},15:{verses:99,type:"Meccan"},
  16:{verses:128,type:"Meccan"},17:{verses:111,type:"Meccan"},18:{verses:110,type:"Meccan"},19:{verses:98,type:"Meccan"},20:{verses:135,type:"Meccan"},
  21:{verses:112,type:"Meccan"},22:{verses:78,type:"Medinan"},23:{verses:118,type:"Meccan"},24:{verses:64,type:"Medinan"},25:{verses:77,type:"Meccan"},
  26:{verses:227,type:"Meccan"},27:{verses:93,type:"Meccan"},28:{verses:88,type:"Meccan"},29:{verses:69,type:"Meccan"},30:{verses:60,type:"Meccan"},
  31:{verses:34,type:"Meccan"},32:{verses:30,type:"Meccan"},33:{verses:73,type:"Medinan"},34:{verses:54,type:"Meccan"},35:{verses:45,type:"Meccan"},
  36:{verses:83,type:"Meccan"},37:{verses:182,type:"Meccan"},38:{verses:88,type:"Meccan"},39:{verses:75,type:"Meccan"},40:{verses:85,type:"Meccan"},
  41:{verses:54,type:"Meccan"},42:{verses:53,type:"Meccan"},43:{verses:89,type:"Meccan"},44:{verses:59,type:"Meccan"},45:{verses:37,type:"Meccan"},
  46:{verses:35,type:"Meccan"},47:{verses:38,type:"Medinan"},48:{verses:29,type:"Medinan"},49:{verses:18,type:"Medinan"},50:{verses:45,type:"Meccan"},
  51:{verses:60,type:"Meccan"},52:{verses:49,type:"Meccan"},53:{verses:62,type:"Meccan"},54:{verses:55,type:"Meccan"},55:{verses:78,type:"Medinan"},
  56:{verses:96,type:"Meccan"},57:{verses:29,type:"Medinan"},58:{verses:22,type:"Medinan"},59:{verses:24,type:"Medinan"},60:{verses:13,type:"Medinan"},
  61:{verses:14,type:"Medinan"},62:{verses:11,type:"Medinan"},63:{verses:11,type:"Medinan"},64:{verses:18,type:"Medinan"},65:{verses:12,type:"Medinan"},
  66:{verses:12,type:"Medinan"},67:{verses:30,type:"Meccan"},68:{verses:52,type:"Meccan"},69:{verses:52,type:"Meccan"},70:{verses:44,type:"Meccan"},
  71:{verses:28,type:"Meccan"},72:{verses:28,type:"Meccan"},73:{verses:20,type:"Meccan"},74:{verses:56,type:"Meccan"},75:{verses:40,type:"Meccan"},
  76:{verses:31,type:"Medinan"},77:{verses:50,type:"Meccan"},78:{verses:40,type:"Meccan"},79:{verses:46,type:"Meccan"},80:{verses:42,type:"Meccan"},
  81:{verses:29,type:"Meccan"},82:{verses:19,type:"Meccan"},83:{verses:36,type:"Meccan"},84:{verses:25,type:"Meccan"},85:{verses:22,type:"Meccan"},
  86:{verses:17,type:"Meccan"},87:{verses:19,type:"Meccan"},88:{verses:26,type:"Meccan"},89:{verses:30,type:"Meccan"},90:{verses:20,type:"Meccan"},
  91:{verses:15,type:"Meccan"},92:{verses:21,type:"Meccan"},93:{verses:11,type:"Meccan"},94:{verses:8,type:"Meccan"},95:{verses:8,type:"Meccan"},
  96:{verses:19,type:"Meccan"},97:{verses:5,type:"Meccan"},98:{verses:8,type:"Medinan"},99:{verses:8,type:"Medinan"},100:{verses:11,type:"Meccan"},
  101:{verses:11,type:"Meccan"},102:{verses:8,type:"Meccan"},103:{verses:3,type:"Meccan"},104:{verses:9,type:"Meccan"},105:{verses:5,type:"Meccan"},
  106:{verses:4,type:"Meccan"},107:{verses:7,type:"Meccan"},108:{verses:3,type:"Meccan"},109:{verses:6,type:"Meccan"},110:{verses:3,type:"Medinan"},
  111:{verses:5,type:"Meccan"},112:{verses:4,type:"Meccan"},113:{verses:5,type:"Meccan"},114:{verses:6,type:"Meccan"},
};

const hadithCollections = [
  { name: "Sahih Bukhari", hadiths: 7563, icon: "📕" },
  { name: "Sahih Muslim", hadiths: 7500, icon: "📗" },
  { name: "Sunan Abu Dawud", hadiths: 5274, icon: "📘" },
  { name: "Jami At-Tirmidhi", hadiths: 3956, icon: "📙" },
  { name: "Sunan An-Nasa'i", hadiths: 5758, icon: "📓" },
  { name: "Sunan Ibn Majah", hadiths: 4341, icon: "📔" },
  { name: "Muwatta Malik", hadiths: 1851, icon: "📒" },
  { name: "40 Nawawi", hadiths: 42, icon: "⭐" },
  { name: "Riyadh as-Salihin", hadiths: 1896, icon: "🌟" },
];

const kitabs = [
  { title: "Riyadh as-Salihin", author: "Imam Nawawi", chapters: 372, icon: "📖" },
  { title: "Bulugh al-Maram", author: "Ibn Hajar", chapters: 16, icon: "📜" },
  { title: "Tafsir Ibn Kathir", author: "Ibn Kathir", chapters: 114, icon: "📚" },
  { title: "Kitab at-Tawhid", author: "Muhammad ibn Abd al-Wahhab", chapters: 67, icon: "🕌" },
  { title: "Al-Aqidah Al-Wasitiyyah", author: "Ibn Taymiyyah", chapters: 12, icon: "🌙" },
  { title: "Zad al-Ma'ad", author: "Ibn al-Qayyim", chapters: 5, icon: "⭐" },
];

const videoLectures = [
  { title: "The Beginning and the End", speaker: "Omar Suleiman", duration: "45 min", views: "2.1M", thumb: "🎬" },
  { title: "Seerah of the Prophet ﷺ", speaker: "Yasir Qadhi", duration: "60 min", views: "5.3M", thumb: "📽️" },
  { title: "Tafsir of Surah Al-Kahf", speaker: "Nouman Ali Khan", duration: "35 min", views: "1.8M", thumb: "🎥" },
  { title: "Stories of the Prophets", speaker: "Mufti Menk", duration: "50 min", views: "3.2M", thumb: "🎞️" },
  { title: "Heart Softeners", speaker: "Bilal Assad", duration: "40 min", views: "900K", thumb: "💎" },
  { title: "Purification of the Soul", speaker: "Hamza Yusuf", duration: "55 min", views: "1.5M", thumb: "🌟" },
];

const Resources = () => {
  const [search, setSearch] = useState("");
  const filteredSurahs = allSurahs.filter(s => s.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="font-display text-2xl font-bold">Islamic Resources</h1>
          <p className="text-muted-foreground font-body text-sm">Qur'an, Hadith, Kitabs & Videos</p>
        </motion.div>

        <Tabs defaultValue="quran" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="quran" className="font-body text-xs py-2">📖 Qur'an</TabsTrigger>
            <TabsTrigger value="hadith" className="font-body text-xs py-2">📚 Hadith</TabsTrigger>
            <TabsTrigger value="kitabs" className="font-body text-xs py-2">🕌 Kitabs</TabsTrigger>
            <TabsTrigger value="videos" className="font-body text-xs py-2">🎬 Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="quran" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search surahs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 font-body rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-auto scrollbar-hide">
              {filteredSurahs.map((s, i) => {
                const idx = allSurahs.indexOf(s) + 1;
                const meta = surahMeta[idx];
                return (
                  <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.008, 0.4) }}>
                    <Card className="border border-border bg-card hover:shadow-glow cursor-pointer transition-all group">
                      <CardContent className="p-3 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="font-display text-sm font-bold text-primary">{idx}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs font-semibold truncate">{s}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="font-body text-[9px] text-muted-foreground">{meta?.verses}v</span>
                            <Badge variant="outline" className="font-body text-[7px] px-1 py-0 h-3.5">{meta?.type}</Badge>
                          </div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="hadith" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {hadithCollections.map((h, i) => (
                <motion.div key={h.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border border-border bg-card hover:shadow-glow cursor-pointer transition-all group">
                    <CardContent className="p-3.5 flex flex-col items-center text-center gap-2">
                      <span className="text-3xl">{h.icon}</span>
                      <div>
                        <p className="font-body text-xs font-semibold">{h.name}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{h.hadiths.toLocaleString()} hadiths</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="kitabs" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {kitabs.map((k, i) => (
                <motion.div key={k.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                  <Card className="border border-border bg-card hover:shadow-glow cursor-pointer transition-all group">
                    <CardContent className="p-3.5 flex flex-col items-center text-center gap-2">
                      <span className="text-3xl">{k.icon}</span>
                      <div>
                        <p className="font-body text-xs font-semibold">{k.title}</p>
                        <p className="font-body text-[10px] text-muted-foreground">{k.author}</p>
                        <p className="font-body text-[9px] text-muted-foreground">{k.chapters} chapters</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-4 space-y-3">
            {videoLectures.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="border border-border bg-card hover:shadow-glow cursor-pointer transition-all group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Thumbnail */}
                      <div className="w-36 h-24 bg-secondary flex items-center justify-center shrink-0 relative">
                        <span className="text-4xl">{v.thumb}</span>
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center">
                            <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-body">{v.duration}</span>
                      </div>
                      {/* Info */}
                      <div className="p-3 flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold leading-tight line-clamp-2">{v.title}</p>
                        <p className="font-body text-xs text-muted-foreground mt-1">{v.speaker}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="flex items-center gap-0.5 font-body text-[10px] text-muted-foreground">
                            <Eye className="h-3 w-3" /> {v.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Resources;
