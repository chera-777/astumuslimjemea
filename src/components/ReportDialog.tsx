import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Flag } from "lucide-react";

interface ReportDialogProps {
  targetType: "message" | "announcement" | "news" | "event" | "profile";
  targetId: string;
  trigger?: React.ReactNode;
}

export function ReportDialog({ targetType, targetId, trigger }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return toast.error("Sign in required");
    if (reason.trim().length < 3) return toast.error("Please describe the issue");
    setSubmitting(true);
    const { error } = await supabase.from("content_reports").insert({
      target_type: targetType,
      target_id: targetId,
      reason: reason.trim(),
      reporter_id: user.id,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Report submitted — thank you");
    setReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Report content">
            <Flag className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
        </DialogHeader>
        <Textarea placeholder="Why are you reporting this?" value={reason} onChange={e => setReason(e.target.value)} rows={4} maxLength={1000} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>Submit report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
