import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Inbox } from "lucide-react";
import { getService } from "@/lib/services";

type Row = {
  id: string; service: string; kind: string; subject: string; details: string;
  location: string | null; is_anonymous: boolean; status: string;
  staff_note: string | null; user_id: string; created_at: string;
};

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export function ServiceRequests() {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data, error }, { data: directory }] = await Promise.all([
      supabase.from("service_requests").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.rpc("admin_student_directory"),
    ]);
    if (error) toast.error(error.message);
    setRows((data as Row[]) ?? []);
    const map: Record<string, string> = {};
    (directory ?? []).forEach((s: { id: string; full_name: string }) => { map[s.id] = s.full_name; });
    setNames(map);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const update = async (row: Row, status: string) => {
    const { error } = await supabase
      .from("service_requests")
      .update({ status, staff_note: notes[row.id]?.trim() || row.staff_note })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Request updated");
    await load();
  };

  const services = ["all", ...Array.from(new Set(rows.map(r => r.service)))];
  const visible = rows.filter(r => filter === "all" || r.service === filter);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {services.map(s => (
          <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} className="h-7 text-[11px]" onClick={() => setFilter(s)}>
            {s === "all" ? "All services" : getService(s)?.title ?? s}
            {s !== "all" && <span className="ml-1 text-[10px] opacity-70">{rows.filter(r => r.service === s).length}</span>}
          </Button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Loading requests…</p>
      ) : visible.length === 0 ? (
        <div className="text-center py-8">
          <Inbox className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No service requests yet.</p>
        </div>
      ) : visible.map(r => (
        <Card key={r.id} className="p-3 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{getService(r.service)?.title ?? r.service}</Badge>
                <Badge variant="outline" className="text-[10px] capitalize">{r.kind.replace("_", " ")}</Badge>
                <Badge className={`text-[10px] ${r.status === "open" ? "bg-accent" : ""}`}>{r.status.replace("_", " ")}</Badge>
                {r.is_anonymous && <Badge variant="outline" className="text-[10px]">Anonymous</Badge>}
                <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm font-medium break-words">{r.subject}</p>
              <p className="text-xs text-muted-foreground break-words mt-0.5">{r.details}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {r.is_anonymous ? "anonymous student" : (names[r.user_id] ?? `student ${r.user_id.slice(0, 8)}`)}
                {r.location ? ` · ${r.location}` : ""}
              </p>
            </div>
            <div className="shrink-0 w-32">
              <Select value={r.status} onValueChange={status => void update(r, status)}>
                <SelectTrigger aria-label="Request status" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea
            value={notes[r.id] ?? r.staff_note ?? ""}
            onChange={e => setNotes(n => ({ ...n, [r.id]: e.target.value }))}
            placeholder="Reply note for the student (saved when you change the status)…"
            className="text-xs min-h-14"
            maxLength={500}
          />
        </Card>
      ))}
    </div>
  );
}
