import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Vote, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const elections = [
  { sector: "Main Sector Amir", candidates: ["Ahmed M.", "Yusuf K.", "Ibrahim A.", "Hassan B."], status: "voting", deadline: "April 15", voted: false, totalVotes: 234, progress: 67 },
  { sector: "Qira'at Sector Amir", candidates: ["Omar S.", "Bilal H."], status: "upcoming", deadline: "April 15", voted: false, totalVotes: 0, progress: 0 },
  { sector: "Academic Sector Amir", candidates: ["Hamza T.", "Ali R.", "Khalid D."], status: "upcoming", deadline: "April 15", voted: false, totalVotes: 0, progress: 0 },
];

const pastResults = [
  { sector: "Main Sector Amir 2025", winner: "Br. Mohammed A.", votes: 312, total: 450 },
  { sector: "Financial Sector Amir 2025", winner: "Br. Yusuf G.", votes: 278, total: 450 },
];

const Governance = () => {
  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <Vote className="h-6 w-6 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Governance & Elections</h1>
          </div>
          <p className="text-muted-foreground font-body text-sm">Transparent, anonymous & secure voting</p>
        </motion.div>

        <div className="flex gap-2">
          <Badge variant="default" className="font-body">Brothers' Elections</Badge>
          <Badge variant="outline" className="font-body">Sisters' Elections</Badge>
        </div>

        <div className="space-y-4">
          {elections.map((e, i) => (
            <motion.div key={e.sector} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className={e.status === "voting" ? "border-primary/30" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-lg">{e.sector}</CardTitle>
                    <Badge variant={e.status === "voting" ? "default" : "secondary"} className="font-body text-xs">
                      {e.status === "voting" ? "🗳 Voting Open" : "⏳ Upcoming"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="font-body text-xs text-muted-foreground">Deadline: {e.deadline} • {e.candidates.length} candidates</p>
                  {e.status === "voting" && (
                    <>
                      <div className="space-y-2">
                        {e.candidates.map((c) => (
                          <div key={c} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                            <span className="font-body text-sm">{c}</span>
                            <Button size="sm" variant="outline" className="font-body text-xs h-7">Vote</Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={e.progress} className="flex-1" />
                        <span className="font-body text-xs text-muted-foreground">{e.totalVotes} votes</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Past Results</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {pastResults.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="font-body text-sm font-medium">{r.sector}</p>
                  <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-primary" /> Winner: {r.winner}
                  </p>
                </div>
                <span className="font-body text-xs text-muted-foreground">{r.votes}/{r.total} votes</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Governance;
