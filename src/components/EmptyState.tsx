import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

/** Friendly placeholder shown when a list has no items yet. */
export function EmptyState({ icon: Icon, title, description, actionLabel, actionTo, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-8 px-4">
      <div
        className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center"
        aria-hidden="true"
      >
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-sm font-bold text-foreground">{title}</h3>
      <p className="font-body text-xs text-muted-foreground max-w-xs">{description}</p>
      {actionLabel && actionTo && (
        <Button asChild size="sm" className="rounded-full mt-1">
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && !actionTo && onAction && (
        <Button size="sm" className="rounded-full mt-1" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
