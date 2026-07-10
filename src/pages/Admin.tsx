import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Users, Flag, ScrollText, CheckCircle2, XCircle, Search, Bell } from "lucide-react";
import { PushComposer } from "@/components/PushComposer";

type Profile = {
  id: string;
  full_name: string;
  department: string | null;
  is_verified: boolean;
  university_id: string;
};

type Report = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  reporter_id: string;
  created_at: string;
};

type AuditEntry = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  meta: any;
  created_at: string;
};

type RoleRow = { user_id: string; role: string };

const ROLES = ["admin", "amir", "committee", "student", "guest"] as const;

export default function Admin() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, string[]>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: profs }, { data: rls }, { data: reps }, { data: aud }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,department,is_verified,university_id").limit(500),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("content_reports").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setProfiles((profs as Profile[]) || []);
    const map: Record<string, string[]> = {};
    ((rls as RoleRow[]) || []).forEach(r => {
      map[r.user_id] = [...(map[r.user_id] || []), r.role];
    });
    setRolesByUser(map);
    setReports((reps as Report[]) || []);
    setAudit((aud as AuditEntry[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (userId: string, role: string) => {
    const has = (rolesByUser[userId] || []).includes(role);
    if (has) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) return toast.error(error.message);
      toast.success(`Revoked ${role}`);
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
      if (error) return toast.error(error.message);
      toast.success(`Granted ${role}`);
    }
    load();
  };

  const setVerified = async (userId: string, value: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_verified: value }).eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success(value ? "Verified" : "Unverified");
    load();
  };

  const resolveReport = async (id: string, status: "resolved" | "dismissed") => {
    const { error } = await supabase.from("content_reports").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Report ${status}`);
    load();
  };

  const filtered = profiles.filter(p =>
    !q || p.full_name?.toLowerCase().includes(q.toLowerCase()) || p.department?.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppLayout>
      <SEO title="Admin Dashboard — ASTU Muslim Jemea" description="Manage users, roles, reports and audit log." path="/admin" />
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Users · Reports · Moderation · Audit</p>
          </div>
        </header>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="users"><Users className="h-4 w-4 mr-1.5" />Users</TabsTrigger>
            <TabsTrigger value="reports"><Flag className="h-4 w-4 mr-1.5" />Reports {reports.filter(r=>r.status==='open').length>0 && <Badge className="ml-1.5">{reports.filter(r=>r.status==='open').length}</Badge>}</TabsTrigger>
            <TabsTrigger value="audit"><ScrollText className="h-4 w-4 mr-1.5" />Audit</TabsTrigger>
            <TabsTrigger value="push"><Bell className="h-4 w-4 mr-1.5" />Push</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users…" value={q} onChange={e => setQ(e.target.value)} className="pl-9" />
            </div>
            {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
              <div className="space-y-2">
                {filtered.map(p => (
                  <Card key={p.id} className="p-3">
                    <div className="flex flex-wrap items-center gap-3 justify-between">
                      <div>
                        <p className="font-medium text-sm">{p.full_name} {p.is_verified && <CheckCircle2 className="inline h-3.5 w-3.5 text-primary" />}</p>
                        <p className="text-[11px] text-muted-foreground">{p.department || "—"} · <code className="text-[10px]">{p.id.slice(0,8)}</code></p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ROLES.map(r => {
                          const has = (rolesByUser[p.id] || []).includes(r);
                          return (
                            <Button key={r} size="sm" variant={has ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => toggleRole(p.id, r)}>{r}</Button>
                          );
                        })}
                        <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setVerified(p.id, !p.is_verified)}>
                          {p.is_verified ? "Unverify" : "Verify"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
                {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No users match.</p>}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-2">
            {reports.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reports.</p>}
            {reports.map(r => (
              <Card key={r.id} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">{r.target_type}</Badge>
                      <Badge className={`text-[10px] ${r.status==='open'?'bg-accent':''}`}>{r.status}</Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{r.reason}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">target: <code>{r.target_id.slice(0,8)}</code></p>
                  </div>
                  {r.status === "open" && (
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" className="h-7" onClick={() => resolveReport(r.id, "resolved")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7" onClick={() => resolveReport(r.id, "dismissed")}><XCircle className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="audit" className="space-y-1.5">
            {audit.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No audit entries.</p>}
            {audit.map(a => (
              <Card key={a.id} className="p-2.5">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{a.action}</Badge>
                    <span className="truncate text-muted-foreground">{JSON.stringify(a.meta)}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="content">
            <Card className="p-6 text-center text-sm text-muted-foreground">
              Content moderation surfaces flagged messages and posts here. Use the Reports tab to act on user-submitted flags.
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
