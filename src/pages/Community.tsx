import { useState } from "react";
import { SEO } from "@/components/SEO";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { CommunityProvider, useCommunity } from "@/features/community/CommunityContext";
import { ConversationListPane } from "@/components/community/ConversationListPane";
import { ChatThreadPane } from "@/components/community/ChatThreadPane";
import { ChatInfoPanel } from "@/components/community/ChatInfoPanel";
import {
  CommunityNavDrawer,
  CommunitySettingsDialog,
  ContactsDialog,
  ForwardMessageDialog,
  NewGroupDialog,
  UserProfileDialog,
} from "@/components/community/CommunityDialogs";

function CommunityWorkspace() {
  const { activeConversationId } = useCommunity();
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
          onOpenNavDrawer={() => setNavDrawerOpen(true)}
          onOpenContacts={() => setContactsOpen(true)}
          onOpenNewGroup={() => setNewGroupOpen(true)}
        />
      </div>

      {/* Center pane: Active chat thread (always visible on md+, full-width on mobile when selected) */}
      <div
        className={cn(
          "flex-1 h-full min-w-0 flex",
          activeConversationId ? "flex" : "hidden md:flex"
        )}
      >
        <ChatThreadPane />
        <ChatInfoPanel />
      </div>

      {/* Drawers & Modals */}
      <CommunityNavDrawer
        open={navDrawerOpen}
        onOpenChange={setNavDrawerOpen}
        onOpenContacts={() => setContactsOpen(true)}
        onOpenNewGroup={() => setNewGroupOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ContactsDialog open={contactsOpen} onOpenChange={setContactsOpen} />
      <NewGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
      <CommunitySettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <UserProfileDialog />
      <ForwardMessageDialog />
    </div>
  );
}

const Community = () => {
  return (
    <AppLayout>
      <SEO
        title="Community Messages & Groups — ASTU Muslim Jemea"
        description="Connect with ASTU Muslim Jemea members through direct chats, study groups, and community channels."
        path="/community"
      />
      <CommunityProvider>
        <CommunityWorkspace />
      </CommunityProvider>
    </AppLayout>
  );
};

export default Community;
