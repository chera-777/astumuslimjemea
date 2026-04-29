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
      <div className="min-h-screen flex w-full overflow-x-hidden">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
          <AppHeader />
          <main className="flex-1 pb-20 md:pb-0 min-w-0 overflow-x-hidden">
            {children}
          </main>
          {isMobile && <BottomNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
