import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { NaturePageHeader } from "@/components/layout/NaturePageHeader";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Clock, CheckCircle2, Send, Inbox } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getService } from "@/lib/services";
import { toast } from "sonner";
import NotFound from "@/pages/NotFound";

type RequestRow = {
  id: string; kind: string; subject: string; details: string; status: string;
  is_anonymous: boolean; staff_note: string | null; created_at: string;
};

const statusStyle: Record<string, string> = {
  open: "bg-blue/10 text-blue border-0",
  in_progress: "bg-accent/10 text-accent border-0",
  resolved: "bg-primary/10 text-primary border-0",
  closed: "bg-muted text-muted-foreground border-0",
};
const statusLabel = (s: string) => s.replace("_", " ");

const ServiceDetail = () => {
  const { slug } = useParams();
  const service = getService(slug);
  const { user, profile } = useAuth();
  const [kind, setKind] = useState("");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const canRequest = Boolean(service?.requestKinds?.length);

  const loadRequests = async () => {
    if (!user || !service || !canRequest) { setLoadingRequests(false); return; }
    setLoadingRequests(true);
    const { data } = await supabase
      .from("service_requests")
      .select("id, kind, subject, details, status, is_anonymous, staff_note, created_at")
      .eq("service", service.slug)
      .order("created_at", { ascending: false })
      .limit(20);
    setRequests((data as RequestRow[]) ?? []);
    setLoadingRequests(false);
  };
  useEffect(() => { void loadRequests(); }, [user?.id, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!service) return <NotFound />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !profile || !kind) return;
    setSending(true); setError("");
    try {
      const { error } = await supabase.from("service_requests").insert({
        user_id: user.id,
        university_id: profile.university_id,
        service: service.slug,
        kind,
        subject: subject.trim(),
        details: details.trim(),
        location: location.trim() || null,
        is_anonymous: anonymous,
      });
      if (error) throw error;
      toast.success("Request submitted — the team will follow up.");
      setSubject(""); setDetails(""); setLocation(""); setAnonymous(false);
      await loadRequests();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not submit your request."); }
    finally { setSending(false); }
  };

  return (
    <AppLayout>
      <SEO title={`${service.title} — ASTU Muslim Jemea`} description={service.desc} path={`/services/${service.slug}`} />
      <NaturePageHeader title={service.title} subtitle={service.desc} icon={service.icon} />
      <div className="space-y-6">
        <Card className="border-border/60 bg-card">
          <CardContent className="p-5">
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{service.about}</p>
          </CardContent>
        </Card>

        {service.links.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.links.map(link => (
              <Button key={link.to} asChild variant="outline" className="h-auto justify-between p-4 whitespace-normal text-left bg-card border-border/60 hover:border-primary/40">
                <Link to={link.to}>
                  <span>
                    <span className="block font-display text-sm font-bold">{link.label}</span>
                    <span className="block font-body text-xs text-muted-foreground mt-0.5">{link.hint}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-3" />
                </Link>
              </Button>
            ))}
          </div>
        )}

        {canRequest && (
          <Card className="border-border/60 bg-card">
            <CardContent className="p-5 space-y-4">
              <h2 className="font-display text-lg font-bold">Submit a request</h2>
              <form onSubmit={submit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="sr-kind">Request type</Label>
                  <Select value={kind} onValueChange={setKind}>
                    <SelectTrigger id="sr-kind"><SelectValue placeholder="Choose what you need" /></SelectTrigger>
                    <SelectContent>
                      {service.requestKinds!.map(k => <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sr-subject">Subject</Label>
                  <Input id="sr-subject" value={subject} onChange={e => setSubject(e.target.value)} maxLength={140} required
                    placeholder={service.requestKinds!.find(k => k.value === kind)?.placeholder ?? "Short summary of your request"} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sr-details">Details</Label>
                  <Textarea id="sr-details" value={details} onChange={e => setDetails(e.target.value)} maxLength={2000} required
                    placeholder="Add anything that helps the team act quickly: dates, places, people involved…" rows={4} />
                </div>
                {service.extraFields?.map(f => (
                  <div key={f.key} className="space-y-1">
                    <Label htmlFor={`sr-${f.key}`}>{f.label}</Label>
                    <Input id={`sr-${f.key}`} value={location} onChange={e => setLocation(e.target.value)} maxLength={140} placeholder={f.placeholder} />
                  </div>
                ))}
                {service.anonymous && (
                  <label className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                    <span>
                      <span className="block font-body text-sm font-medium">Submit anonymously</span>
                      <span className="block font-body text-xs text-muted-foreground">Staff see your request without your name.</span>
                    </span>
                    <Switch checked={anonymous} onCheckedChange={setAnonymous} aria-label="Submit anonymously" />
                  </label>
                )}
                {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
                <Button type="submit" className="w-full sm:w-auto" disabled={sending || !kind}>
                  <Send className="h-4 w-4 mr-2" />{sending ? "Sending…" : "Send request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {canRequest && (
          <div className="space-y-3">
            <h2 className="font-display text-lg font-bold">My requests</h2>
            {loadingRequests ? (
              <p className="font-body text-sm text-muted-foreground">Loading your requests…</p>
            ) : requests.length === 0 ? (
              <Card className="border-border/60 bg-card">
                <CardContent className="p-6 text-center">
                  <Inbox className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" aria-hidden="true" />
                  <p className="font-body text-sm text-muted-foreground">No requests yet. Submit one above and track it here.</p>
                </CardContent>
              </Card>
            ) : requests.map(r => (
              <Card key={r.id} className="border-border/60 bg-card">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-body text-sm font-semibold break-words">{r.subject}</p>
                      <p className="font-body text-xs text-muted-foreground break-words mt-0.5">{r.details}</p>
                    </div>
                    <Badge className={`font-body text-[10px] shrink-0 ${statusStyle[r.status] ?? statusStyle.open}`}>{statusLabel(r.status)}</Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-[10px] font-body text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(r.created_at).toLocaleDateString()}</span>
                    <span className="capitalize">{r.kind.replace("_", " ")}</span>
                    {r.is_anonymous && <span>Anonymous</span>}
                  </div>
                  {r.staff_note && (
                    <p className="font-body text-xs bg-secondary/60 rounded-lg p-2.5 break-words">
                      <CheckCircle2 className="h-3.5 w-3.5 inline mr-1 text-primary" />{r.staff_note}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ServiceDetail;
