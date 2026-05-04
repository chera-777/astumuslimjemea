import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Heart, HandHeart, Gift, Users, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import mosqueHero from "@/assets/mosque-hero.jpg";

const causes = [
  { id: "ramadan", title: "Ramadan Meal Fund", desc: "Provide iftar for 200+ students", raised: 78450, goal: 100000, icon: Gift, gradient: "from-gold/30", color: "text-gold" },
  { id: "education", title: "Tuition Support", desc: "Help students complete their education", raised: 12300, goal: 30000, icon: TrendingUp, gradient: "from-blue-500/30", color: "text-blue-500" },
  { id: "masjid", title: "Masjid Maintenance", desc: "Care for our prayer space", raised: 22000, goal: 40000, icon: HandHeart, gradient: "from-green-500/30", color: "text-green-500" },
  { id: "general", title: "General Sadaqah", desc: "Wherever needed most", raised: 45200, goal: 50000, icon: Heart, gradient: "from-primary/30", color: "text-primary" },
];

const impact = [
  { number: "320+", label: "Lives Touched", icon: Heart },
  { number: "Birr 158K", label: "Raised", icon: TrendingUp },
  { number: "85", label: "Active Donors", icon: Users },
];

const Charity = () => {
  return (
    <AppLayout>
      <div className="w-full max-w-5xl mx-auto p-3 md:p-5 space-y-4 overflow-x-hidden">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="relative overflow-hidden border-border/50 min-h-[200px]">
            <div className="absolute inset-0">
              <img src={mosqueHero} alt="Charity" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-card/30" />
            </div>
            <CardContent className="relative p-5 text-center">
              <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]"><Sparkles className="h-3 w-3 mr-1" />Sadaqah Jariyah</Badge>
              <h1 className="font-display text-2xl md:text-3xl font-bold mt-3">Give. Heal. Transform.</h1>
              <p className="font-body text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                "Every act of kindness is a sadaqah." Your contribution feeds, educates and uplifts your brothers and sisters.
              </p>
              <Button asChild size="sm" className="mt-4 gradient-pink">
                <Link to="/donations">Donate Now <ArrowRight className="h-3 w-3 ml-1" /></Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {impact.map((s) => (
            <Card key={s.label} className="bg-gradient-to-br from-accent/10 to-card">
              <CardContent className="p-3 text-center">
                <s.icon className="h-4 w-4 mx-auto text-accent mb-1" />
                <p className="font-display text-base font-bold text-foreground">{s.number}</p>
                <p className="font-body text-[9px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Causes */}
        <h3 className="font-display text-base font-bold mt-2">Active Causes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {causes.map((c) => {
            const pct = Math.round((c.raised / c.goal) * 100);
            return (
              <Card key={c.id} className={`bg-gradient-to-br ${c.gradient} via-card to-card border-border/60 hover:shadow-glow transition-all overflow-hidden relative`}>
                <div className="absolute -right-3 -top-3 opacity-10">
                  <c.icon className="h-20 w-20" />
                </div>
                <CardContent className="p-4 relative">
                  <div className={`w-10 h-10 rounded-xl bg-card/70 backdrop-blur flex items-center justify-center mb-2`}>
                    <c.icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <p className="font-display text-sm font-bold">{c.title}</p>
                  <p className="font-body text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
                  <Progress value={pct} className="h-2 mt-3 mb-1.5" />
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[10px] text-muted-foreground">Birr {c.raised.toLocaleString()} / {c.goal.toLocaleString()}</span>
                    <span className={`font-display text-xs font-bold ${c.color}`}>{pct}%</span>
                  </div>
                  <Button asChild size="sm" className="w-full mt-3 h-8 text-xs">
                    <Link to={`/donations?campaign=${c.id}`}>Contribute</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Charity;
