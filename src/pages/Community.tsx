import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Phone, Video, Users, Search } from "lucide-react";
import { motion } from "framer-motion";

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

const Community = () => {
  const [message, setMessage] = useState("");

  return (
    <AppLayout>
      <div className="p-4 md:p-6 h-[calc(100vh-8rem)] flex flex-col">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Community</h1>
        </motion.div>

        <Tabs defaultValue="chats" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full grid grid-cols-3 h-auto shrink-0">
            <TabsTrigger value="chats" className="font-body text-xs py-2">Chats</TabsTrigger>
            <TabsTrigger value="groups" className="font-body text-xs py-2">Groups</TabsTrigger>
            <TabsTrigger value="active" className="font-body text-xs py-2">Active Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="chats" className="flex-1 overflow-auto mt-4 space-y-2">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search conversations..." className="pl-9 font-body" />
            </div>
            {contacts.map((c) => (
              <Card key={c.name} className="cursor-pointer hover:bg-secondary/50 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-body text-sm font-bold text-primary">{c.name[4]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-sm font-semibold truncate">{c.name}</p>
                      <span className="font-body text-[10px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground truncate">{c.lastMsg}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-body font-bold text-primary-foreground">{c.unread}</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="groups" className="flex-1 overflow-auto mt-4 space-y-2">
            {groupChats.map((g) => (
              <Card key={g.name} className="cursor-pointer hover:bg-secondary/50 transition-colors">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent-foreground" />
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
          </TabsContent>

          <TabsContent value="active" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Chat header */}
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-body text-xs font-bold text-primary">Y</span>
                </div>
                <p className="font-body text-sm font-semibold">Br. Yusuf K.</p>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost"><Phone className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost"><Video className="h-4 w-4" /></Button>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-auto space-y-3 mb-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] p-3 rounded-xl ${m.mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                    <p className="font-body text-sm">{m.text}</p>
                    <p className={`font-body text-[10px] mt-1 ${m.mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Input */}
            <div className="flex gap-2 shrink-0">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="font-body"
              />
              <Button size="icon" variant="default"><Send className="h-4 w-4" /></Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Community;
