import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Pencil,
  Reply,
  Send,
  Smile,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatBytes, formatDuration } from "@/features/community/formatters";
import { useCommunity } from "@/features/community/CommunityContext";
import type { MessageAttachment } from "@/features/community/types";
import eventHadith from "@/assets/event-hadith.jpg";

const EMOJI_GROUPS = [
  { label: "Greetings & Faith", emojis: ["👋", "🤲", "🌙", "🕌", "📖", "✨", "💚", "🌿"] },
  { label: "Expressions", emojis: ["😊", "😂", "❤️", "👍", "🎉", "🔥", "👏", "😮"] },
  { label: "Study & Service", emojis: ["📚", "📝", "💻", "☕", "⏰", "📌", "✅", "🤝"] },
];

interface MessageComposerProps {
  disabled?: boolean;
  disabledReason?: string;
  placeholder?: string;
}

export function MessageComposer({
  disabled = false,
  disabledReason,
  placeholder = "Message",
}: MessageComposerProps) {
  const {
    snapshot,
    activeConversation,
    replyTo,
    setReplyTo,
    editingMessage,
    setEditingMessage,
    sendMessage,
    saveEditMessage,
    saveDraft,
    sendTyping,
    uploadAttachment,
    isRealtimeBackendActive,
  } = useCommunity();

  const [text, setText] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<
    { attachment: MessageAttachment; rawFile?: File }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastConvIdRef = useRef<string | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Sync draft when switching conversations
  useEffect(() => {
    if (!activeConversation) return;
    if (lastConvIdRef.current !== activeConversation.id) {
      lastConvIdRef.current = activeConversation.id;
      setText(activeConversation.draftText ?? "");
      setPendingAttachments([]);
      setRecording(false);
      setRecordSeconds(0);
    }
  }, [activeConversation]);

  // Populate input when editing a message
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  // Voice recording live timer
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  // Debounced draft save
  const activeConvId = activeConversation?.id;
  const currentSavedDraft = activeConversation?.draftText ?? "";
  useEffect(() => {
    if (!activeConvId || editingMessage) return;
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    if (text === currentSavedDraft) return;
    draftTimerRef.current = setTimeout(() => {
      void saveDraft(activeConvId, text);
    }, 300);
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [text, activeConvId, currentSavedDraft, editingMessage, saveDraft]);

  const handleSend = async () => {
    if (disabled || uploading) return;
    if (editingMessage) {
      if (!text.trim()) return;
      await saveEditMessage(editingMessage.id, text);
      setText("");
      return;
    }

    if (!text.trim() && pendingAttachments.length === 0) return;
    if (!activeConversation) return;

    const currentPending = [...pendingAttachments];
    const messageText = text;
    setText("");
    setPendingAttachments([]);
    setUploading(true);

    try {
      let attachmentsToSend: MessageAttachment[] | undefined;
      if (currentPending.length > 0) {
        attachmentsToSend = await Promise.all(
          currentPending.map(async ({ attachment, rawFile }) => {
            if (rawFile && isRealtimeBackendActive) {
              const uploaded = await uploadAttachment(rawFile, activeConversation.id, {
                fileName: rawFile.name,
                mimeType: rawFile.type,
                type: attachment.type,
              });
              if (attachment.url?.startsWith("blob:")) {
                URL.revokeObjectURL(attachment.url);
              }
              return uploaded;
            }
            return attachment;
          })
        );
      }
      await sendMessage(messageText, attachmentsToSend);
    } finally {
      setUploading(false);
    }
  };

  const stopRecorderAndGetBlob = async (): Promise<Blob | null> => {
    const rec = mediaRecorderRef.current;
    if (!rec) return null;
    mediaRecorderRef.current = null;
    return new Promise((resolve) => {
      const handleStop = () => {
        rec.stream?.getTracks().forEach((t) => t.stop());
        const blob =
          audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: rec.mimeType || "audio/webm" })
            : null;
        audioChunksRef.current = [];
        resolve(blob);
      };
      if (rec.state === "inactive") {
        handleStop();
      } else {
        rec.onstop = handleStop;
        rec.stop();
      }
    });
  };

  const startVoiceRecording = async () => {
    setRecordSeconds(0);
    setRecording(true);
    audioChunksRef.current = [];
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(250);
      } catch {
        // Fallback smoothly to metadata voice note when microphone permission is blocked/headless
      }
    }
  };

  const handleSendVoiceNote = async () => {
    const duration = Math.max(1, recordSeconds);
    const bars = Array.from({ length: 18 }, () => Math.floor(25 + Math.random() * 70));
    setRecording(false);
    setRecordSeconds(0);
    const blob = await stopRecorderAndGetBlob();

    if (blob && activeConversation) {
      const uploaded = await uploadAttachment(blob, activeConversation.id, {
        fileName: `voice-note-${Date.now()}.webm`,
        mimeType: blob.type || "audio/webm",
        type: "voice",
        durationSec: duration,
        waveform: bars,
      });
      await sendMessage("", [uploaded]);
      return;
    }

    await sendMessage("", [
      {
        id: `voice-${Date.now()}`,
        type: "voice",
        name: "Voice note",
        durationSec: duration,
        waveform: bars,
      },
    ]);
  };

  const handleFileSelected = (files: FileList | null, forceFile = false) => {
    if (!files?.length) return;
    const added = Array.from(files).map((file) => {
      const url = typeof URL !== "undefined" && URL.createObjectURL ? URL.createObjectURL(file) : undefined;
      const isImage = !forceFile && file.type.startsWith("image/");
      const isVideo = !forceFile && file.type.startsWith("video/");
      const attachment: MessageAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: isImage ? "image" : isVideo ? "video" : "file",
        name: file.name,
        url,
        sizeBytes: file.size,
        mimeType: file.type,
      };
      return { attachment, rawFile: file };
    });
    setPendingAttachments((prev) => [...prev, ...added]);
    setAttachOpen(false);
  };

  const addSampleAttachment = (kind: "image" | "file") => {
    if (kind === "image") {
      setPendingAttachments((prev) => [
        ...prev,
        {
          attachment: {
            id: `att-${Date.now()}`,
            type: "image",
            name: "Hadith_Study_Notes.jpg",
            url: eventHadith,
          },
        },
      ]);
    } else {
      setPendingAttachments((prev) => [
        ...prev,
        {
          attachment: {
            id: `att-${Date.now()}`,
            type: "file",
            name: "Calculus_II_Midterm_Review.pdf",
            sizeBytes: 945_000,
            mimeType: "application/pdf",
          },
        },
      ]);
    }
    setAttachOpen(false);
  };

  const replySenderName =
    replyTo && snapshot
      ? replyTo.senderId === snapshot.currentUserId
        ? "You"
        : snapshot.users[replyTo.senderId]?.fullName || "Member"
      : "";

  if (disabled) {
    return (
      <div className="shrink-0 border-t border-border bg-card px-4 py-3 text-center text-xs font-body text-muted-foreground">
        {disabledReason || "Messaging is unavailable in this chat."}
      </div>
    );
  }

  return (
    <div className="shrink-0 border-t border-border bg-card">
      {/* Reply / Edit banner */}
      {(replyTo || editingMessage) && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-border/60 bg-secondary/40">
          <div className="flex items-center gap-2.5 min-w-0">
            {editingMessage ? (
              <Pencil className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <Reply className="h-4 w-4 text-primary shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-body font-semibold text-primary truncate">
                {editingMessage ? "Edit message" : `Reply to ${replySenderName}`}
              </p>
              <p className="text-xs font-body text-muted-foreground truncate">
                {editingMessage
                  ? editingMessage.text
                  : replyTo?.text || replyTo?.attachments?.[0]?.name || "Attachment"}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            aria-label={editingMessage ? "Cancel editing" : "Cancel reply"}
            onClick={() => {
              if (editingMessage) {
                setEditingMessage(null);
                setText("");
              } else {
                setReplyTo(null);
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Pending attachments preview strip */}
      {pendingAttachments.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto border-b border-border/60 bg-secondary/20">
          {pendingAttachments.map(({ attachment: att }) => (
            <div
              key={att.id}
              className="relative flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 shrink-0 max-w-[200px]"
            >
              {att.type === "image" && att.url ? (
                <img src={att.url} alt={att.name} className="h-9 w-9 rounded object-cover" />
              ) : att.type === "video" ? (
                <Video className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-primary shrink-0" />
              )}
              <div className="min-w-0 pr-5">
                <p className="text-xs font-body font-medium truncate">{att.name}</p>
                {att.sizeBytes && (
                  <p className="text-[10px] font-body text-muted-foreground tabular-nums">
                    {formatBytes(att.sizeBytes)}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label={`Remove ${att.name}`}
                onClick={() => {
                  if (att.url?.startsWith("blob:")) URL.revokeObjectURL(att.url);
                  setPendingAttachments((prev) => prev.filter((p) => p.attachment.id !== att.id));
                }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-secondary hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileSelected(e.target.files, false);
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFileSelected(e.target.files, true);
          e.target.value = "";
        }}
      />

      {/* Recording bar OR main text composer */}
      {recording ? (
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Discard voice recording"
            onClick={() => {
              void stopRecorderAndGetBlob();
              setRecording(false);
              setRecordSeconds(0);
            }}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl bg-secondary/60">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive animate-pulse shrink-0" />
            <span className="text-sm font-body font-medium tabular-nums">
              Recording {formatDuration(recordSeconds)}
            </span>
            <span className="text-xs font-body text-muted-foreground hidden sm:inline">
              Tap send when ready
            </span>
          </div>
          <Button
            type="button"
            size="icon"
            aria-label="Send voice note"
            onClick={handleSendVoiceNote}
            className="h-10 w-10 rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-end gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2">
          {/* Attachment menu */}
          {!editingMessage && (
            <Popover open={attachOpen} onOpenChange={setAttachOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Attach media or file"
                  className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-56 p-1.5">
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
                >
                  <ImageIcon className="h-4 w-4 text-primary" /> Photo or Video
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-body rounded-md hover:bg-secondary text-left"
                >
                  <FileText className="h-4 w-4 text-primary" /> Document / File
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => addSampleAttachment("image")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-body rounded-md hover:bg-secondary text-left text-muted-foreground"
                >
                  <ImageIcon className="h-4 w-4" /> Attach Sample Photo
                </button>
                <button
                  type="button"
                  onClick={() => addSampleAttachment("file")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-body rounded-md hover:bg-secondary text-left text-muted-foreground"
                >
                  <FileText className="h-4 w-4" /> Attach Sample PDF
                </button>
              </PopoverContent>
            </Popover>
          )}

          {/* Message textarea */}
          <div className="flex-1 flex items-end rounded-2xl bg-secondary/60 border border-border/60 focus-within:border-primary/60 px-3 py-1.5 min-w-0">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => {
                const nextValue = e.target.value;
                setText(nextValue);
                if (nextValue.trim() && activeConvId && !editingMessage) {
                  const now = Date.now();
                  if (now - lastTypingSentRef.current > 1500) {
                    lastTypingSentRef.current = now;
                    sendTyping(activeConvId);
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={editingMessage ? "Edit your message…" : placeholder}
              aria-label="Message input"
              className="flex-1 resize-none bg-transparent text-sm font-body placeholder:text-muted-foreground focus:outline-none max-h-32 py-1 leading-snug"
            />
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="Insert emoji"
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-1"
                >
                  <Smile className="h-5 w-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" align="end" className="w-64 p-2.5 space-y-2.5">
                {EMOJI_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-[11px] font-body font-medium text-muted-foreground mb-1">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {group.emojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setText((prev) => `${prev}${emoji}`);
                            textareaRef.current?.focus();
                          }}
                          className="h-7 w-7 rounded hover:bg-secondary flex items-center justify-center text-base"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          {/* Send or Mic button */}
          {text.trim().length > 0 || pendingAttachments.length > 0 || editingMessage ? (
            <Button
              type="button"
              size="icon"
              aria-label={editingMessage ? "Save edited message" : "Send message"}
              onClick={() => void handleSend()}
              className="h-10 w-10 rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          ) : (
              <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Record voice message"
              onClick={() => void startVoiceRecording()}
              className="h-10 w-10 rounded-full shrink-0"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
