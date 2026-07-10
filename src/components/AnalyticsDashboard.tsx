import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Users, Calendar, DollarSign, TrendingUp } from "lucide-react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--gold))", "hsl(var(--green))", "hsl(var(--pink))", "hsl(var(--teal))"];

interface Stats {
  totalUsers: number;
  activeWeek: number;
  totalEvents: number;
  totalRsvps: number;
  totalDonations: number;
  donationCount: number;
}

interface Bucket { week: string; value: number }

export function AnalyticsDashboard({ scope = "university" }: { scope?: "university" | "global" }) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, activeWeek: 0, totalEvents: 0, totalRsvps: 0, totalDonations: 0, donationCount: 0,
  });
  const [donationTrend, setDonationTrend] = useState<Bucket[]>([]);
  const [signupTrend, setSignupTrend] = useState<Bucket[]>([]);
  const [rolePie, setRolePie] = useState<{ name: string; value: number }[]>([]);
  const [eventBars, setEventBars] = useState<{ name: string; rsvps: number }[]>([]);

  useEffect(() => {
    const uni = profile?.university_id;
    if (scope === "university" && !uni) return;

    (async () => {
      setLoading(true);
      const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 3600 * 1000).toISOString();

      const profQ = supabase.from("profiles").select("id, created_at, updated_at", { count: "exact" });
      const evQ = supabase.from("events").select("id, title, start_time");
      const rsvpQ = supabase.from("event_rsvps").select("event_id, status");
      const donQ = supabase.from("donations").select("amount, created_at");
      const roleQ = supabase.from("user_roles").select("role, user_id");

      if (scope === "university" && uni) {
        profQ.eq("university_id", uni);
        evQ.eq("university_id", uni);
      }

      const [profRes, evRes, rsvpRes, donRes, roleRes] = await Promise.all([
        profQ, evQ, rsvpQ, donQ, roleQ,
      ]);

      const profiles = profRes.data || [];
      const events = evRes.data || [];
      const rsvps = (rsvpRes.data || []).filter((r: any) => events.some((e: any) => e.id === r.event_id));
      const donations = donRes.data || [];
      const roles = (roleRes.data || []).filter((r: any) => profiles.some((p: any) => p.id === r.user_id));

      const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
      const activeWeek = profiles.filter((p: any) => new Date(p.updated_at).getTime() > weekAgo).length;
      const totalDon = donations.reduce((a: number, d: any) => a + Number(d.amount || 0), 0);

      // Weekly buckets (last 8 weeks)
      const buckets = (rows: any[], dateField: string, valueFn: (r: any) => number): Bucket[] => {
        const map = new Map<string, number>();
        for (let i = 7; i >= 0; i--) {
          const d = new Date(Date.now() - i * 7 * 24 * 3600 * 1000);
          const key = `W${Math.ceil(d.getDate() / 7)}/${d.getMonth() + 1}`;
          map.set(key, 0);
        }
        const keys = [...map.keys()];
        rows.forEach((r) => {
          const t = new Date(r[dateField]).getTime();
          if (t < Date.now() - 8 * 7 * 24 * 3600 * 1000) return;
          const weeksAgo = Math.floor((Date.now() - t) / (7 * 24 * 3600 * 1000));
          const idx = 7 - weeksAgo;
          if (idx >= 0 && idx < 8) {
            const k = keys[idx];
            map.set(k, (map.get(k) || 0) + valueFn(r));
          }
        });
        return [...map.entries()].map(([week, value]) => ({ week, value }));
      };

      setDonationTrend(buckets(donations.filter((d: any) => new Date(d.created_at).toISOString() > eightWeeksAgo), "created_at", (r) => Number(r.amount || 0)));
      setSignupTrend(buckets(profiles.filter((p: any) => new Date(p.created_at).toISOString() > eightWeeksAgo), "created_at", () => 1));

      // Role distribution
      const roleCount = new Map<string, number>();
      roles.forEach((r: any) => roleCount.set(r.role, (roleCount.get(r.role) || 0) + 1));
      setRolePie([...roleCount.entries()].map(([name, value]) => ({ name, value })));

      // Top 5 events by RSVP
      const rsvpCount = new Map<string, number>();
      rsvps.forEach((r: any) => rsvpCount.set(r.event_id, (rsvpCount.get(r.event_id) || 0) + 1));
      const top = events
        .map((e: any) => ({ name: (e.title || "").slice(0, 14), rsvps: rsvpCount.get(e.id) || 0 }))
        .sort((a, b) => b.rsvps - a.rsvps)
        .slice(0, 5);
      setEventBars(top);

      setStats({
        totalUsers: profiles.length,
        activeWeek,
        totalEvents: events.length,
        totalRsvps: rsvps.length,
        totalDonations: totalDon,
        donationCount: donations.length,
      });
      setLoading(false);
    })();
  }, [profile?.university_id, scope]);

  const kpis = [
    { icon: Users, label: "Members", value: stats.totalUsers, sub: `${stats.activeWeek} active/wk`, gradient: "gradient-teal" },
    { icon: Calendar, label: "Events", value: stats.totalEvents, sub: `${stats.totalRsvps} RSVPs`, gradient: "gradient-blue" },
    { icon: DollarSign, label: "Donations", value: `$${stats.totalDonations.toFixed(0)}`, sub: `${stats.donationCount} gifts`, gradient: "gradient-gold" },
    { icon: TrendingUp, label: "Engagement", value: `${stats.totalUsers ? Math.round((stats.activeWeek / stats.totalUsers) * 100) : 0}%`, sub: "weekly active", gradient: "gradient-pink" },
  ];

  if (loading) {
    return <div className="py-12 text-center text-sm text-muted-foreground font-body">Loading analytics…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border border-border bg-card">
              <CardContent className="p-3">
                <div className={`w-9 h-9 rounded-lg ${k.gradient} flex items-center justify-center mb-2`}>
                  <k.icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="font-display text-xl font-bold">{k.value}</p>
                <p className="font-body text-[10px] text-muted-foreground">{k.label} • {k.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="border border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="font-display text-sm">Donations (last 8 weeks)</CardTitle></CardHeader>
          <CardContent className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={donationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--gold))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="font-display text-sm">New signups (last 8 weeks)</CardTitle></CardHeader>
          <CardContent className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={signupTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="font-display text-sm">Top events by RSVP</CardTitle></CardHeader>
          <CardContent className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventBars} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                <Bar dataKey="rsvps" fill="hsl(var(--teal))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="font-display text-sm">Role distribution</CardTitle></CardHeader>
          <CardContent className="h-56 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={rolePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={{ fontSize: 10 }}>
                  {rolePie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
