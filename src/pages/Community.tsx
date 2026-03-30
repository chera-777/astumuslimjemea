import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Phone, Video, Users, Search, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AppLayout } from "@/components/layout/AppLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const contacts = [
  { name: "Br. Yusuf K.", lastMsg: "JazakAllahu Khairan!", time: "2m ago", unread: 2 },
  { name: "Br. Ibrahim A.", lastMsg: "See you at the ders", time: "15m ago", unread: 0 },
  { name: "Br. Hassan B.", lastMsg: "SubhanAllah, great talk", time: "1h ago", unread: 1 },
  { name: "Br. Omar S.", lastMsg: "Can you share the notes?", time: "3h ago", unread: 0 },
];

const groupChats = [
  { name: "Group 7 — Brothers", members: 14, lastMsg: "Meeting tomorrow at 5 PM", time: "10m ago", unread: 5 },
  { name: "Academic Sector", members: 45, lastMsg: "Tutoring schedule updated", time: "30m ago", unread: 3 },
  { name: "Qira'at Circle", members: 20, lastMsg: "New tajweed lesson available", time: "2h ago", unread: 0 },
];

const messages = [
  { from: "Br. Yusuf K.", text: "Assalamu Alaikum brother!", mine: false, time: "2:30 PM" },
  { from: "You", text: "Wa Alaikum Assalam! How are you?", mine: true, time: "2:31 PM" },
  { from: "Br. Yusuf K.", text: "Alhamdulillah, are you coming to the ders tonight?", mine: false, time: "2:32 PM" },
  { from: "You", text: "InshaAllah, I'll be there by 6:30", mine: true, time: "2:33 PM" },
  { from: "Br. Yusuf K.", text: "JazakAllahu Khairan!", mine: false, time: "2:34 PM" },
];

type Tab = "chats" | "groups" | "active";

const CommunityContent = () => {
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("chats");

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "chats", label: "Chats", icon: <MessageCircle className="h-4 w-4" />, count: 3 },
    { key: "groups", label: "Groups", icon: <Users className="h-4 w-4" />, count: 8 },
    { key: "active", label: "Active", icon: <Send className="h-4 w-4" /> },
  ];

  // When in active chat, render without sidebar/bottom nav
  if (activeTab === "active") {
    return (
      <div className="h-screen flex flex-col bg-background fixed inset-0 z-50">
        {/* Chat contact header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab("chats")} className="p-1 hover:bg-secondary rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center">
              <span className="font-body text-xs font-bold text-primary-foreground">Y</span>
            </div>
            <div>
              <p className="font-body text-sm font-semibold">Br. Yusuf K.</p>
              <p className="font-body text-[10px] text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-8 w-8"><Phone className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="h-8 w-8"><Video className="h-4 w-4" /></Button>
          </div>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl ${m.mine ? "gradient-teal text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                <p className="font-body text-sm">{m.text}</p>
                <p className={`font-body text-[10px] mt-1 ${m.mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="flex gap-2 p-3 border-t border-border shrink-0">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="font-body rounded-xl"
          />
          <Button size="icon" className="gradient-teal text-primary-foreground border-0 rounded-xl shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Chat Tab Header */}
      <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-center gap-1 px-2 py-2">
          {tabs.filter(t => t.key !== "active").map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "gradient-teal text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count && tab.count > 0 && (
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-accent text-accent-foreground"
                )}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "chats" && (
          <motion.div key="chats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-2">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 font-body rounded-xl" />
            </div>
            {contacts.map((c) => (
              <Card key={c.name} className="cursor-pointer hover:bg-secondary/50 transition-colors border border-border bg-card" onClick={() => setActiveTab("active")}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full gradient-teal flex items-center justify-center">
                    <span className="font-body text-sm font-bold text-primary-foreground">{c.name[4]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold truncate">{c.name}</p>
                      <span className="font-body text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-body font-bold text-accent-foreground">{c.unread}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === "groups" && (
          <motion.div key="groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-2">
            {groupChats.map((g) => (
              <Card key={g.name} className="cursor-pointer hover:bg-secondary/50 transition-colors border border-border bg-card">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full gradient-purple flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold truncate">{g.name}</p>
                      <span className="font-body text-[10px] text-muted-foreground">{g.time}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground truncate">{g.members} members • {g.lastMsg}</p>
                  </div>
                  {g.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-body font-bold text-accent-foreground">{g.unread}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Community = () => {
  return (
    <AppLayout>
      <CommunityContent />
    </AppLayout>
  );
};

export default Community;
