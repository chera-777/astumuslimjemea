import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Row {
  id: string;
  full_name: string;
  level: number;
  monthly_xp: number;
  total_xp: number;
}

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

export function Leaderboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("v_university_leaderboard")
        .select("id,full_name,level,monthly_xp,total_xp")
        .order("monthly_xp", { ascending: false })
        .limit(20);
      setRows((data as Row[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Trophy className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" aria-hidden="true" />
        <p className="font-body text-sm text-muted-foreground">
          No XP earned yet this month. Join an event or read Qur'an to get on the board.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 pb-24">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="font-display text-sm font-bold">This month's top members</h2>
      </div>
      {rows.map((r, i) => {
        const isMe = r.id === user?.id;
        return (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
          >
            <Card className={isMe ? "border-primary/60 bg-primary/5" : "border-border"}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className="w-7 text-center font-display text-sm font-bold shrink-0">
                  {medal(i)}
                </span>
                <div className="w-9 h-9 rounded-full gradient-teal flex items-center justify-center shrink-0">
                  <span className="font-body text-xs font-bold text-primary-foreground">
                    {r.full_name?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold truncate">
                    {r.full_name}
                    {isMe && <span className="text-[10px] text-primary ml-1.5">you</span>}
                  </p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    Level {r.level} · {r.total_xp} XP total
                  </p>
                </div>
                <Badge className="shrink-0 gap-1 bg-primary/15 text-primary border border-primary/30">
                  <Zap className="h-3 w-3" aria-hidden="true" /> {r.monthly_xp}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
