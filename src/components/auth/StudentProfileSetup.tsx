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
  const open = Boolean(user && !profile && !loading);

  useEffect(() => {
    if (!open) return;
    setFullName(user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "");
    supabase.from("universities").select("*").order("name").then(({ data, error }) => {
      if (error) setError("Could not load universities. Please try again.");
      else setUniversities(data ?? []);
    });
  }, [open, user?.id]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !fullName.trim() || !gender || !university) return;
    setSaving(true); setError("");
    // No roles, verification flags, café entitlement, or OAuth photo are copied from metadata.
    const { error } = await supabase.from("profiles").insert({
      id: user.id, full_name: fullName.trim(), gender, university_id: university,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    await refreshProfile();
    setSaving(false);
  };
  return <Dialog open={open}><DialogContent className="nature-surface max-w-md max-h-[90dvh] overflow-y-auto" onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()}>
    <NatureLeaves /><div className="relative z-10 space-y-5"><NatureLogo className="h-12 w-12" />
      <DialogHeader><DialogTitle className="font-display text-2xl text-center">Your student profile</DialogTitle><DialogDescription className="text-center">University and identity</DialogDescription></DialogHeader>
      <form onSubmit={save} className="space-y-4">
        <div className="space-y-2"><Label htmlFor="setup-name">Full name</Label><Input id="setup-name" value={fullName} onChange={e => setFullName(e.target.value)} required maxLength={120} /></div>
        <div className="space-y-2"><Label>Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger aria-label="Your gender"><SelectValue placeholder="Choose gender" /></SelectTrigger><SelectContent><SelectItem value="male">Brother</SelectItem><SelectItem value="female">Sister</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>University</Label><Select value={university} onValueChange={setUniversity}><SelectTrigger aria-label="Your university"><SelectValue placeholder="Choose university" /></SelectTrigger><SelectContent>{universities.map(u => <SelectItem key={u.id} value={u.id}>{u.short_name} · {u.city}</SelectItem>)}</SelectContent></Select></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={saving || !fullName.trim() || !gender || !university} className="w-full nature-btn">{saving ? "Saving…" : "Save profile"}</Button>
        <Button type="button" variant="ghost" className="w-full" onClick={() => void signOut()}>Sign out</Button>
      </form>
    </div>
  </DialogContent></Dialog>;
}