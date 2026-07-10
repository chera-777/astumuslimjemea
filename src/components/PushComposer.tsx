import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Bell } from "lucide-react";

export function PushComposer() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [audience, setAudience] = useState<"all" | "users">("all");
  const [externalIds, setExternalIds] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    const payload: Record<string, unknown> = { title, message };
    if (url.trim()) payload.url = url.trim();
    if (audience === "all") {
      payload.included_segments = ["Subscribed Users"];
    } else {
      const ids = externalIds.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        toast.error("Add at least one user id");
        setSending(false);
        return;
      }
      payload.external_user_ids = ids;
    }
    const { data, error } = await supabase.functions.invoke("send-push", { body: payload });
    setSending(false);
    if (error) {
      toast.error(error.message || "Failed to send");
      return;
    }
    toast.success("Push notification sent");
    console.log("send-push result", data);
    setTitle(""); setMessage(""); setUrl(""); setExternalIds("");
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm">Compose push notification</h3>
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-title" className="text-xs">Title</Label>
        <Input id="p-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={200} placeholder="Jumu'ah reminder" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-msg" className="text-xs">Message</Label>
        <Textarea id="p-msg" value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={3} placeholder="Join us at the masjid at 1:00 PM" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="p-url" className="text-xs">Open URL (optional)</Label>
        <Input id="p-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…/events/abc" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Audience</Label>
        <div className="flex gap-2">
          <Button size="sm" variant={audience === "all" ? "default" : "outline"} onClick={() => setAudience("all")}>All subscribers</Button>
          <Button size="sm" variant={audience === "users" ? "default" : "outline"} onClick={() => setAudience("users")}>Specific users</Button>
        </div>
        {audience === "users" && (
          <Textarea value={externalIds} onChange={e => setExternalIds(e.target.value)} rows={2} placeholder="Comma or space separated auth user ids" />
        )}
      </div>
      <Button onClick={send} disabled={sending} className="w-full">
        <Send className="h-4 w-4 mr-2" />{sending ? "Sending…" : "Send push"}
      </Button>
      <p className="text-[10px] text-muted-foreground">
        Requires VITE_ONESIGNAL_APP_ID in .env and ONESIGNAL_APP_ID / ONESIGNAL_REST_API_KEY edge function secrets.
      </p>
    </Card>
  );
}
