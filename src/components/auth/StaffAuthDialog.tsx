import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, EyeOff, ShieldCheck, Users } from "lucide-react";
import { NatureHeader, NatureLeaves } from "@/components/auth/NatureShell";
import { supabase } from "@/integrations/supabase/client";
import { canSignInToPortal, portalHome, type StaffPortal } from "@/lib/portalAccess";

// Staff forms have independent state and never expose public registration or role assignment.
function StaffCredentialsForm({ portal, onSignedIn, onBusyChange }: { portal: StaffPortal; onSignedIn: (path: string) => void; onBusyChange: (busy: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(false);
  const [sent, setSent] = useState(false);
  const label = portal === "admin" ? "Admin" : "Committee";

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); onBusyChange(true); setError(""); setSent(false);
    let authenticated = false;
    try {
      if (reset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent(true); return;
      }
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) throw result.error;
      authenticated = true;
      const { data: { user }, error: identityError } = await supabase.auth.getUser();
      if (identityError || !user) throw new Error("Could not verify your account. Please sign in again.");
      const { data, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (roleError) throw new Error("Could not verify portal access. Please try again.");
      const roles = data?.map(record => record.role) ?? [];
      if (!canSignInToPortal(roles, portal)) throw new Error(`This account does not have ${label} access.`);
      onSignedIn(portalHome(roles));
    } catch (error) {
      if (authenticated) await supabase.auth.signOut();
      setError(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    } finally { setBusy(false); onBusyChange(false); }
  };

  return <form onSubmit={submit} className="auth-form space-y-3" aria-label={`${label} authentication`}>
    <div className="auth-fields space-y-3">
      <div className="space-y-1"><Label htmlFor={`${portal}-email`}>Email</Label><Input id={`${portal}-email`} type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} disabled={busy} /></div>
      {!reset && <div className="space-y-1"><Label htmlFor={`${portal}-password`}>Password</Label><div className="relative"><Input id={`${portal}-password`} type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={busy} className="pr-11" /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></div>}
    </div>
    {error && <p role="alert" className="text-xs text-destructive break-words">{error}</p>}
    {sent && <p role="status" className="text-xs text-primary">Check your email for a password reset link.</p>}
    <Button type="submit" disabled={busy} className="nature-btn border-0">{busy ? "Please wait…" : reset ? "Send reset link" : `Sign in to ${label}`}</Button>
    <Button type="button" variant="link" disabled={busy} className="h-9 w-full text-xs" onClick={() => { setReset(value => !value); setError(""); setSent(false); }}>{reset ? `Back to ${label} sign-in` : "Forgot password?"}</Button>
  </form>;
}

export function AdminSignInForm(props: { onSignedIn: (path: string) => void; onBusyChange: (busy: boolean) => void }) {
  return <StaffCredentialsForm portal="admin" {...props} />;
}
export function CommitteeSignInForm(props: { onSignedIn: (path: string) => void; onBusyChange: (busy: boolean) => void }) {
  return <StaffCredentialsForm portal="committee" {...props} />;
}

export function StaffAuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [portal, setPortal] = useState<StaffPortal>("admin");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const signedIn = (path: string) => { onOpenChange(false); navigate(path, { replace: true }); };
  return <Dialog open={open} onOpenChange={value => { if (!busy) onOpenChange(value); }}>
    <DialogContent className="nature-surface auth-popover p-0 overflow-hidden border-0" onPointerDownOutside={event => { if (busy) event.preventDefault(); }} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }}>
      <NatureLeaves />
      <div className="auth-popover-body relative z-10">
        <div className="auth-heading"><DialogTitle className="sr-only">{portal === "admin" ? "Admin" : "Committee"} sign-in</DialogTitle><DialogDescription className="sr-only">Sign in with an account that has assigned portal access.</DialogDescription><NatureHeader title={portal === "admin" ? "Admin Sign-in" : "Committee Sign-in"} subtitle="Your management workspace" /></div>
        <Tabs value={portal} onValueChange={value => { if (!busy && (value === "admin" || value === "committee")) setPortal(value); }} className="auth-form space-y-3">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="admin" disabled={busy}><ShieldCheck className="h-4 w-4 mr-2" />Admin</TabsTrigger><TabsTrigger value="committee" disabled={busy}><Users className="h-4 w-4 mr-2" />Committee</TabsTrigger></TabsList>
          <TabsContent value="admin"><AdminSignInForm onSignedIn={signedIn} onBusyChange={setBusy} /></TabsContent>
          <TabsContent value="committee"><CommitteeSignInForm onSignedIn={signedIn} onBusyChange={setBusy} /></TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>;
}