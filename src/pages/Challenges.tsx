import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, Target, Crown, Zap, BookOpen, Heart, Users } from "lucide-react";
import eventChallenge from "@/assets/event-challenge.jpg";
import eventTafsir from "@/assets/event-tafsir.jpg";
import eventHadith from "@/assets/event-hadith.jpg";

const activeChallenges = [
  { title: "Quran Memorization Sprint", desc: "Memorize Juz Amma in 30 days", xp: 150, progress: 65, joined: 145, image: eventChallenge, icon: BookOpen, color: "from-gold/40", endsIn: "12 days" },
  { title: "Daily Dhikr Streak", desc: "Morning & evening adhkar daily", xp: 100, progress: 80, joined: 230, image: eventTafsir, icon: Heart, color: "from-pink-500/40", endsIn: "Daily" },
  { title: "40 Hadith Challenge", desc: "Memorize 40 Nawawi hadiths", xp: 200, progress: 30, joined: 88, image: eventHadith, icon: BookOpen, color: "from-primary/40", endsIn: "60 days" },
];

const leaderboard = [
  { rank: 1, name: "Br. Yusuf K.", xp: 4520, badge: "🥇" },
  { rank: 2, name: "Sr. Fatima A.", xp: 4280, badge: "🥈" },
  { rank: 3, name: "Br. Ibrahim S.", xp: 3990, badge: "🥉" },
  { rank: 4, name: "Br. Hassan B.", xp: 3650, badge: "" },
  { rank: 5, name: "Sr. Aisha M.", xp: 3420, badge: "" },
  { rank: 12, name: "You", xp: 2180, badge: "", you: true },
];

const myBadges = [
  { name: "First Step", icon: "🌱", earned: true },
  { name: "Week Warrior", icon: "🔥", earned: true },
  { name: "Quran Reader", icon: "📖", earned: true },
  { name: "Dhikr Master", icon: "📿", earned: false },
  { name: "Mentor", icon: "🎓", earned: false },
  { name: "Champion", icon: "👑", earned: false },
];

const Challenges = () => {
  return (
    <AppLayout>
      <SEO title="Spiritual Challenges & Leaderboard" description="Join active spiritual and learning challenges and climb the leaderboard." path="/challenges" />
      <div className="w-full max-w-5xl mx-auto p-3 md:p-5 space-y-4 overflow-x-hidden">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-border/50 relative bg-[radial-gradient(ellipse_at_top_right,hsl(42_85%_55%/0.35),transparent_60%),radial-gradient(ellipse_at_bottom_left,hsl(340_75%_55%/0.3),transparent_55%),linear-gradient(135deg,hsl(var(--card)),hsl(var(--card)))]">
            <div className="absolute -right-10 -top-10 opacity-20 animate-pulse">
              <Trophy className="h-56 w-56 text-gold" />
            </div>
            <div className="absolute -left-6 -bottom-6 opacity-10">
              <Crown className="h-32 w-32 text-pink-500" />
            </div>
            <CardContent className="p-5 relative">
              <Badge className="bg-gold/30 text-gold border-gold/40 text-[10px] mb-2 backdrop-blur">🎮 Gamified</Badge>
              <h1 className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-gold via-pink-500 to-accent bg-clip-text text-transparent">
                Islamic Challenges
              </h1>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Compete, earn XP, unlock badges & climb the leaderboard.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { icon: Zap, label: "Total XP", value: "2,180", color: "text-gold", bg: "from-gold/20" },
                  { icon: Flame, label: "Day Streak", value: "21", color: "text-accent", bg: "from-accent/20" },
                  { icon: Star, label: "Badges", value: "3", color: "text-primary", bg: "from-primary/20" },
                ].map((s) => (
                  <motion.div
                    key={s.label}
                    whileHover={{ y: -2, scale: 1.03 }}
                    className={`rounded-2xl bg-gradient-to-br ${s.bg} to-card backdrop-blur p-3 text-center border border-border/50 shadow-sm`}
                  >
                    <s.icon className={`h-5 w-5 mx-auto ${s.color}`} />
                    <p className={`font-display text-lg font-bold ${s.color} mt-1`}>{s.value}</p>
                    <p className="font-body text-[9px] text-muted-foreground">{s.label}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-card/50 backdrop-blur border border-border/40 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-body text-[10px] text-muted-foreground">Next badge: <strong className="text-foreground">Dhikr Master</strong></span>
                  <span className="font-display text-[10px] font-bold text-primary">68%</span>
                </div>
                <Progress value={68} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="w-full flex overflow-x-auto scrollbar-hide h-auto bg-secondary/50 justify-start">
            <TabsTrigger value="active" className="font-body text-xs py-2 px-3 shrink-0">🔥 Active</TabsTrigger>
            <TabsTrigger value="leaderboard" className="font-body text-xs py-2 px-3 shrink-0">🏆 Leaderboard</TabsTrigger>
            <TabsTrigger value="badges" className="font-body text-xs py-2 px-3 shrink-0">🎖️ Badges</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-3 space-y-2.5">
            {activeChallenges.map((c) => (
              <Card key={c.title} className="overflow-hidden border-border/60 hover:shadow-glow transition-all group">
                <div className="relative h-28 overflow-hidden">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.color} via-card/40 to-card`} />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-gold/90 text-gold-foreground text-[9px]"><Zap className="h-3 w-3 mr-1" />{c.xp} XP</Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-[9px] bg-card/70 backdrop-blur">{c.endsIn}</Badge>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-display text-base font-bold text-foreground drop-shadow">{c.title}</p>
                    <p className="font-body text-[10px] text-muted-foreground">{c.desc}</p>
                  </div>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-body text-[10px] text-muted-foreground"><Users className="h-3 w-3 inline mr-1" />{c.joined} joined</span>
                    <span className="font-display text-xs font-bold text-primary">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="h-1.5 mb-2" />
                  <Button size="sm" className="w-full h-8 text-xs">Continue Challenge</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-3 space-y-2">
            {leaderboard.map((u) => (
              <Card key={u.rank} className={u.you ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${u.rank <= 3 ? "gradient-gold text-primary-foreground" : "bg-secondary"}`}>
                    {u.badge || `#${u.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold truncate">{u.name}</p>
                    <p className="font-body text-[10px] text-muted-foreground">Rank #{u.rank}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold text-gold">{u.xp.toLocaleString()}</p>
                    <p className="font-body text-[9px] text-muted-foreground">XP</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="badges" className="mt-3 grid grid-cols-3 gap-2.5">
            {myBadges.map((b) => (
              <Card key={b.name} className={b.earned ? "border-gold/40 bg-gold/5" : "opacity-50"}>
                <CardContent className="p-3 text-center">
                  <div className="text-3xl">{b.icon}</div>
                  <p className="font-display text-xs font-bold mt-1">{b.name}</p>
                  <p className="font-body text-[9px] text-muted-foreground">{b.earned ? "Earned" : "Locked"}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Challenges;
