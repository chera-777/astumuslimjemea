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
import { NatureHeader, NatureLeaves, SocialRow } from "@/components/auth/NatureShell";
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

  const handleGoogleSignIn = () => handleOAuth("google");
  const handleOAuth = async (provider: "google" | "apple" | "facebook") => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
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
              <Button onClick={goNext} disabled={!fullName || !email || !gender} className="w-full nature-btn border-0 font-body">
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
              <Button onClick={goNext} disabled={!university} className="flex-1 nature-btn border-0 font-body">
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
                <Button onClick={goNext} disabled={!selectedSector} className="flex-1 nature-btn border-0 font-body">
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
          className="flex-1 nature-btn border-0 font-body"
        >
          {loading ? "Creating..." : <>Finish <CheckCircle2 className="ml-2 h-4 w-4" /></>}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="nature-surface sm:max-w-md p-0 overflow-hidden border-0 rounded-3xl">
        <NatureLeaves />
        <div className="relative z-10 px-6 pt-8 pb-16 max-h-[85vh] overflow-y-auto scrollbar-hide">
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

              <SocialRow onProvider={handleOAuth} disabled={loading} />
            </>
          )}

          {mode === "signin" && (
            <div className="space-y-4">
              <div className="mb-6"><NatureHeader title="Welcome" subtitle="Sign in to your account" /></div>

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

              <button onClick={() => switchMode("forgot")} className="block ml-auto text-xs nature-link hover:underline">
                Forgot Password?
              </button>

              <Button onClick={handleSignIn} disabled={loading} className="w-full nature-btn border-0">
                {loading ? "Signing in..." : "Login"}
              </Button>

              <SocialRow onProvider={handleOAuth} disabled={loading} />

              <p className="text-center text-xs text-muted-foreground font-body">
                Don't have an account?{" "}
                <button onClick={() => switchMode("register")} className="nature-link hover:underline">Sign up</button>
              </p>
            </div>
          )}

          {mode === "forgot" && (
            <div className="space-y-4">
              <div className="mb-6"><NatureHeader title="Reset Password" subtitle="Enter your email to receive a reset link" /></div>
              <div>
                <Label className="font-body text-sm">Email</Label>
                <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="your@email.com" className="mt-1" />
              </div>
              <Button onClick={handleForgotPassword} disabled={loading} className="w-full nature-btn border-0">
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
