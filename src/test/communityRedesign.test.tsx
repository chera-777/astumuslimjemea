import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Community from "@/pages/Community";
import CallPage from "@/pages/CallPage";
import { CallProvider } from "@/features/community/CallContext";
import { communityRepository } from "@/features/community/mockRepository";
import { assertCommitteeAccess, CommitteeAccessError } from "@/features/community/committeeAccess";
import { getPushProviderStatus } from "@/features/community/notifications";

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

function mockViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    const maxMatch = /\(max-width:\s*(\d+)px\)/.exec(query);
    const matches = maxMatch ? width <= Number(maxMatch[1]) : false;
    return {
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

function renderCommunity(initialEntry = "/community") {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <CallProvider>
          <Routes>
            <Route path="/community" element={<Community />} />
            <Route path="/calls/voice/:callId" element={<CallPage routeKind="voice" />} />
            <Route path="/calls/video/:callId" element={<CallPage routeKind="video" />} />
            <Route path="/calls/group/:callId" element={<CallPage routeKind="group" />} />
          </Routes>
        </CallProvider>
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe("Community Messaging Enhancements", () => {
  beforeEach(() => {
    mockViewportWidth(1280);
  });

  afterEach(cleanup);

  it("removes hamburger menu and Rank, and displays fixed Chats, Groups, Channels, and Contacts tabs", async () => {
    renderCommunity();

    expect(await screen.findByRole("tab", { name: /Chats/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Groups/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Channels/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Contacts/i })).toBeInTheDocument();

    // Hamburger menu removed completely
    expect(screen.queryByLabelText("Open Community navigation menu")).not.toBeInTheDocument();
    // Rank and global header removed
    expect(screen.queryByRole("tab", { name: /Rank/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Search the site")).not.toBeInTheDocument();

    // Switch across Groups, Channels, Contacts
    fireEvent.click(screen.getByRole("tab", { name: /Groups/i }));
    expect(await screen.findByText("ASTU Jemea General")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Channels/i }));
    expect(await screen.findByText("ASTU Muslim Jemea Official")).toBeInTheDocument();
    expect(screen.getByText("Discover Channels")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /Contacts/i }));
    expect(await screen.findByRole("button", { name: /Message Yusuf Kedir/i })).toBeInTheDocument();
  }, 15000);

  it("restores BottomNav on mobile list views and hides it inside #chat", async () => {
    mockViewportWidth(390);
    const { unmount } = renderCommunity("/community");

    expect(await screen.findByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();

    unmount();
    renderCommunity("/community#chat");
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("opens contextual action menu directly on message click with no per-message three-dot button", async () => {
    renderCommunity();

    const msgTexts = await screen.findAllByText(/Algorithms tutorial sheet/i, {}, { timeout: 4000 });
    const msgText = msgTexts[0];
    expect(screen.queryByRole("button", { name: "Message actions" })).not.toBeInTheDocument();

    fireEvent.click(msgText);

    expect(await screen.findByRole("button", { name: "Reply" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forward" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Select" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  }, 25000);

  it("renders simplified Chat Header with Voice Call, Video Call, and context-aware Three-Dot Menu, navigating to dedicated CallPage", async () => {
    renderCommunity();

    // Wait for initial chat to load
    await screen.findByRole("button", { name: "Start voice call" }, { timeout: 6000 });
    expect(screen.getByRole("button", { name: "Start video call" })).toBeInTheDocument();
    const menuTrigger = screen.getByRole("button", { name: "Conversation options" });
    expect(menuTrigger).toBeInTheDocument();

    // Old header icons removed
    expect(screen.queryByRole("button", { name: "Toggle chat info panel" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mute conversation/i })).not.toBeInTheDocument();

    // Open Direct Chat Three-Dot Menu before navigating away
    fireEvent.keyDown(menuTrigger, { key: "Enter" });
    expect(await screen.findByText("Set Wallpaper")).toBeInTheDocument();
    expect(screen.getByText("Export Chat History")).toBeInTheDocument();
    expect(screen.getByText("Delete Chat")).toBeInTheDocument();
    fireEvent.keyDown(document.body, { key: "Escape" });

    // Launch Voice Call -> dedicated independent CallPage (never a popup overlay)
    fireEvent.click(screen.getByRole("button", { name: "Start voice call" }));
    expect(await screen.findByRole("main", { name: "Dedicated Call Environment" })).toBeInTheDocument();
    expect(screen.queryByText(/Signaling integration pending/i)).not.toBeInTheDocument();
  }, 25000);

  it("enforces strict Committee-only RBAC on meetings in both repository and UI", async () => {
    expect(() => assertCommitteeAccess(["student"], "view committee meetings")).toThrow(
      /Unauthorized|restricted/i
    );
    await expect(communityRepository.getMeetings(["student"])).rejects.toThrow(
      /Unauthorized|restricted/i
    );

    const allowed = await communityRepository.getMeetings(["student", "committee"]);
    expect(allowed.length).toBeGreaterThanOrEqual(1);

    renderCommunity();

    const meetingsBtn = await screen.findByRole("button", { name: "Committee Meetings" });
    fireEvent.click(meetingsBtn);

    expect(await screen.findByText("Ashura Committee Meetings")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Instant Meeting/i })).toBeInTheDocument();

    // Switch preview role to unauthorized Student -> blocked cleanly
    fireEvent.click(screen.getByRole("button", { name: /Student \(Blocked\)/i }));
    expect(await screen.findByText("Access Restricted")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Start Instant Meeting/i })).not.toBeInTheDocument();
  }, 15000);

  it("supports sending, editing, reacting, and pinning messages in the mock repository", async () => {
    const snap = await communityRepository.getSnapshot();
    const convId = snap.conversations[0].id;

    const sent = await communityRepository.sendMessage({
      conversationId: convId,
      senderId: snap.currentUserId,
      text: "Assalamu Alaikum test message",
    });
    expect(sent.text).toBe("Assalamu Alaikum test message");

    const edited = await communityRepository.editMessage(convId, sent.id, "Edited message text");
    expect(edited?.text).toBe("Edited message text");
    expect(edited?.editedAt).toBeTruthy();

    await communityRepository.toggleReaction(convId, sent.id, snap.currentUserId, "👍");
    await communityRepository.togglePinMessage(convId, sent.id);

    const updated = await communityRepository.getSnapshot();
    const found = updated.messagesByConversation[convId].find((m) => m.id === sent.id);
    expect(found?.reactions[0]?.emoji).toBe("👍");
    expect(found?.isPinned).toBe(true);
  });

  it("supports sending a message through the Community composer UI", async () => {
    renderCommunity();

    const input = await screen.findByLabelText("Message input");
    fireEvent.change(input, { target: { value: "Meeting at Masjid after Asr" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(screen.getAllByText("Meeting at Masjid after Asr").length).toBeGreaterThanOrEqual(1);
    });
  }, 15000);

  it("keeps OneSignal uninitialized without credentials", () => {
    const status = getPushProviderStatus();
    expect(status.provider).toBe("onesignal");
    expect(status.isConfigured).toBe(false);
    expect(status.statusNote).toMatch(/pending/i);
  });
});
