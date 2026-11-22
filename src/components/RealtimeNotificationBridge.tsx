import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Subscribes to inserts on public.notifications for the current user
 * and surfaces them as sonner toasts. Mount once inside BrowserRouter.
 */
export function RealtimeNotificationBridge() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as { title?: string; body?: string; deep_link?: string };
          toast(n.title || "New notification", {
            description: n.body,
            action: n.deep_link
              ? {
                  label: "Open",
                  onClick: () => {
                    if (n.deep_link!.startsWith("/")) {
                      navigate(n.deep_link!);
                    } else {
                      window.location.assign(n.deep_link!);
                    }
                  },
                }
              : undefined,
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, navigate]);

  return null;
}
