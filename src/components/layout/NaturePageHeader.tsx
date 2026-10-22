import type { ReactNode } from "react";
import { NatureLogo } from "@/components/auth/NatureShell";
import { cn } from "@/lib/utils";

interface NaturePageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

export function NaturePageHeader({ title, subtitle, children, className }: NaturePageHeaderProps) {
  return (
    <header className={cn("leaf-page-heading text-center", className)}>
      <NatureLogo className="h-12 w-12" />
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-primary">{title}</h1>
      {subtitle && <p className="mx-auto mt-2 max-w-lg font-body text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}