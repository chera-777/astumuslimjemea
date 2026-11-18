import {
  Check,
  CheckCheck,
  Menu,
  MessageCircle,
  MoreVertical,
  Pin,
  PinOff,
  Plus,
  Search,
  UserPlus,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCommunity, type CommunityTab, type ConversationFilter } from "@/features/community/CommunityContext";
import { formatConversationTime, getLastMessagePreview } from "@/features/community/formatters";
import { AvatarBadge } from "./AvatarBadge";

interface ConversationListPaneProps {
  onOpenNavDrawer: () => void;
  onOpenContacts: () => void;
  onOpenNewGroup: () => void;
}

export function ConversationListPane({
  onOpenNavDrawer,
  onOpenContacts,
  onOpenNewGroup,
}: ConversationListPaneProps) {
  const {
    loading,
    snapshot,
    activeTab,
    setActiveTab,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    activeConversationId,
    selectConversation,
    filteredConversations,
    matchingMessages,
    unreadCounts,
    typingMap,
    togglePinConversation,
    toggleMuteConversation,
    getPeerUser,
  } = useCommunity();

  const tabs: { key: CommunityTab; label: string; icon: typeof MessageCircle; badge: number }[] = [
    { key: "chats", label: "Chats", icon: MessageCircle, badge: unreadCounts.chats },
    { key: "groups", label: "Groups", icon: Users, badge: unreadCounts.groups },
  ];

  const filters: { key: ConversationFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "pinned", label: "Pinned" },
  ];

  return (
    <aside
      aria-label="Conversations"
      className="flex flex-col h-full w-full bg-card border-r border-border min-w-0"
    >
      {/* FIXED TOP HEADER BLOCK: Never scrolls away */}
      <div className="shrink-0 bg-card border-b border-border z-20">
        {/* Top bar: Menu + Title + Compose Actions */}
        <div className="h-14 px-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenNavDrawer}
              aria-label="Open Community navigation menu"
              className="h-10 w-10 rounded-full shrink-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-lg font-bold tracking-tight truncate">
              Community
            </h1>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenContacts}
              aria-label="Contacts and new direct message"
              title="Contacts & New Message"
              className="h-9 w-9 rounded-full"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onOpenNewGroup}
              aria-label="Create new group"
              title="New Group"
              className="h-9 w-9 rounded-full"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search + compact filters */}
        <div className="px-3 pb-2.5 space-y-2">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "chats"
                  ? "Search chats, people, or messages…"
                  : "Search groups or messages…"
              }
              aria-label="Search conversations"
              className="h-9 pl-9 pr-8 rounded-full bg-secondary/70 border-0 text-sm font-body focus-visible:ring-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter pills (interactive filter controls) */}
          <div className="flex items-center gap-1">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-body font-medium transition-colors whitespace-nowrap",
                  filter === f.key
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* FIXED CHATS & GROUPS TABS */}
        <div
          role="tablist"
          aria-label="Conversation categories"
          className="grid grid-cols-2 border-t border-border/60"
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative flex items-center justify-center gap-2 h-11 text-sm font-body font-medium transition-colors whitespace-nowrap",
                  active
                    ? "text-primary bg-primary/[0.06]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span
                    className={cn(
                      "min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center tabular-nums",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLLABLE CONVERSATION LIST */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {loading || !snapshot ? (
          <div className="p-3 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2">
                <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-14 space-y-3">
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              {activeTab === "chats" ? (
                <MessageCircle className="h-6 w-6" />
              ) : (
                <Users className="h-6 w-6" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-body text-sm font-semibold">
                {searchQuery || filter !== "all"
                  ? "No matching conversations"
                  : activeTab === "chats"
                    ? "No direct chats yet"
                    : "No groups yet"}
              </p>
              <p className="font-body text-xs text-muted-foreground max-w-[240px]">
                {searchQuery || filter !== "all"
                  ? "Try clearing your search or switching back to All."
                  : activeTab === "chats"
                    ? "Find a fellow ASTU student in Contacts to start messaging."
                    : "Create a study circle or committee group to collaborate."}
              </p>
            </div>
            {searchQuery || filter !== "all" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
              >
                Reset filters
              </Button>
            ) : activeTab === "chats" ? (
              <Button type="button" size="sm" onClick={onOpenContacts}>
                Browse Contacts
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={onOpenNewGroup}>
                Create Group
              </Button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const messages = snapshot.messagesByConversation[conv.id] ?? [];
            const lastMsg = messages[messages.length - 1];
            const peer = getPeerUser(conv);
            const typingIds = typingMap[conv.id] ?? [];
            const isTyping = typingIds.length > 0;
            const isSelected = activeConversationId === conv.id;
            const preview = isTyping
              ? "typing…"
              : getLastMessagePreview(conv, messages, snapshot.users, snapshot.currentUserId);
            const showReadReceipt =
              !isTyping &&
              lastMsg &&
              lastMsg.senderId === snapshot.currentUserId &&
              !lastMsg.deletedForAll;

            return (
              <div
                key={conv.id}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 transition-colors cursor-pointer",
                  isSelected
                    ? "bg-primary/12"
                    : "hover:bg-secondary/50"
                )}
                onClick={() => void selectConversation(conv.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    void selectConversation(conv.id);
                  }
                }}
                aria-current={isSelected ? "true" : undefined}
              >
                <AvatarBadge
                  initials={conv.avatarInitials}
                  colorClass={conv.avatarColor}
                  name={conv.title}
                  status={peer?.status}
                  showPresence={conv.type === "direct" && !peer?.isBlocked}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-body text-sm font-semibold truncate">
                        {conv.title}
                      </span>
                      {conv.isMuted && (
                        <VolumeX
                          className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                          aria-label="Muted"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {showReadReceipt && (
                        <span className="text-primary">
                          {lastMsg.deliveryStatus === "read" &&
                          snapshot.privacySettings.readReceiptsEnabled ? (
                            <CheckCheck className="h-3.5 w-3.5" />
                          ) : (
                            <Check className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </span>
                      )}
                      <span className="font-body text-[11px] text-muted-foreground tabular-nums">
                        {formatConversationTime(conv.updatedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p
                      className={cn(
                        "font-body text-xs truncate",
                        isTyping || conv.draftText?.trim()
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      {preview}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {conv.isPinned && (
                        <Pin
                          className="h-3 w-3 text-muted-foreground"
                          aria-label="Pinned conversation"
                        />
                      )}
                      {conv.unreadCount > 0 && (
                        <span
                          className={cn(
                            "min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-body font-semibold flex items-center justify-center tabular-nums",
                            conv.isMuted
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Pin/Mute Popover */}
                <div
                  className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Options for ${conv.title}`}
                        className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="start" className="w-44 p-1">
                      <button
                        type="button"
                        onClick={() => void togglePinConversation(conv.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-body rounded hover:bg-secondary text-left"
                      >
                        {conv.isPinned ? (
                          <PinOff className="h-3.5 w-3.5" />
                        ) : (
                          <Pin className="h-3.5 w-3.5" />
                        )}
                        {conv.isPinned ? "Unpin chat" : "Pin to top"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleMuteConversation(conv.id)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-body rounded hover:bg-secondary text-left"
                      >
                        {conv.isMuted ? (
                          <Volume2 className="h-3.5 w-3.5" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5" />
                        )}
                        {conv.isMuted ? "Unmute" : "Mute notifications"}
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            );
          })
        )}

        {/* Message search results section when searching */}
        {matchingMessages.length > 0 && snapshot && (
          <div className="pt-2 pb-4 bg-secondary/20">
            <p className="px-3 py-1.5 text-[11px] font-body font-semibold text-muted-foreground">
              Matching messages ({matchingMessages.length})
            </p>
            {matchingMessages.map(({ conversation, message }) => (
              <button
                key={message.id}
                type="button"
                onClick={() => void selectConversation(conversation.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/60 text-left transition-colors"
              >
                <AvatarBadge
                  initials={conversation.avatarInitials}
                  colorClass={conversation.avatarColor}
                  name={conversation.title}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-body font-semibold truncate">
                      {conversation.title}
                    </span>
                    <span className="text-[10px] font-body text-muted-foreground tabular-nums">
                      {formatConversationTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs font-body text-muted-foreground truncate">
                    {message.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
