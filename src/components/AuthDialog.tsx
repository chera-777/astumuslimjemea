import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowRight, ArrowLeft, Mail, Phone, User, GraduationCap,
  CheckCircle2, Sparkles, Lock, Eye, EyeOff, Shield, Users
} from "lucide-react";

type AuthMode = "register" | "signin" | "forgot";
type RegistrationRole = "student" | "amir" | "committee" | "guest";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: AuthMode;
  showAdminOption?: boolean;
}

const universities = [
  { id: "ASTU", name: "ASTU", city: "Adama" },
  { id: "AAU", name: "AAU", city: "Addis Ababa" },
  { id: "JU", name: "JU", city: "Jimma" },
  { id: "BDU", name: "BDU", city: "Bahir Dar" },
  { id: "HU", name: "HU", city: "Haramaya" },
  { id: "MU", name: "MU", city: "Mekelle" },
];

const amirSectors = [
  { id: "main", label: "Main Sector", icon: "⭐" },
  { id: "qiraat", label: "Qira'at Sector", icon: "📖" },
  { id: "academic", label: "Academic Sector", icon: "🎓" },
  { id: "financial", label: "Financial Sector", icon: "💰" },
  { id: "social", label: "Social Sector", icon: "🤝" },
];

export function AuthDialog({ open, onOpenChange, defaultMode = "register", showAdminOption = false }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [direction, setDirection] = useState(1);

  // Register fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [university, setUniversity] = useState("");
  const [isCafe, setIsCafe] = useState(false);
  const [registrationRole, setRegistrationRole] = useState<RegistrationRole>("student");
  const [selectedSector, setSelectedSector] = useState("");

  // Sign-in fields
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

  useEffect(() => { setMode(defaultMode); }, [defaultMode]);

  const totalSteps = registrationRole === "amir" ? 4 : 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const resetForm = () => {
    setStep(0);
    setFullName(""); setEmail(""); setPhone(""); setPassword("");
    setGender(""); setUniversity(""); setIsCafe(false);
    setRegistrationRole("student"); setSelectedSector("");
    setSignInEmail(""); setSignInPassword(""); setForgotEmail("");
  };

  const switchMode = (newMode: AuthMode) => { setMode(newMode); resetForm(); };
  const goNext = () => { setDirection(1); setStep(s => Math.min(s + 1, totalSteps - 1)); };
  const goBack = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !gender || !university) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const { data: uniData } = await supabase
        .from("universities")
        .select("id")
        .eq("short_name", university)
        .maybeSingle();

      if (!uniData) {
        toast.error("University not found. Please contact support.");
        setLoading(false);
        return;
      }

      // For amir role, check if sector is already taken this year
      if (registrationRole === "amir" && selectedSector) {
        const currentYear = new Date().getFullYear();
        const { data: existingAmir } = await supabase
          .from("user_roles")
          .select("id")
          .eq("role", "amir")
          .eq("sector", selectedSector)
          .eq("university_id", uniData.id);

        if (existingAmir && existingAmir.length > 0) {
          toast.error(`The ${selectedSector} sector already has an Amir registered for ${currentYear}. Only one Amir per sector per year is allowed.`);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + "/dashboard",
          data: {
            full_name: fullName,
            phone,
            gender,
            university_id: uniData.id,
            is_cafe_student: isCafe,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          phone: phone || null,
          gender,
          university_id: uniData.id,
          is_cafe_student: isCafe,
        });

        // Role assignment is handled server-side by the handle_new_user trigger,
        // which always assigns the baseline 'student' role. Elevated roles
        // (amir/committee/admin) must be granted by an existing admin via a
        // dedicated admin workflow — never self-assigned during registration.

        toast.success("🎉 Registration successful! Check your email to verify.");
        onOpenChange(false);
        resetForm();
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    }
    setLoading(false);
  };

  const handleSignIn = async () => {
    if (!signInEmail || !signInPassword) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: signInEmail,
      password: signInPassword,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back! ✨");
      onOpenChange(false);
      resetForm();
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error("Please enter your email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) toast.error(error.message);
    else { toast.success("Password reset link sent!"); switchMode("signin"); }
    setLoading(false);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0 }),
  };

  const renderStepIndicator = () => (
    <div className="space-y-2 mb-5">
      <div className="flex items-center justify-between text-xs font-body text-muted-foreground">
        <span>Step {step + 1} of {totalSteps}</span>
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-gold" />
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );

  const renderRegisterStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <h3 className="font-display text-xl font-bold text-foreground">Create Your Account</h3>
              <p className="text-muted-foreground font-body text-xs mt-1">Step 1: Your identity</p>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="font-body text-sm">Full Name *</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmed Mohammed" className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Email Address *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="mt-1" />
              </div>
              <div>
                <Label className="font-body text-sm">Gender *</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[{ val: "male", label: "👤 Male", color: "border-blue" }, { val: "female", label: "❤️ Female", color: "border-pink" }].map(g => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setGender(g.val)}
                      className={`p-3 rounded-xl border-2 text-sm font-body font-semibold transition-all ${
                        gender === g.val
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-2">
              <Button onClick={goNext} disabled={!fullName || !email || !gender} className="w-full gradient-teal text-white border-0 h-11 rounded-xl font-body">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground font-body">
              Already have an account?{" "}
              <button onClick={() => switchMode("signin")} className="text-primary font-semibold hover:underline">Login</button>
            </p>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-3">
              <h3 className="font-display text-xl font-bold text-foreground">Step 2 of {totalSteps}: Personal Details</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="font-body text-sm">Country</Label>
                <Input value="Ethiopia" disabled className="mt-1 bg-secondary" />
              </div>
              <div>
                <Label className="font-body text-sm">University *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {universities.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUniversity(u.id)}
                      className={`p-2.5 rounded-xl border-2 text-xs font-body font-semibold transition-all text-left ${
                        university === u.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="block font-bold">{u.name}</span>
                      <span className="text-[10px] opacity-70">{u.city}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                <Checkbox id="cafe" checked={isCafe} onCheckedChange={(v) => setIsCafe(!!v)} />
                <Label htmlFor="cafe" className="font-body text-xs cursor-pointer">
                  I'm a Café student (meal card eligible)
                </Label>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={goBack} className="flex-1 h-11 rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={goNext} disabled={!university} className="flex-1 gradient-blue text-white border-0 h-11 rounded-xl font-body">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 2:
        // If amir role, this is sector selection step
        if (registrationRole === "amir") {
          return (
            <div className="space-y-4">
              <div className="text-center mb-3">
                <h3 className="font-display text-xl font-bold text-foreground">Select Your Sector</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">Only 1 Amir per sector per year</p>
              </div>
              <div className="space-y-2">
                {amirSectors.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSector(s.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all font-body ${
                      selectedSector === s.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-sm font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="flex-1 h-11 rounded-xl">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={goNext} disabled={!selectedSector} className="flex-1 gradient-teal text-white border-0 h-11 rounded-xl font-body">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        }

        // Otherwise: account creation (final step for non-amir)
        return renderAccountStep();

      case 3:
        // Final step for amir
        return renderAccountStep();
    }
  };

  const renderAccountStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-3">
        <h3 className="font-display text-xl font-bold text-foreground">Create Your Account</h3>
        <p className="text-muted-foreground font-body text-xs mt-1">Almost there!</p>
      </div>
      <div className="space-y-3">
        <div>
          <Label className="font-body text-sm flex items-center gap-1"><Phone className="h-3 w-3" /> Phone (optional)</Label>
          <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+251 9XX XXX XXX" className="mt-1" />
        </div>
        <div>
          <Label className="font-body text-sm flex items-center gap-1"><Lock className="h-3 w-3" /> Password *</Label>
          <div className="relative mt-1">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Role selection (only if admin option is visible) */}
      {showAdminOption && (
        <div>
          <Label className="font-body text-sm mb-2 block">Register as</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: "student" as RegistrationRole, label: "Student", icon: GraduationCap },
              { val: "amir" as RegistrationRole, label: "Amir", icon: Shield },
              { val: "committee" as RegistrationRole, label: "Committee", icon: Users },
            ].map(r => (
              <button
                key={r.val}
                type="button"
                onClick={() => setRegistrationRole(r.val)}
                className={`p-2.5 rounded-xl border-2 text-xs font-body font-semibold transition-all flex items-center gap-2 ${
                  registrationRole === r.val
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40"
                }`}
              >
                <r.icon className="h-4 w-4" />
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={goBack} className="flex-1 h-11 rounded-xl">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={handleRegister}
          disabled={!password || loading}
          className="flex-1 gradient-pink text-white border-0 h-11 rounded-xl font-body"
        >
          {loading ? "Creating..." : <>Finish <CheckCircle2 className="ml-2 h-4 w-4" /></>}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 rounded-2xl">
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, hsl(168,65%,35%), hsl(340,75%,55%), hsl(215,80%,55%))" }} />

        <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
          <DialogTitle className="sr-only">
            {mode === "register" ? "Register" : mode === "signin" ? "Sign In" : "Reset Password"}
          </DialogTitle>

          {mode === "register" && (
            <>
              {renderStepIndicator()}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                >
                  {renderRegisterStep()}
                </motion.div>
              </AnimatePresence>

              <div className="mt-4 pt-3 border-t border-border">
                <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full h-10 rounded-xl">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </Button>
              </div>
            </>
          )}

          {mode === "signin" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-2xl gradient-teal flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">Welcome Back</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">Sign in to your account</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="font-body text-sm">Email</Label>
                  <Input type="email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} placeholder="your@email.com" className="mt-1" />
                </div>
                <div>
                  <Label className="font-body text-sm">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={signInPassword}
                      onChange={e => setSignInPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button onClick={() => switchMode("forgot")} className="text-xs text-primary font-body font-semibold hover:underline">
                Forgot password?
              </button>

              <Button onClick={handleSignIn} disabled={loading} className="w-full gradient-teal text-white border-0 h-11 rounded-xl">
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full h-10 rounded-xl">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </Button>

              <p className="text-center text-xs text-muted-foreground font-body">
                Don't have an account?{" "}
                <button onClick={() => switchMode("register")} className="text-primary font-semibold hover:underline">Register</button>
              </p>
            </div>
          )}

          {mode === "forgot" && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-display text-xl font-bold text-foreground">Reset Password</h3>
                <p className="text-muted-foreground font-body text-xs mt-1">Enter your email to receive a reset link</p>
              </div>
              <div>
                <Label className="font-body text-sm">Email</Label>
                <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" className="mt-1" />
              </div>
              <Button onClick={handleForgotPassword} disabled={loading} className="w-full gradient-teal text-white border-0 h-11 rounded-xl">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <button onClick={() => switchMode("signin")} className="text-xs text-primary font-body font-semibold hover:underline block mx-auto">
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
