import { NaturePageHeader } from "@/components/layout/NaturePageHeader";
import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Heart, HandHeart, TrendingUp, Users, Sparkles, Gift } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

const campaigns = [
  { id: "general", name: "General Sadaqah", icon: Heart, gradient: "gradient-teal", desc: "Support overall community programs", goal: 50000 },
  { id: "ramadan", name: "Ramadan Fund", icon: Gift, gradient: "gradient-gold", desc: "Iftar, suhoor & meal cards", goal: 30000 },
  { id: "education", name: "Education Support", icon: TrendingUp, gradient: "gradient-blue", desc: "Books, tutoring & scholarships", goal: 20000 },
  { id: "masjid", name: "Masjid Maintenance", icon: HandHeart, gradient: "gradient-green", desc: "Prayer space upkeep", goal: 40000 },
];

const quickAmounts = [10, 25, 50, 100, 250, 500];

const Donations = () => {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [campaign, setCampaign] = useState("general");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [campaignTotals, setCampaignTotals] = useState<Record<string, number>>({});
  const [totalDonors, setTotalDonors] = useState(0);
  const [totalRaised, setTotalRaised] = useState(0);
  const [myDonations, setMyDonations] = useState<{ amount: number; campaign: string | null; created_at: string }[]>([]);

  const fetchStats = async () => {
    // Fetch all donations for the user's university
    if (!profile?.university_id) return;
    const { data } = await supabase
      .from("donations")
      .select("amount, campaign, donor_id, created_at")
      .eq("university_id", profile.university_id);

    if (data) {
      const totals: Record<string, number> = {};
      const donorSet = new Set<string>();
      let raised = 0;
      data.forEach(d => {
        totals[d.campaign || "general"] = (totals[d.campaign || "general"] || 0) + Number(d.amount);
        if (d.donor_id) donorSet.add(d.donor_id);
        raised += Number(d.amount);
      });
      setCampaignTotals(totals);
      setTotalDonors(donorSet.size);
      setTotalRaised(raised);
    }

    // Fetch user's own donations
    if (user) {
      const { data: mine } = await supabase
        .from("donations")
        .select("amount, campaign, created_at")
        .eq("donor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (mine) setMyDonations(mine);
    }
  };

  useEffect(() => { fetchStats(); }, [profile?.university_id, user]);

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
      fetchStats();
    }
    setLoading(false);
  };

  const selectedCampaign = campaigns.find(c => c.id === campaign);
  if (!selectedCampaign) return null;
  const campaignRaised = campaignTotals[campaign] || 0;
  const campaignProgress = Math.min((campaignRaised / selectedCampaign.goal) * 100, 100);

  return (
    <AppLayout>
      <SEO title="Donations — Support Our Community" description="Contribute to active donation campaigns supporting the ASTU Muslim community." path="/donations" />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <NaturePageHeader title="Sadaqah & Donations" subtitle="Support your university community" />

        {/* Campaign Cards */}
        <div className="grid grid-cols-2 gap-3">
          {campaigns.map((c, i) => {
            const raised = campaignTotals[c.id] || 0;
            const prog = Math.min((raised / c.goal) * 100, 100);
            return (
              <motion.div key={c.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Button
                  variant="outline"
                  aria-pressed={campaign === c.id}
                  onClick={() => setCampaign(c.id)}
                  className={`block w-full h-full whitespace-normal text-left p-5 rounded-lg border transition-all hover:text-foreground ${
                    campaign === c.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${c.gradient} flex items-center justify-center mb-2`}>
                    <c.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="font-body text-sm font-bold text-foreground">{c.name}</p>
                  <p className="font-body text-xs text-muted-foreground mt-2">{c.desc}</p>
                  <div className="mt-2">
                    <Progress value={prog} className="h-1.5" />
                    <p className="font-body text-xs text-muted-foreground mt-2">
                      {raised.toLocaleString()} / {c.goal.toLocaleString()} ETB
                    </p>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>

        {/* Amount */}
        <Card className="gamification-card">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" /> Select Amount (ETB)
            </h3>

            {/* Campaign progress */}
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-body text-xs font-semibold">{selectedCampaign.name}</span>
                <span className="font-body text-xs text-primary font-bold">{Math.round(campaignProgress)}%</span>
              </div>
              <Progress value={campaignProgress} className="h-2" />
              <p className="font-body text-[10px] text-muted-foreground mt-1">
                {campaignRaised.toLocaleString()} ETB raised of {selectedCampaign.goal.toLocaleString()} ETB goal
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map(a => (
                <Button
                  key={a}
                  variant="outline"
                  aria-pressed={amount === String(a)}
                  onClick={() => setAmount(String(a))}
                  className={`h-12 p-3 rounded-lg border font-body font-bold text-sm transition-all ${
                    amount === String(a)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-secondary text-foreground hover:border-primary/40"
                  }`}
                >
                  {a} ETB
                </Button>
              ))}
            </div>

            <div>
              <Label className="font-body text-sm">Custom Amount</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Enter amount" className="mt-1" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
              <Checkbox id="anon" checked={isAnonymous} onCheckedChange={(v) => setIsAnonymous(!!v)} />
              <Label htmlFor="anon" className="font-body text-xs cursor-pointer">Donate anonymously</Label>
            </div>

            <Button
              onClick={handleDonate}
              disabled={loading || !amount}
              variant="nature"
              className="w-full h-12"
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
            { label: "Total Raised", value: `${totalRaised.toLocaleString()} ETB`, icon: TrendingUp, gradient: "gradient-teal" },
            { label: "Donors", value: String(totalDonors), icon: Users, gradient: "gradient-blue" },
            { label: "Campaigns", value: String(campaigns.length), icon: Gift, gradient: "gradient-pink" },
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

        {/* Recent donations */}
        <Card className="gamification-card">
          <CardContent className="p-4">
            <h3 className="font-display text-sm font-bold mb-3">Your Recent Donations</h3>
            {myDonations.length === 0 ? (
              <EmptyState
                icon={HandHeart}
                title="No donations yet"
                description="Your giving history will appear here once you support a campaign."
              />
            ) : (
              <div className="space-y-2">
                {myDonations.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary">
                    <div>
                      <p className="font-body text-xs font-semibold capitalize">{d.campaign || "General"}</p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="font-display text-sm font-bold text-primary">{d.amount} ETB</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AppLayout>
  );
};

export default Donations;
