import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NatureLogo, NatureLeaves } from "@/components/auth/NatureShell";
import type { Tables } from "@/integrations/supabase/types";

export function StudentProfileSetup() {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [universities, setUniversities] = useState<Tables<"universities">[]>([]);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [university, setUniversity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const open = Boolean(user && !profile && !loading);

  useEffect(() => {
    if (!open) return;
    setFullName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "");
    setStep(0); setError("");
    supabase.from("universities").select("*").order("name").then(({ data, error }) => {
      if (error) setError("Could not load universities. Please try again.");
      else setUniversities(data ?? []);
    });
  }, [open, user?.id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (step === 0) { if (fullName.trim()) setStep(1); return; }
    if (!user || !fullName.trim() || !gender || !university) return;
    setSaving(true); setError("");
    // No roles, verification flags, café entitlement, or OAuth photo are copied from metadata.
    const { error } = await supabase.from("profiles").insert({
      id: user.id, full_name: fullName.trim(), gender, university_id: university,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    try { await refreshProfile(); } catch (error) { setError(error instanceof Error ? error.message : "Could not refresh your profile."); }
    setSaving(false);
  };
  return <Dialog open={open}><DialogContent className="nature-surface auth-popover p-0 overflow-hidden" onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
    <NatureLeaves /><div className="auth-popover-body relative z-10"><div className="auth-heading"><NatureLogo className="h-12 w-12" />
      <DialogHeader><DialogTitle className="font-display text-2xl text-center">Your student profile</DialogTitle><DialogDescription className="text-center">{step === 0 ? "Your name · 1 of 2" : "University and identity · 2 of 2"}</DialogDescription></DialogHeader></div>
      <form onSubmit={save} className="auth-form space-y-3">
        <div className="auth-fields space-y-3">
        {step === 0 && <div className="space-y-1"><Label htmlFor="setup-name">Full name</Label><Input id="setup-name" value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={120} /></div>}
        {step === 1 && <><div className="space-y-1"><Label>Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger aria-label="Your gender"><SelectValue placeholder="Choose gender" /></SelectTrigger><SelectContent><SelectItem value="male">Brother</SelectItem><SelectItem value="female">Sister</SelectItem></SelectContent></Select></div>
        <div className="space-y-1"><Label>University</Label><Select value={university} onValueChange={setUniversity}><SelectTrigger aria-label="Your university"><SelectValue placeholder="Choose university" /></SelectTrigger><SelectContent>{universities.map(u => <SelectItem key={u.id} value={u.id}>{u.short_name} · {u.city}</SelectItem>)}</SelectContent></Select></div></>}
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">{step === 1 && <Button type="button" variant="outline" disabled={saving} onClick={() => setStep(0)}>Back</Button>}<Button type="submit" disabled={saving || !fullName.trim() || (step === 1 && (!gender || !university))} className="flex-1 nature-btn">{saving ? "Saving…" : step === 0 ? "Next" : "Save profile"}</Button></div>
        <Button type="button" variant="ghost" className="w-full" onClick={() => void signOut()}>Sign out</Button>
      </form>
    </div>
  </DialogContent></Dialog>;
}