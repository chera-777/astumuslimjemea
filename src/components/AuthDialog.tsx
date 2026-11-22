import { useState, useEffect, type FormEvent } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NatureHeader, NatureLeaves, SocialRow } from "@/components/auth/NatureShell";
import { ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type UniversityRow = { id: string; short_name: string; city: string };
let cachedUniversities: UniversityRow[] | null = null;
let universitiesInFlight: Promise<UniversityRow[]> | null = null;

function formatAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Please try again.";
  const lower = msg.toLowerCase();
  if (
    lower.includes("rate limit") ||
    lower.includes("too many requests") ||
    lower.includes("429") ||
    lower.includes("security purposes") ||
    lower.includes("over_email_send_rate_limit")
  ) {
    return "Too many verification or sign-in attempts right now. Please wait a minute before trying again.";
  }
  return msg;
}

type AuthMode = "register" | "signin" | "forgot";
interface AuthDialogProps { open: boolean; onOpenChange: (open: boolean) => void; defaultMode?: AuthMode; }

export function AuthDialog({ open, onOpenChange, defaultMode = "register" }: AuthDialogProps) {
  const { oauthError, clearOAuthError } = useAuth();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [university, setUniversity] = useState("");
  const [universities, setUniversities] = useState<UniversityRow[]>(() => cachedUniversities ?? []);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const reset = () => { setStep(0); setFullName(""); setEmail(""); setPhone(""); setPassword(""); setGender(""); setUniversity(""); setError(""); setSent(false); setShowPassword(false); };
  useEffect(() => { if (open) { setMode(defaultMode); reset(); } }, [open, defaultMode]);
  useEffect(() => {
    if (!open || mode !== "register") return;
    if (!isSupabaseConfigured) {
      setUniversities([]);
      return;
    }
    if (cachedUniversities) {
      setUniversities(cachedUniversities);
      return;
    }
    let active = true;
    if (!universitiesInFlight) {
      universitiesInFlight = Promise.resolve(
        supabase
          .from("universities")
          .select("id,short_name,city")
          .order("short_name")
          .then(({ data, error }) => {
            if (error) throw error;
            cachedUniversities = data ?? [];
            return cachedUniversities;
          })
      ).finally(() => {
        universitiesInFlight = null;
      });
    }
    universitiesInFlight
      .then((rows) => {
        if (active) setUniversities(rows);
      })
      .catch(() => {
        if (active) setError("Could not load universities. Close this form and try again.");
      });
    return () => { active = false; };
  }, [open, mode]);
  const switchMode = (value: AuthMode) => { clearOAuthError(); reset(); setMode(value); };
  const handleOAuth = async () => {
    clearOAuthError();
    if (!isSupabaseConfigured) {
      setError("Supabase authentication is not configured in this environment.");
      return;
    }
    setLoading(true); setError("");
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Could not start Google authentication flow.");
      window.location.assign(data.url);
    } catch (err) {
      setError(formatAuthError(err));
      setLoading(false);
    }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(""); clearOAuthError();
    if (mode === "register" && step < 2) { setStep(value => value + 1); return; }
    if (!isSupabaseConfigured) {
      setError("Supabase authentication is not configured in this environment.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "register") {
        if (!fullName.trim() || !gender || !university || !email.trim()) throw new Error("Complete your identity and university details.");
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin, data: { full_name: fullName.trim(), phone: phone.trim(), gender, university_id: university } } });
        if (error) throw error;
        if (data.session) { toast.success("Account created"); onOpenChange(false); }
        else setSent(true);
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Welcome back!"); onOpenChange(false);
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent(true);
      }
    } catch (err) { setError(formatAuthError(err)); }
    finally { setLoading(false); }
  };
  const visibleError = error || oauthError;
  const emailField = <div className="space-y-1"><Label htmlFor="student-email">Email</Label><Input id="student-email" type="email" autoComplete={mode === "signin" ? "username" : "email"} required value={email} onChange={event => setEmail(event.target.value)} disabled={loading} /></div>;
  const passwordField = <div className="space-y-1"><Label htmlFor="student-password">Password</Label><div className="relative"><Input id="student-password" type={showPassword ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 6 : undefined} required value={password} onChange={event => setPassword(event.target.value)} disabled={loading} className="pr-11" /><Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-10 w-10" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></div></div>;
  const title = mode === "signin" ? "Welcome" : mode === "forgot" ? "Reset Password" : "Create Account";
  const subtitle = mode === "register" ? `${["Your identity", "Your university", "Your account"][step]} · ${step + 1} of 3` : mode === "signin" ? "Sign in to your account" : "Receive a password reset link";
  const showGoogleButton = mode === "signin" || (mode === "register" && (step === 0 || step === 2));
  return <Dialog open={open} onOpenChange={value => { if (!loading) { if (!value) clearOAuthError(); onOpenChange(value); } }}><DialogContent className="nature-surface auth-popover p-0 overflow-hidden border-0">
    <NatureLeaves />
    <div className="auth-popover-body relative z-10">
      <div className="auth-heading"><DialogTitle className="sr-only">{title}</DialogTitle><DialogDescription className="sr-only">{subtitle}</DialogDescription><NatureHeader title={title} subtitle={subtitle} /></div>
      <form onSubmit={submit} className="auth-form space-y-3" aria-label="Student authentication">
        {sent ? <div className="space-y-4 text-center"><CheckCircle2 className="h-9 w-9 text-primary mx-auto" /><p role="status" className="text-sm">{mode === "register" ? "Check your email to confirm your account before signing in." : "Check your email for a password reset link."}</p><Button type="button" variant="outline" className="w-full" onClick={() => switchMode("signin")}>Back to sign-in</Button></div> : <>
          <div className="auth-fields space-y-3">
            {mode === "register" && step === 0 && <><div className="space-y-1"><Label htmlFor="student-name">Full name</Label><Input id="student-name" autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} maxLength={120} required /></div>{emailField}</>}
            {mode === "register" && step === 1 && <><div className="space-y-1"><Label htmlFor="student-gender">Gender</Label><Select value={gender} onValueChange={setGender}><SelectTrigger id="student-gender"><SelectValue placeholder="Choose gender" /></SelectTrigger><SelectContent><SelectItem value="male">Brother</SelectItem><SelectItem value="female">Sister</SelectItem></SelectContent></Select></div><div className="space-y-1"><Label htmlFor="student-university">University</Label><Select value={university} onValueChange={setUniversity}><SelectTrigger id="student-university"><SelectValue placeholder="Choose university" /></SelectTrigger><SelectContent>{universities.map(item => <SelectItem key={item.id} value={item.id}>{item.short_name} · {item.city}</SelectItem>)}</SelectContent></Select></div></>}
            {mode === "register" && step === 2 && <><div className="space-y-1"><Label htmlFor="student-phone">Phone (optional)</Label><Input id="student-phone" type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} disabled={loading} /></div>{passwordField}</>}
            {mode !== "register" && emailField}
            {mode === "signin" && passwordField}
          </div>
          {visibleError && <p role="alert" className="text-xs text-destructive break-words">{visibleError}</p>}
          {mode === "signin" && <Button type="button" variant="link" className="auth-link h-8 p-0 ml-auto block text-xs" onClick={() => switchMode("forgot")}>Forgot password?</Button>}
          <div className="auth-actions flex gap-2">
            {mode === "register" && step > 0 && <Button type="button" variant="outline" disabled={loading} className="h-12" onClick={() => { setStep(value => value - 1); setError(""); }}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>}
            <Button type="submit" disabled={loading || (mode === "register" && step === 1 && (!gender || !university))} className="nature-btn border-0 flex-1">{loading ? "Please wait…" : mode === "register" ? step < 2 ? <>Next<ArrowRight className="h-4 w-4 ml-2" /></> : "Create account" : mode === "signin" ? "Log in" : "Send reset link"}</Button>
          </div>
          {showGoogleButton && <SocialRow onProvider={handleOAuth} disabled={loading} label={mode === "register" ? "Sign up with Google" : "Continue with Google"} />}
          <div className="auth-footer text-center text-xs text-muted-foreground">{mode === "register" ? <>Already have an account? <Button type="button" variant="link" className="h-8 p-0 text-xs" onClick={() => switchMode("signin")}>Log in</Button></> : mode === "signin" ? <>Don't have an account? <Button type="button" variant="link" className="h-8 p-0 text-xs" onClick={() => switchMode("register")}>Sign up</Button></> : <Button type="button" variant="link" className="h-8 p-0 text-xs" onClick={() => switchMode("signin")}>Back to sign-in</Button>}</div>
        </>}
      </form>
    </div>
  </DialogContent></Dialog>;
}
