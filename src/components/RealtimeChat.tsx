import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Flag, Ban, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ReportDialog } from "@/components/ReportDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  room?: string;
  sender_name?: string | null;
}


export function RealtimeChat({ room = "general" }: { room?: string }) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", user.id)
      .then(({ data }) => {
        setBlockedIds(new Set((data || []).map((r) => r.blocked_id)));
      });
  }, [user?.id]);

  const blockUser = async (blockedId: string, name: string) => {
    if (!user?.id) return;
    const { error } = await supabase
      .from("user_blocks")
      .insert({ blocker_id: user.id, blocked_id: blockedId });
    if (error) return toast.error(error.message);
    setBlockedIds((prev) => new Set(prev).add(blockedId));
    toast.success(`Blocked ${name}. Their messages are hidden.`);
  };




  useEffect(() => {
    if (!profile?.university_id) return;
    let cancelled = false;

    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id,user_id,content,created_at")
        .eq("university_id", profile.university_id)
        .eq("room", room)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;

      const rows = (data || []) as Message[];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      const names: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,full_name")
          .in("id", ids);
        (profs || []).forEach((p: any) => (names[p.id] = p.full_name));
      }
      setMessages(rows.map((r) => ({ ...r, sender_name: names[r.user_id] || "Member" })));
    };
    load();

    const channel = supabase
      .channel(`messages:${profile.university_id}:${room}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `university_id=eq.${profile.university_id}`,
        },
        async (payload) => {
          const m = payload.new as Message;
          if (m.room && m.room !== room) return;
          let name = "Member";
          const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", m.user_id)
            .maybeSingle();
          if (data?.full_name) name = data.full_name;
          setMessages((prev) => [...prev, { ...m, sender_name: name }]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [profile?.university_id, room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user?.id || !profile?.university_id) return;
    setSending(true);
    const { error } = await supabase.from("messages").insert({
      content: trimmed,
      user_id: user.id,
      university_id: profile.university_id,
      room,
    });
    setSending(false);
    if (error) {
      toast.error("Failed to send message");
      return;
    }
    setText("");
  };

  return (
    <>
      <div className="flex-1 overflow-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-center font-body text-xs text-muted-foreground py-8">
            No messages yet. Say Assalamu Alaikum 👋
          </p>
        )}
        {messages.filter((m) => m.user_id === user?.id || !blockedIds.has(m.user_id)).map((m, i) => {
          const mine = m.user_id === user?.id;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className={`flex items-end gap-1 group ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Message actions"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted"
                    >
                      <MoreVertical className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="left" align="center" className="w-40 p-1">
                    <ReportDialog
                      targetType="message"
                      targetId={m.id}
                      trigger={
                        <button className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted flex items-center gap-2">
                          <Flag className="h-3.5 w-3.5" /> Report
                        </button>
                      }
                    />
                    <button
                      onClick={() => blockUser(m.user_id, m.sender_name || "user")}
                      className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted flex items-center gap-2 text-destructive"
                    >
                      <Ban className="h-3.5 w-3.5" /> Block user
                    </button>
                  </PopoverContent>
                </Popover>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-2xl ${
                  mine
                    ? "gradient-teal text-primary-foreground rounded-br-sm"
                    : "bg-secondary rounded-bl-sm"
                }`}
              >
                {!mine && (
                  <p className="font-body text-[10px] font-semibold text-primary mb-0.5">
                    {m.sender_name}
                  </p>
                )}
                <p className="font-body text-sm whitespace-pre-wrap break-words">{m.content}</p>
                <p
                  className={`font-body text-[10px] mt-1 ${
                    mine ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {new Date(m.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 p-3 border-t border-border bg-card shrink-0">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message..."
          className="font-body rounded-xl"
          disabled={sending}
        />
        <Button
          onClick={send}
          disabled={sending || !text.trim()}
          size="icon"
          aria-label="Send message"
          className="gradient-teal text-primary-foreground border-0 rounded-xl shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
