import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav, DesktopFAB } from "@/components/layout/BottomNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileCompletionPrompt } from "@/components/ProfileCompletionPrompt";
import { useAzanAutoPlay } from "@/hooks/useAzanAutoPlay";
import { useOneSignal } from "@/hooks/useOneSignal";
import { useLocation } from "react-router-dom";
import leaves from "@/assets/leaves-corner.png";
import { StudentProfileSetup } from "@/components/auth/StudentProfileSetup";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const focused = pathname.startsWith("/quran/") || pathname === "/azan/now";
  useAzanAutoPlay();
  useOneSignal();

  return (
    <SidebarProvider>
      {/* overflow-x-clip preserves sticky positioning, unlike overflow-x-hidden */}
      <div className="nature-app min-h-screen flex w-full overflow-x-clip bg-background text-foreground">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-clip">
          <AppHeader />
          <main className={focused ? "flex-1 pb-20 md:pb-0 min-w-0 overflow-x-clip" : "leaf-content relative isolate flex-1 pb-24 md:pb-12 min-w-0 overflow-x-clip"}>
            {!focused && (
              <div className="leaf-page-art pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
                <img src={leaves} alt="" className="absolute -right-12 -top-6 w-44 md:w-60 opacity-20" />
                <img src={leaves} alt="" className="absolute -left-14 top-0 w-36 md:w-52 -scale-x-100 opacity-15" />
              </div>
            )}
            {children}
          </main>
          {isMobile && <BottomNav />}
        </div>
        <DesktopFAB />
        <ProfileCompletionPrompt />
        <StudentProfileSetup />
      </div>
    </SidebarProvider>
  );
}
