import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/features/community/formatters";
import type { MessageAttachment } from "@/features/community/types";

interface VoiceMessageBubbleProps {
  attachment: MessageAttachment;
  mine: boolean;
}

const DEFAULT_WAVE = [28, 52, 74, 44, 86, 68, 42, 78, 92, 58, 36, 66, 82, 54, 40, 72, 48, 32];

export function VoiceMessageBubble({ attachment, mine }: VoiceMessageBubbleProps) {
  const duration = Math.max(1, attachment.durationSec ?? 12);
  const bars = attachment.waveform?.length ? attachment.waveform : DEFAULT_WAVE;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 0.2 >= duration) {
          setPlaying(false);
          return 0;
        }
        return prev + 0.2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [playing, duration]);

  const progress = elapsed / duration;

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[190px] sm:min-w-[230px]">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95",
          mine
            ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <div
          className="flex items-end gap-[2px] h-6 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
            setElapsed(ratio * duration);
          }}
          role="slider"
          aria-label="Voice message progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={Math.round(elapsed)}
          tabIndex={0}
        >
          {bars.map((heightPct, idx) => {
            const barProgress = (idx + 1) / bars.length;
            const active = barProgress <= progress;
            return (
              <span
                key={idx}
                className={cn(
                  "flex-1 rounded-full transition-colors duration-150",
                  active
                    ? mine
                      ? "bg-primary-foreground"
                      : "bg-primary"
                    : mine
                      ? "bg-primary-foreground/35"
                      : "bg-muted-foreground/35"
                )}
                style={{ height: `${Math.max(20, Math.min(100, heightPct))}%` }}
              />
            );
          })}
        </div>
        <div
          className={cn(
            "flex items-center justify-between text-[10px] font-body tabular-nums",
            mine ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          <span>{playing || elapsed > 0 ? formatDuration(elapsed) : formatDuration(duration)}</span>
          <span>Voice note</span>
        </div>
      </div>
    </div>
  );
}
