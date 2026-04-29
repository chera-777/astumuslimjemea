import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { UserCog, X } from "lucide-react";

const REMINDER_KEY = "msj-profile-prompt-last";
const REMINDER_INTERVAL_MS = 1000 * 60 * 60 * 24; // every 24h

export function ProfileCompletionPrompt() {
  const { profile, user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !profile) return;
    const fields = [
      profile.full_name, profile.phone, profile.gender, profile.department,
      profile.batch_year, profile.student_id,
    ];
    const missing = fields.filter((f) => !f).length;
    if (missing === 0) return;

    const last = Number(localStorage.getItem(REMINDER_KEY) || 0);
    if (Date.now() - last < REMINDER_INTERVAL_MS) return;

    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, [user, profile]);

  if (!profile) return null;

  const fields = [
    { key: "full_name", label: "Full name", value: profile.full_name },
    { key: "phone", label: "Phone", value: profile.phone },
    { key: "gender", label: "Gender", value: profile.gender },
    { key: "department", label: "Department", value: profile.department },
    { key: "batch_year", label: "Batch year", value: profile.batch_year },
    { key: "student_id", label: "Student ID", value: profile.student_id },
  ];
  const filled = fields.filter((f) => f.value).length;
  const pct = Math.round((filled / fields.length) * 100);

  const handleClose = () => {
    localStorage.setItem(REMINDER_KEY, String(Date.now()));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center mx-auto mb-3">
            <UserCog className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="font-display text-lg text-center">Complete your profile</DialogTitle>
            <DialogDescription className="font-body text-xs text-center mt-1">
              Help your community connect with you — add your personal, academic and community details.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4">
            <div className="flex justify-between text-xs font-body mb-1">
              <span className="text-muted-foreground">Profile completion</span>
              <span className="text-primary font-semibold">{pct}%</span>
            </div>
            <Progress value={pct} className="h-2" />
          </div>
          <ul className="text-left text-xs font-body space-y-1 mb-4">
            {fields.filter((f) => !f.value).slice(0, 4).map((f) => (
              <li key={f.key} className="flex items-center gap-2 text-muted-foreground">
                <X className="h-3 w-3 text-destructive" /> {f.label}
              </li>
            ))}
          </ul>
          <DialogFooter className="flex flex-row gap-2 sm:justify-center">
            <Button variant="ghost" onClick={handleClose} className="text-xs">Later</Button>
            <Button asChild onClick={handleClose} className="text-xs">
              <Link to="/profile">Complete profile</Link>
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
