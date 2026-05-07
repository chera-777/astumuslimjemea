import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AppHeader } from "@/components/layout/AppHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProfileCompletionPrompt } from "@/components/ProfileCompletionPrompt";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      {/* overflow-x-clip preserves sticky positioning, unlike overflow-x-hidden */}
      <div className="min-h-screen flex w-full overflow-x-clip">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-clip">
          <AppHeader />
          <main className="flex-1 pb-20 md:pb-0 min-w-0 overflow-x-clip">
            {children}
          </main>
          {isMobile && <BottomNav />}
        </div>
        <ProfileCompletionPrompt />
      </div>
    </SidebarProvider>
  );
}
