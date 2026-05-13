import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, Lock, FileText, CheckCircle, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

const isElectionSeason = (() => new Date().getMonth() === 3)();

const sectors = ["Main Sector", "Qira'at Sector", "Academic Sector", "Financial Sector", "Khadims Sector"];

const shortlist: Record<string, { id: string; name: string; reason: string; votes: number }[]> = {
  "Main Sector": [
    { id: "m1", name: "Br. Ahmed M.", reason: "Strong leadership, 3 yrs in committee", votes: 142 },
    { id: "m2", name: "Br. Yusuf K.", reason: "Active in halaqas & mentoring", votes: 118 },
  ],
  "Financial Sector": [
    { id: "f1", name: "Br. Ibrahim S.", reason: "Accounting major, transparency advocate", votes: 99 },
    { id: "f2", name: "Br. Hassan B.", reason: "Donations record-holder 2025", votes: 87 },
  ],
  "Academic Sector": [
    { id: "a1", name: "Sh. Bilal H.", reason: "Top tutor, mentors 50+ students", votes: 121 },
    { id: "a2", name: "Br. Omar Z.", reason: "Library reform proposal", votes: 76 },
  ],
};

const pastResults = [
  { sector: "Main Sector Amir 2025", winner: "Br. Mohammed A.", votes: 312, total: 450 },
  { sector: "Financial Sector Amir 2025", winner: "Br. Yusuf G.", votes: 278, total: 450 },
  { sector: "Academic Sector Amir 2025", winner: "Br. Ahmed K.", votes: 256, total: 450 },
];

type Phase = "nomination" | "shortlisting" | "voting" | "closed";

const Governance = () => {
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeSector, setNomineeSector] = useState(sectors[0]);
  const [reason, setReason] = useState("");
  // Demo: allow simulating phases when not in season
  const [phase, setPhase] = useState<Phase>(isElectionSeason ? "nomination" : "closed");
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});

  const submitNomination = () => {
    if (!nomineeName || !reason) return toast.error("Please fill all fields");
    toast.success(`Nomination submitted for ${nomineeName} — ${nomineeSector}`);
    setNomineeName(""); setReason("");
  };

  const castVote = (sector: string, candidateId: string, candidateName: string) => {
    if (myVotes[sector]) return toast.error("You already voted in this sector");
    setMyVotes((p) => ({ ...p, [sector]: candidateId }));
    toast.success(`Vote cast for ${candidateName}`);
  };

  return (
    <AppLayout>
      <SEO title="Governance & Elections — ASTU Muslim Jemea" description="Leadership, sector Amirs, and seasonal election workflow for the ASTU Muslim community." path="/governance" />
      <div className="w-full max-w-3xl mx-auto p-3 md:p-5 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-violet-500/20 via-primary/10 to-card relative">
            <div className="absolute -right-6 -top-6 opacity-10"><Vote className="h-44 w-44" /></div>
            <CardContent className="p-5 relative">
              <Badge className={phase === "closed" ? "bg-violet-500/20 text-violet-500 border-violet-500/30 text-[10px]" : "gradient-pink text-primary-foreground text-[10px]"}>
                {phase === "closed" ? "Closed" : "Election Season"}
              </Badge>
              <h1 className="font-display text-2xl font-bold mt-2">Governance & Elections</h1>
              <p className="font-body text-xs text-muted-foreground mt-1">
                {phase === "closed"
                  ? "Elections open every April. Preview the workflow below."
                  : <>Current phase: <strong className="text-foreground capitalize">{phase}</strong></>}
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {(["nomination","shortlisting","voting"] as Phase[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPhase(p)}
                    className={`rounded-xl p-2 border text-center transition ${phase === p ? "bg-primary/15 border-primary" : "bg-card/60 border-border/50"}`}
                  >
                    {p === "nomination" && <FileText className="h-4 w-4 mx-auto text-primary mb-1" />}
                    {p === "shortlisting" && <Sparkles className="h-4 w-4 mx-auto text-gold mb-1" />}
                    {p === "voting" && <Vote className="h-4 w-4 mx-auto text-accent mb-1" />}
                    <p className="font-display text-xs font-bold capitalize">{p}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={phase} onValueChange={(v) => setPhase(v as Phase)}>
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="nomination" className="text-[10px] py-2">Nominate</TabsTrigger>
            <TabsTrigger value="shortlisting" className="text-[10px] py-2">Shortlist</TabsTrigger>
            <TabsTrigger value="voting" className="text-[10px] py-2">Vote</TabsTrigger>
            <TabsTrigger value="closed" className="text-[10px] py-2">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="nomination" className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Nominate a Candidate
                </CardTitle>
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
                  <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain..." className="mt-1" rows={3} />
                </div>
                <Button onClick={submitNomination} className="w-full">Submit Nomination</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortlisting" className="mt-3 space-y-3">
            <p className="font-body text-xs text-muted-foreground">Top 2 candidates per sector chosen by the committee:</p>
            {Object.entries(shortlist).map(([sector, cands]) => (
              <Card key={sector}>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-display">{sector}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {cands.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-secondary">
                      <div className="flex items-center justify-between">
                        <p className="font-body text-sm font-semibold">{c.name}</p>
                        <Badge variant="outline" className="text-[9px]">Shortlisted</Badge>
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground mt-0.5">{c.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="voting" className="mt-3 space-y-3">
            {Object.entries(shortlist).map(([sector, cands]) => {
              const totalVotes = cands.reduce((s, c) => s + c.votes + (myVotes[sector] === c.id ? 1 : 0), 0);
              const voted = myVotes[sector];
              return (
                <Card key={sector}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-display flex items-center justify-between">
                      <span>{sector}</span>
                      {voted && <Badge className="text-[9px] bg-primary/20 text-primary">Voted ✓</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {cands.map((c) => {
                      const myBoost = voted === c.id ? 1 : 0;
                      const pct = totalVotes ? Math.round(((c.votes + myBoost) / totalVotes) * 100) : 0;
                      return (
                        <div key={c.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-body text-sm font-medium">{c.name}</p>
                            <span className="font-body text-xs text-primary font-bold">{pct}%</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                          <Button
                            size="sm"
                            variant={voted === c.id ? "default" : "outline"}
                            disabled={!!voted}
                            onClick={() => castVote(sector, c.id, c.name)}
                            className="w-full h-7 text-[10px]"
                          >
                            {voted === c.id ? "Your Vote" : voted ? "Voting Closed" : "Vote"}
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="closed" className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> Past Results
                </CardTitle>
              </CardHeader>
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
                {!isElectionSeason && (
                  <div className="text-center p-3 rounded-lg bg-muted/40 mt-2">
                    <Lock className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                    <p className="font-body text-[11px] text-muted-foreground">Live elections reopen in April.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Governance;
