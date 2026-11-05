import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { profileDraft, profileUpdate } from "@/lib/profileDetails";
import { toast } from "sonner";
import { ASTU_DEPARTMENTS, CLASS_YEARS } from "@/lib/astuDepartments";

const steps = ["Personal details", "Academic details", "Photo & documents"];
export function ProfileDetailsEditor({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [draft, setDraft] = useState(() => profileDraft(profile ?? {}));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setDraft(profileDraft(profile ?? {})); setStep(0); setError(""); } }, [open, profile]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !profile) return;
    setSaving(true); setError("");
    try {
      const update = profileUpdate(draft);
      const { data, error } = await supabase.from("profiles").update(update).eq("id", user.id).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("Your changes were not saved. Please try again.");
      await refreshProfile();
      toast.success("Profile saved"); onOpenChange(false);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save your profile."); }
    finally { setSaving(false); }
  };
  const field = (key: keyof typeof draft, label: string, type = "text") => <div className="space-y-1"><Label htmlFor={`profile-${key}`}>{label}</Label><Input id={`profile-${key}`} type={type} value={draft[key]} onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} disabled={saving} maxLength={key.endsWith("url") ? 2048 : 120} /></div>;
  const pick = (key: "department" | "batch_year", label: string, options: string[]) => {
    const opts = draft[key] && !options.includes(draft[key]) ? [draft[key], ...options] : options;
    return <div className="space-y-1"><Label htmlFor={`profile-${key}`}>{label}</Label><Select value={draft[key] || undefined} onValueChange={v => setDraft(value => ({ ...value, [key]: v }))} disabled={saving}><SelectTrigger id={`profile-${key}`}><SelectValue placeholder={`Choose ${label.toLowerCase()}`} /></SelectTrigger><SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></div>;
  };
  return <Dialog open={open} onOpenChange={value => { if (!saving) onOpenChange(value); }}><DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg">
    <div><DialogTitle>Edit profile</DialogTitle><DialogDescription className="mt-1">{steps[step]} · {step + 1} of {steps.length}</DialogDescription></div>
    <form onSubmit={save} className="space-y-4">
      {step === 0 && <div className="space-y-3">{field("full_name", "Full name")}{field("phone", "Phone", "tel")}<div className="space-y-1"><Label htmlFor="profile-gender">Gender</Label><Select value={draft.gender} onValueChange={gender => setDraft(value => ({ ...value, gender }))} disabled={saving}><SelectTrigger id="profile-gender"><SelectValue placeholder="Choose gender" /></SelectTrigger><SelectContent><SelectItem value="male">Brother</SelectItem><SelectItem value="female">Sister</SelectItem></SelectContent></Select></div></div>}
      {step === 1 && <div className="space-y-3">{field("student_id", "Student ID")}{pick("department", "Department", ASTU_DEPARTMENTS)}{pick("batch_year", "Class year", CLASS_YEARS)}<p className="text-xs text-muted-foreground">Your department and class year decide which groups you see.</p></div>}
      {step === 2 && <div className="space-y-3">{field("profile_photo_url", "Profile photo link", "url")}{field("id_card_url", "Student ID card link", "url")}</div>}
      {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <Button type="button" variant="outline" size="icon" aria-label="Previous profile section" disabled={step === 0 || saving} onClick={() => setStep(value => value - 1)}><ArrowLeft className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="icon" aria-label="Next profile section" disabled={step === 2 || saving} onClick={() => setStep(value => value + 1)}><ArrowRight className="h-4 w-4" /></Button>
        <Button type="submit" className="ml-auto" disabled={saving}><Save className="h-4 w-4 mr-2" />{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  </DialogContent></Dialog>;
}