import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { useXp } from "@/hooks/useXp";

/** Compact XP + level indicator shown in the app header. */
export function XpChip() {
  const { xp, level, loading } = useXp();
  if (loading) return null;

  return (
    <Link
      to="/profile"
      aria-label={`Level ${level}, ${xp} experience points. Open your profile.`}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/70 hover:bg-secondary border border-border/60 transition-colors"
    >
      <Zap className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
      <span className="font-body text-[11px] font-semibold text-foreground leading-none">
        Lv{level}
      </span>
      <span className="font-body text-[10px] text-muted-foreground leading-none hidden sm:inline">
        {xp} XP
      </span>
    </Link>
  );
}
