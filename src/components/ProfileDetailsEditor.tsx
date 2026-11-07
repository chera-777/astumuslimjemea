import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Save, Upload, X, ShieldCheck, Loader2 } from "lucide-react";
import { profileDraft, profileUpdate } from "@/lib/profileDetails";
import { AVATAR_BUCKET, FILE_TYPE_MESSAGE, ID_BUCKET, buildProfilePath, isSupportedImage, useProfileFileUrl } from "@/lib/profileFiles";
import { toast } from "sonner";
import { ASTU_DEPARTMENTS, CLASS_YEARS } from "@/lib/astuDepartments";

const steps = ["Personal details", "Academic details", "Photo & ID card"];

type PendingFile = { file: File; preview: string } | null;

export function ProfileDetailsEditor({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [draft, setDraft] = useState(() => profileDraft(profile ?? {}));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<PendingFile>(null);
  const [idCard, setIdCard] = useState<PendingFile>(null);
  const currentPhotoUrl = useProfileFileUrl(draft.profile_photo_url, AVATAR_BUCKET);

  useEffect(() => {
    if (open) { setDraft(profileDraft(profile ?? {})); setStep(0); setError(""); setPhoto(null); setIdCard(null); }
  }, [open, profile]);

  const pickFile = (file: File | undefined, setter: (value: PendingFile) => void) => {
    if (!file) return;
    if (!isSupportedImage(file)) { setError(FILE_TYPE_MESSAGE); return; }
    setError("");
    setter({ file, preview: URL.createObjectURL(file) });
  };

  const upload = async (pending: PendingFile, bucket: string, kind: "photo" | "id") => {
    if (!pending || !user) return null;
    const path = buildProfilePath(user.id, kind, pending.file);
    const { error } = await supabase.storage.from(bucket).upload(path, pending.file, { contentType: pending.file.type });
    if (error) throw new Error(`Could not upload the ${kind === "photo" ? "photo" : "ID card"}: ${error.message}`);
    return path;
  };

  const verifyIdCard = async () => {
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-student-id");
      if (error) throw error;
      if (data?.status === "verified") toast.success("Your student ID is verified ✓");
      else if (data?.status === "rejected") toast.error(data.reason ? `ID check: ${data.reason}` : "Your ID card could not be verified.");
    } catch {
      toast.info("Your ID card was uploaded and will be checked shortly.");
    } finally { setVerifying(false); }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !profile) return;
    setSaving(true); setError("");
    try {
      const update = profileUpdate(draft);
      const photoPath = await upload(photo, AVATAR_BUCKET, "photo");
      if (photoPath) update.profile_photo_url = photoPath;
      const idPath = await upload(idCard, ID_BUCKET, "id");
      if (idPath) update.id_card_url = idPath;
      const { data, error } = await supabase.from("profiles").update(update).eq("id", user.id).select("id").single();
      if (error) throw error;
      if (!data) throw new Error("Your changes were not saved. Please try again.");
      setSaving(false);
      if (idPath) await verifyIdCard();
      await refreshProfile();
      toast.success("Profile saved");
      onOpenChange(false);
    } catch (error) { setError(error instanceof Error ? error.message : "Could not save your profile."); }
    finally { setSaving(false); }
  };

  const field = (key: keyof typeof draft, label: string, placeholder: string, type = "text") => (
    <div className="space-y-1">
      <Label htmlFor={`profile-${key}`}>{label}</Label>
      <Input id={`profile-${key}`} type={type} value={draft[key]} placeholder={placeholder}
        onChange={event => setDraft(value => ({ ...value, [key]: event.target.value }))} disabled={saving} maxLength={120} />
    </div>
  );

  const pick = (key: "department" | "batch_year", label: string, options: string[]) => {
    const opts = draft[key] && !options.includes(draft[key]) ? [draft[key], ...options] : options;
    return (
      <div className="space-y-1">
        <Label htmlFor={`profile-${key}`}>{label}</Label>
        <Select value={draft[key] || undefined} onValueChange={v => setDraft(value => ({ ...value, [key]: v }))} disabled={saving}>
          <SelectTrigger id={`profile-${key}`}><SelectValue placeholder={`Choose ${label.toLowerCase()}`} /></SelectTrigger>
          <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    );
  };

  const uploadBox = (id: string, label: string, hint: string, pending: PendingFile, current: string | null, setter: (value: PendingFile) => void, clearDraft: () => void) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
        {pending ? (
          <div className="flex items-center gap-3">
            <img src={pending.preview} alt={`${label} preview`} className="h-14 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-body text-xs font-medium truncate">{pending.file.name}</p>
              <p className="font-body text-[10px] text-muted-foreground">{(pending.file.size / 1024).toFixed(0)} KB · ready to upload</p>
            </div>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${label}`} onClick={() => setter(null)}><X className="h-4 w-4" /></Button>
          </div>
        ) : current ? (
          <div className="flex items-center gap-3">
            {currentPhotoUrl && label === "Profile photo" && <img src={currentPhotoUrl} alt="Current profile" className="h-14 w-14 rounded-lg object-cover" />}
            <Badge variant="outline" className="font-body text-[10px]">Uploaded</Badge>
            <Button type="button" variant="ghost" size="sm" className="ml-auto text-xs" onClick={clearDraft}>Remove</Button>
          </div>
        ) : (
          <p className="font-body text-xs text-muted-foreground">{hint}</p>
        )}
        <div>
          <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={saving}
            onChange={e => { pickFile(e.target.files?.[0], setter); e.target.value = ""; }} />
          <Button type="button" variant="outline" size="sm" className="font-body text-xs" disabled={saving} asChild>
            <label htmlFor={id} className="cursor-pointer"><Upload className="h-3.5 w-3.5 mr-1.5" />{pending || current ? "Replace file" : "Choose file"}</label>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={value => { if (!saving && !verifying) onOpenChange(value); }}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg">
        <div><DialogTitle>Edit profile</DialogTitle><DialogDescription className="mt-1">{steps[step]} · {step + 1} of {steps.length}</DialogDescription></div>
        <form onSubmit={save} className="space-y-4">
          {step === 0 && (
            <div className="space-y-3">
              {field("full_name", "Full name", "e.g. Chera Kemal")}
              {field("phone", "Phone", "e.g. +251 912 345 678", "tel")}
              <div className="space-y-1">
                <Label htmlFor="profile-gender">Gender</Label>
                <Select value={draft.gender} onValueChange={gender => setDraft(value => ({ ...value, gender }))} disabled={saving}>
                  <SelectTrigger id="profile-gender"><SelectValue placeholder="Choose gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Brother</SelectItem><SelectItem value="female">Sister</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-3">
              {field("student_id", "Student ID", "e.g. ASTU/1234/15")}
              {pick("department", "Department", ASTU_DEPARTMENTS)}
              {pick("batch_year", "Class year", CLASS_YEARS)}
              <p className="text-xs text-muted-foreground">Your department and class year decide which groups you see.</p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              {uploadBox("profile-photo", "Profile photo", "Upload a clear photo of yourself from this device (JPG, PNG or WebP, up to 5 MB).", photo, draft.profile_photo_url || null, setPhoto, () => setDraft(v => ({ ...v, profile_photo_url: "" })))}
              {uploadBox("id-card", "Student ID card", "Upload a photo of your current university ID card. We check it automatically to verify you as a student.", idCard, draft.id_card_url || null, setIdCard, () => setDraft(v => ({ ...v, id_card_url: "" })))}
              <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                  When you upload an ID card, we automatically check that it matches your name, student ID and university, and that it is still valid. Verified students get the ✓ Verified badge.
                </p>
              </div>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-destructive break-words">{error}</p>}
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="icon" aria-label="Previous profile section" disabled={step === 0 || saving} onClick={() => setStep(value => value - 1)}><ArrowLeft className="h-4 w-4" /></Button>
            <Button type="button" variant="outline" size="icon" aria-label="Next profile section" disabled={step === 2 || saving} onClick={() => setStep(value => value + 1)}><ArrowRight className="h-4 w-4" /></Button>
            <Button type="submit" className="ml-auto" disabled={saving || verifying}>
              {verifying ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking ID…</> : <><Save className="h-4 w-4 mr-2" />{saving ? "Saving…" : "Save changes"}</>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
