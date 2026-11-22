import { useState } from "react";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { CommunityProvider, useCommunity } from "@/features/community/CommunityContext";
import { ConversationListPane } from "@/components/community/ConversationListPane";
import { ChatThreadPane } from "@/components/community/ChatThreadPane";
import { ChatInfoPanel } from "@/components/community/ChatInfoPanel";
import { CommunitySettingsView } from "@/components/community/CommunitySettingsView";
import { CommitteeMeetingsView } from "@/components/community/CommitteeMeetingsView";
import {
  AddContactDialog,
  CreatePollDialog,
  ForwardMessageDialog,
  InviteMembersDialog,
  NewChannelDialog,
  NewGroupDialog,
  ReportConversationDialog,
  StartNewChatDialog,
  UserProfileDialog,
  WallpaperDialog,
} from "@/components/community/CommunityDialogs";

function CommunityWorkspace() {
  const { activeConversationId, meetingsOpen, rightPaneMode, openSettingsPanel } =
    useCommunity();
  const [startNewChatOpen, setStartNewChatOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [inviteMembersOpen, setInviteMembersOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [newChannelOpen, setNewChannelOpen] = useState(false);
  const [wallpaperOpen, setWallpaperOpen] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (meetingsOpen) {
    return (
      <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
        <CommitteeMeetingsView />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Left pane: Conversation list (always visible on md+, hidden on mobile when inside a thread) */}
      <div
        className={cn(
          "h-full w-full md:w-[320px] lg:w-[360px] xl:w-[380px] shrink-0",
          activeConversationId ? "hidden md:block" : "block"
        )}
      >
        <ConversationListPane
          onOpenStartNewChat={() => setStartNewChatOpen(true)}
          onOpenAddContact={() => setAddContactOpen(true)}
          onOpenInviteMembers={() => setInviteMembersOpen(true)}
          onOpenNewGroup={() => setNewGroupOpen(true)}
          onOpenNewChannel={() => setNewChannelOpen(true)}
          onOpenSettings={openSettingsPanel}
        />
      </div>

      {/* Center pane: Active chat thread */}
      <div
        className={cn(
          "flex-1 h-full min-w-0 flex",
          activeConversationId ? "flex" : "hidden md:flex"
        )}
      >
        <ChatThreadPane
          onOpenWallpaper={() => setWallpaperOpen(true)}
          onOpenCreatePoll={() => setPollOpen(true)}
          onOpenReport={() => setReportOpen(true)}
        />
      </div>

      {/* Right pane: Contextual Info or Settings (side-by-side inline on lg+, drawer on < lg) */}
      {rightPaneMode === "settings" ? <CommunitySettingsView /> : <ChatInfoPanel />}

      {/* Modals & Call Staging Overlay */}
      <StartNewChatDialog open={startNewChatOpen} onOpenChange={setStartNewChatOpen} />
      <AddContactDialog open={addContactOpen} onOpenChange={setAddContactOpen} />
      <InviteMembersDialog open={inviteMembersOpen} onOpenChange={setInviteMembersOpen} />
      <NewGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
      <NewChannelDialog open={newChannelOpen} onOpenChange={setNewChannelOpen} />
      <WallpaperDialog open={wallpaperOpen} onOpenChange={setWallpaperOpen} />
      <CreatePollDialog open={pollOpen} onOpenChange={setPollOpen} />
      <ReportConversationDialog open={reportOpen} onOpenChange={setReportOpen} />
      <UserProfileDialog />
      <ForwardMessageDialog />
    </div>
  );
}

const Community = () => {
  return (
    <AppLayout>
      <SEO
        title="Community Messages, Channels & Groups — ASTU Muslim Jemea"
        description="Connect with ASTU Muslim Jemea members through direct chats, study groups, broadcast channels, and committee meetings."
        path="/community"
      />
      <CommunityProvider>
        <CommunityWorkspace />
      </CommunityProvider>
    </AppLayout>
  );
};

export default Community;
