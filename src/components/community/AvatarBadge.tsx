import { cn } from "@/lib/utils";
import type { PresenceStatus } from "@/features/community/types";

interface AvatarBadgeProps {
  initials: string;
  colorClass: string;
  name: string;
  avatarUrl?: string;
  status?: PresenceStatus;
  showPresence?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

export function AvatarBadge({
  initials,
  colorClass,
  name,
  avatarUrl,
  status,
  showPresence = false,
  size = "md",
  className,
}: AvatarBadgeProps) {
  return (
    <div className={cn("relative shrink-0 select-none", className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className={cn(
            "rounded-full object-cover bg-secondary",
            SIZE_CLASSES[size]
          )}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "rounded-full bg-gradient-to-br flex items-center justify-center font-body font-semibold text-white tracking-tight",
            colorClass,
            SIZE_CLASSES[size]
          )}
        >
          {initials}
        </div>
      )}
      {showPresence && status === "online" && (
        <span
          aria-label="Online"
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background"
        />
      )}
    </div>
  );
}
