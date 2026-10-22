import { NaturePageHeader } from "@/components/layout/NaturePageHeader";
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Crown, Shield, GraduationCap, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Group = {
  id: string; name: string; gender: string; description: string | null;
  focus_tags: string[]; activities: string[];
};
type Member = { user_id: string; full_name: string; batch_year: string | null; role: string };
type Rec = { group_id: string; match_score: number; reason: string };

const roleIcon = (r: string) =>
  /amir/i.test(r) ? Crown : /naqeeb/i.test(r) ? Shield : /murshid/i.test(r) ? GraduationCap : User;

// Tables are new; generated types may lag, so use an untyped handle.
const db = supabase as any;

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [rosters, setRosters] = useState<Record<string, Member[]>>({});
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState("");
  const [finding, setFinding] = useState(false);
  const [recs, setRecs] = useState<Rec[] | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await db.from("student_groups").select("id, name, gender, description, focus_tags, activities").order("name");
      if (error) { toast.error("Couldn't load groups"); setLoading(false); return; }
      setGroups(data ?? []);
      const entries = await Promise.all(
        (data ?? []).map(async (g: Group) => {
          const { data: r } = await db.rpc("get_group_roster", { _group_id: g.id });
          return [g.id, (r ?? []) as Member[]] as const;
        })
      );
      setRosters(Object.fromEntries(entries));
      setLoading(false);
    })();
  }, [user]);

  const myGroups = groups.filter((g) => rosters[g.id]?.some((m) => m.user_id === user?.id));
  const otherGroups = groups.filter((g) => !myGroups.includes(g));

  const findGroups = async () => {
    if (interests.trim().length < 3) { toast.error("Tell us a little about your interests first"); return; }
    setFinding(true); setRecs(null);
    const { data, error } = await supabase.functions.invoke("recommend-groups", { body: { interests } });
    setFinding(false);
    if (error || data?.error) {
      let msg = data?.error;
      try { msg = msg || (await (error as any)?.context?.json())?.error; } catch { /* ignore */ }
      toast.error(msg || "Couldn't get suggestions right now");
      return;
    }
    setRecs(data.recommendations ?? []);
  };

  const GroupCard = ({ g, mine }: { g: Group; mine?: boolean }) => {
    const members = rosters[g.id] ?? [];
    return (
      <Card className={mine ? "border-primary/50 shadow-glow" : ""}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="font-display text-xl leading-snug break-words min-w-0">{g.name}</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {mine && <Badge className="font-body">Your group</Badge>}
              <Badge variant="secondary" className="font-body capitalize">{/^f/i.test(g.gender) ? "Sisters" : "Brothers"}</Badge>
            </div>
          </div>
          {g.description && <p className="font-body text-sm text-muted-foreground">{g.description}</p>}
        </CardHeader>
        <CardContent className="space-y-4">
          {g.focus_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {g.focus_tags.map((t) => <Badge key={t} variant="outline" className="font-body text-[10px]">#{t}</Badge>)}
            </div>
          )}
          {members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {members.map((m) => {
                const Icon = roleIcon(m.role);
                return (
                  <div key={m.user_id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium break-words">{m.full_name}{m.user_id === user?.id && " (you)"}</p>
                      <p className="font-body text-[10px] text-muted-foreground">{m.batch_year ? `${m.batch_year} • ` : ""}{m.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="font-body text-xs text-muted-foreground">No members assigned yet.</p>
          )}
          {g.activities.length > 0 && (
            <div>
              <p className="font-body text-xs font-semibold text-muted-foreground uppercase mb-2">Activities</p>
              <div className="flex flex-wrap gap-2">
                {g.activities.map((a) => <Badge key={a} variant="outline" className="font-body text-xs">{a}</Badge>)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout>
      <SEO title="Student Groups — ASTU Muslim Jemea" description="Browse and join the 14-student community groups led by appointed Amirs." path="/groups" />
      <div className="p-4 md:p-6 space-y-6">
        <NaturePageHeader title="Group System" subtitle="Annual groups of 14 students" />

        <section className="border-y border-border py-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl font-bold">Find groups for you</h2>
            </div>
            <Textarea value={interests} onChange={(e) => setInterests(e.target.value)} maxLength={1000}
              aria-label="Your interests"
              placeholder="e.g. I'm a 2nd-year software student who wants to improve my tajweed and help juniors with maths" className="font-body min-h-28" />
            <Button variant="nature" onClick={findGroups} disabled={finding} className="h-12">
              {finding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {finding ? "Finding matches…" : "Suggest groups"}
            </Button>
            {recs && (recs.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No close matches yet — try describing more interests.</p>
            ) : (
              <div className="space-y-2">
                {recs.map((r) => {
                  const g = groups.find((x) => x.id === r.group_id);
                  if (!g) return null;
                  return (
                    <div key={r.group_id} className="p-3 rounded-xl bg-secondary flex items-start gap-3">
                      <div className="shrink-0 w-11 h-11 rounded-full bg-primary/15 text-primary font-display font-bold flex items-center justify-center text-sm">{r.match_score}%</div>
                      <div>
                        <p className="font-body text-sm font-semibold">{g.name}</p>
                        <p className="font-body text-xs text-muted-foreground">{r.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </section>

        {loading ? (
          <div className="space-y-4">{[0, 1].map((i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}</div>
        ) : groups.length === 0 ? (
          <Card><CardContent className="p-0">
            <EmptyState icon={Users} title="No groups yet" description="Groups are formed at the start of each academic year. You'll see yours here once assigned." actionLabel="Back to home" actionTo="/dashboard" />
          </CardContent></Card>
        ) : (
          <div className="space-y-6">
            {myGroups.map((g) => <GroupCard key={g.id} g={g} mine />)}
            {otherGroups.length > 0 && myGroups.length > 0 && (
              <h2 className="font-display text-lg font-bold">Other groups</h2>
            )}
            {otherGroups.map((g) => <GroupCard key={g.id} g={g} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Groups;
