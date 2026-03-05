import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {!isMobile && <AppSidebar />}
        <div className="flex-1 flex flex-col min-h-screen">
          {!isMobile && (
            <header className="h-14 flex items-center border-b px-4 bg-card">
              <SidebarTrigger className="mr-3" />
              <span className="font-display text-lg font-bold text-primary">ASTU Muslim Jemea</span>
            </header>
          )}
          <main className="flex-1 pb-20 md:pb-0">
            {children}
          </main>
          {isMobile && <BottomNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
