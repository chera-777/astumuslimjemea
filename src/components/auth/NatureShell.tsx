import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import leaves from "@/assets/leaves-corner.png";
import logo from "@/assets/logo-leaf.png";

/** Leafy corners used on every loading / welcome / auth screen. */
export function NatureLeaves() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <img src={leaves} alt="" className="absolute -top-6 -right-10 w-52 sm:w-64 opacity-90" />
      <img src={leaves} alt="" className="absolute -top-6 -left-10 w-44 sm:w-56 opacity-80 -scale-x-100" />
      <img src={leaves} alt="" className="absolute -bottom-6 -left-8 w-36 sm:w-48 opacity-60 rotate-180" />
      <img src={leaves} alt="" className="absolute -bottom-6 -right-8 w-36 sm:w-48 opacity-60 -scale-y-100" />
    </div>
  );
}

export function NatureLogo({ className, onClick }: { className?: string; onClick?: () => void }) {
  const img = <img src={logo} alt="ASTU Muslim Jemea" width={816} height={816} className={cn("h-16 w-16 object-contain", className)} />;
  return onClick ? (
    <button type="button" onClick={onClick} aria-label="ASTU Muslim Jemea logo" className="mx-auto block focus:outline-none">{img}</button>
  ) : <div className="mx-auto w-fit">{img}</div>;
}

/** Same logo → heading → description stack on every screen. */
export function NatureHeader({ title, subtitle, onLogoClick }: { title: string; subtitle?: string; onLogoClick?: () => void }) {
  return (
    <div className="text-center">
      <NatureLogo onClick={onLogoClick} />
      <h1 className="nature-title font-display text-3xl font-bold mt-3 leading-tight">{title}</h1>
      {subtitle && <p className="nature-muted text-sm mt-1.5">{subtitle}</p>}
    </div>
  );
}

export function NatureScreen({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("nature-surface relative min-h-[100dvh] w-full overflow-hidden flex flex-col", className)}>
      <NatureLeaves />
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-sm mx-auto px-6 py-10">{children}</div>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <NatureScreen>
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <NatureLogo className="h-20 w-20 animate-pulse" />
        <p className="nature-title font-display text-2xl font-bold">ASTU Muslim Jemea</p>
        <div className="h-1 w-24 rounded-full overflow-hidden" style={{ background: "hsl(130 25% 86%)" }}>
          <div className="h-full w-1/2 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]" style={{ background: "hsl(130 55% 38%)" }} />
        </div>
      </div>
    </NatureScreen>
  );
}

/** "or continue with" + Google / Apple / Facebook square buttons (reference layout). */
export function SocialRow({ onProvider, disabled }: { onProvider: (p: "google" | "apple" | "facebook") => void; disabled?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-3 my-5">
        <span className="h-px flex-1" style={{ background: "hsl(130 25% 86%)" }} />
        <span className="nature-muted text-xs">or continue with</span>
        <span className="h-px flex-1" style={{ background: "hsl(130 25% 86%)" }} />
      </div>
      <div className="flex items-center justify-center gap-5">
        <button type="button" disabled={disabled} onClick={() => onProvider("google")} className="nature-social" aria-label="Continue with Google">
          <svg className="h-6 w-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        </button>
        <button type="button" disabled={disabled} onClick={() => onProvider("apple")} className="nature-social" aria-label="Continue with Apple">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#111"><path d="M16.37 12.6c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.89-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.23 2.6 1.3-.05 1.79-.84 3.36-.84s2.01.84 3.38.81c1.4-.02 2.28-1.27 3.13-2.52.99-1.45 1.4-2.85 1.42-2.92-.03-.01-2.72-1.04-2.71-4.14zM13.79 4.97c.71-.86 1.19-2.06 1.06-3.25-1.02.04-2.27.68-3 1.54-.66.76-1.24 1.98-1.08 3.15 1.14.09 2.31-.58 3.02-1.44z"/></svg>
        </button>
        <button type="button" disabled={disabled} onClick={() => onProvider("facebook")} className="nature-social" aria-label="Continue with Facebook">
          <svg className="h-6 w-6" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path fill="#fff" d="M15.12 15.47l.53-3.47h-3.33V9.75c0-.95.47-1.88 1.95-1.88h1.51V4.92s-1.37-.23-2.68-.23c-2.74 0-4.53 1.66-4.53 4.66V12H5.52v3.47h3.05V24a12.1 12.1 0 0 0 3.75 0v-8.53h2.8z"/></svg>
        </button>
      </div>
    </div>
  );
}
