import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Sparkles, Trophy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { EventItem } from "@/lib/portalItems";
import { useXp } from "@/hooks/useXp";

interface Props {
  item: EventItem | null;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailsDialog({ item, onOpenChange }: Props) {
  const { award } = useXp();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  const handleJoin = async () => {
    if (!item) return;
    setJoining(true);
    const granted = await award("event_rsvp", { meta: { title: item.title } });
    setJoining(false);
    setJoined(true);
    toast.success(
      granted ? `You're in — ${item.title}. +5 XP earned!` : `You're in — ${item.title}.`
    );
  };


  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-primary/30">
        {item && (
          <>
            <div className="relative h-40 overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <Badge className={`absolute top-3 left-3 border ${item.tagColor}`}>{item.tag}</Badge>
              {item.xp && (
                <Badge className="absolute top-3 right-3 bg-gold/90 text-black border-0 gap-1">
                  <Sparkles className="h-3 w-3" /> +{item.xp} XP
                </Badge>
              )}
            </div>
            <div className="p-5 space-y-4">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">{item.title}</DialogTitle>
                <p className="font-body text-xs text-muted-foreground">{item.subtitle}</p>
              </DialogHeader>

              <p className="font-body text-sm text-foreground/85 leading-relaxed">{item.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/60">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-body">{item.time}</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/60">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="font-body truncate">{item.location}</span>
                </div>
                {item.participants && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/60 col-span-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-body">{item.participants} participants</span>
                  </div>
                )}
              </div>

              <Button className="w-full h-11 rounded-full font-semibold">
                <Trophy className="h-4 w-4 mr-2" /> Join / RSVP
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
