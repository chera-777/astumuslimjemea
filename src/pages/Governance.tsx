import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, Lock, Calendar, FileText, Users, CheckCircle, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

// Election season: only April each year
const isElectionSeason = (() => {
  const now = new Date();
  return now.getMonth() === 3; // April
})();

// Phase: nomination -> shortlisting -> voting -> closed
const electionPhase: "nomination" | "voting" | "closed" = "nomination";

const sectors = ["Main Sector", "Qira'at Sector", "Academic Sector", "Financial Sector", "Khadims Sector"];

const pastResults = [
  { sector: "Main Sector Amir 2025", winner: "Br. Mohammed A.", votes: 312, total: 450 },
  { sector: "Financial Sector Amir 2025", winner: "Br. Yusuf G.", votes: 278, total: 450 },
  { sector: "Academic Sector Amir 2025", winner: "Br. Ahmed K.", votes: 256, total: 450 },
];

const Governance = () => {
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeSector, setNomineeSector] = useState(sectors[0]);
  const [reason, setReason] = useState("");

  const submitNomination = () => {
    if (!nomineeName || !reason) {
      toast.error("Please fill all fields");
      return;
    }
    toast.success(`Nomination submitted for ${nomineeName} — ${nomineeSector}`);
    setNomineeName(""); setReason("");
  };

  if (!isElectionSeason) {
    return (
      <AppLayout>
        <div className="w-full max-w-3xl mx-auto p-3 md:p-5 space-y-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-violet-500/20 via-primary/10 to-card relative">
              <div className="absolute -right-6 -top-6 opacity-10">
                <Vote className="h-44 w-44" />
              </div>
              <CardContent className="p-6 relative text-center">
                <div className="w-16 h-16 rounded-full bg-card/70 backdrop-blur mx-auto flex items-center justify-center mb-3 border border-border">
                  <Lock className="h-7 w-7 text-muted-foreground" />
                </div>
                <Badge className="bg-violet-500/20 text-violet-500 border-violet-500/30 text-[10px] mb-2">Closed</Badge>
                <h1 className="font-display text-2xl font-bold">Governance is Closed</h1>
                <p className="font-body text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                  Elections open once a year, every <strong className="text-foreground">April</strong>.
                  Nominations begin first, the committee shortlists the top 2 candidates per sector, then voting opens.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-5 max-w-md mx-auto">
                  <div className="rounded-xl bg-card/60 p-3 border border-border/50">
                    <FileText className="h-4 w-4 mx-auto text-primary mb-1" />
                    <p className="font-display text-xs font-bold">Nominate</p>
                    <p className="font-body text-[9px] text-muted-foreground">Step 1</p>
                  </div>
                  <div className="rounded-xl bg-card/60 p-3 border border-border/50">
                    <Sparkles className="h-4 w-4 mx-auto text-gold mb-1" />
                    <p className="font-display text-xs font-bold">Shortlist</p>
                    <p className="font-body text-[9px] text-muted-foreground">Step 2</p>
                  </div>
                  <div className="rounded-xl bg-card/60 p-3 border border-border/50">
                    <Vote className="h-4 w-4 mx-auto text-accent mb-1" />
                    <p className="font-display text-xs font-bold">Vote</p>
                    <p className="font-body text-[9px] text-muted-foreground">Step 3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardHeader><CardTitle className="font-display text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Past Results</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {pastResults.map((r) => (
                <div key={r.sector} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium truncate">{r.sector}</p>
                    <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-primary" /> {r.winner}
                    </p>
                  </div>
                  <span className="font-body text-xs text-muted-foreground shrink-0">{r.votes}/{r.total}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Open season
  return (
    <AppLayout>
      <div className="w-full max-w-3xl mx-auto p-3 md:p-5 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-card border-primary/30">
            <CardContent className="p-5">
              <Badge className="gradient-pink text-primary-foreground text-[10px]">Election Season Open</Badge>
              <h1 className="font-display text-2xl font-bold mt-2">Governance & Elections</h1>
              <p className="font-body text-xs text-muted-foreground mt-1">Phase: <strong className="text-foreground capitalize">{electionPhase}</strong></p>
            </CardContent>
          </Card>
        </motion.div>

        {electionPhase === "nomination" && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Nominate a Candidate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Candidate Name</Label>
                <Input value={nomineeName} onChange={(e) => setNomineeName(e.target.value)} placeholder="Br. Ahmed M." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Sector</Label>
                <select value={nomineeSector} onChange={(e) => setNomineeSector(e.target.value)} className="mt-1 w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                  {sectors.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs">Why this candidate?</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain why they would serve well..." className="mt-1" rows={3} />
              </div>
              <Button onClick={submitNomination} className="w-full">Submit Nomination</Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="font-display text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Past Results</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pastResults.map((r) => (
              <div key={r.sector} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary">
                <div className="min-w-0">
                  <p className="font-body text-sm font-medium truncate">{r.sector}</p>
                  <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-primary" /> {r.winner}
                  </p>
                </div>
                <span className="font-body text-xs text-muted-foreground shrink-0">{r.votes}/{r.total}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Governance;
