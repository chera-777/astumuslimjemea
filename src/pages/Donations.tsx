import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, HandHeart, TrendingUp, Users, Sparkles, Gift } from "lucide-react";

const campaigns = [
  { id: "general", name: "General Sadaqah", icon: Heart, gradient: "gradient-teal", desc: "Support overall community programs" },
  { id: "ramadan", name: "Ramadan Fund", icon: Gift, gradient: "gradient-gold", desc: "Iftar, suhoor & meal cards" },
  { id: "education", name: "Education Support", icon: TrendingUp, gradient: "gradient-blue", desc: "Books, tutoring & scholarships" },
  { id: "masjid", name: "Masjid Maintenance", icon: HandHeart, gradient: "gradient-green", desc: "Prayer space upkeep" },
];

const quickAmounts = [10, 25, 50, 100, 250, 500];

const Donations = () => {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [campaign, setCampaign] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!user) { toast.error("Please sign in to donate"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!profile?.university_id) { toast.error("Complete your profile first"); return; }

    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      donor_id: user.id,
      university_id: profile.university_id,
      amount: Number(amount),
      campaign,
      is_anonymous: isAnonymous,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("🤲 JazakAllahu Khairan! Donation recorded.");
      setAmount("");
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mx-auto mb-3">
            <HandHeart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">Sadaqah & Donations</h1>
          <p className="text-muted-foreground font-body text-sm mt-1">
            "The believer's shade on the Day of Resurrection will be his charity." — Prophet ﷺ
          </p>
        </motion.div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-2 gap-3">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setCampaign(c.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  campaign === c.id
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl ${c.gradient} flex items-center justify-center mb-2`}>
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="font-body text-sm font-bold text-foreground">{c.name}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{c.desc}</p>
              </button>
            </motion.div>
          ))}
        </div>

        {/* Amount */}
        <Card className="gamification-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" /> Select Amount (ETB)
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(a => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`p-3 rounded-xl border-2 font-body font-bold text-sm transition-all ${
                    amount === String(a)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-foreground hover:border-primary/40"
                  }`}
                >
                  {a} ETB
                </button>
              ))}
            </div>

            <div>
              <Label className="font-body text-sm">Custom Amount</Label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
              <Checkbox id="anon" checked={isAnonymous} onCheckedChange={(v) => setIsAnonymous(!!v)} />
              <Label htmlFor="anon" className="font-body text-xs cursor-pointer">
                Donate anonymously
              </Label>
            </div>

            <Button
              onClick={handleDonate}
              disabled={loading || !amount}
              className="w-full gradient-gold text-primary-foreground border-0 shadow-gold"
              size="lg"
            >
              {loading ? "Processing..." : (
                <>Donate {amount ? `${amount} ETB` : ""} <Heart className="ml-2 h-4 w-4" /></>
              )}
            </Button>

            <p className="text-center text-[10px] text-muted-foreground font-body">
              All donations are tracked transparently within your university community
            </p>
          </CardContent>
        </Card>

        {/* Impact stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Raised", value: "15,000 ETB", icon: TrendingUp, gradient: "gradient-teal" },
            { label: "Donors", value: "127", icon: Users, gradient: "gradient-blue" },
            { label: "Campaigns", value: "4", icon: Gift, gradient: "gradient-pink" },
          ].map((s, i) => (
            <Card key={i} className="gamification-card">
              <CardContent className="p-3 text-center">
                <div className={`w-9 h-9 rounded-xl ${s.gradient} flex items-center justify-center mx-auto mb-1.5`}>
                  <s.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Donations;
