import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Community from "@/pages/Community";
import { communityRepository } from "@/features/community/mockRepository";
import { getPushProviderStatus } from "@/features/community/notifications";

// Mock scrollIntoView for jsdom
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("Community Telegram-inspired redesign", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1280 });
  });

  afterEach(cleanup);

  it("renders Community without global header and without Rank tab, keeping fixed Chats and Groups tabs", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/community"]}>
          <Community />
        </MemoryRouter>
      </HelmetProvider>
    );

    // Fixed Chats & Groups tabs present
    const chatsTab = await screen.findByRole("tab", { name: /Chats/i });
    const groupsTab = screen.getByRole("tab", { name: /Groups/i });
    expect(chatsTab).toBeInTheDocument();
    expect(groupsTab).toBeInTheDocument();

    // Rank feature completely removed from Community
    expect(screen.queryByRole("tab", { name: /Rank/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/This month's top members/i)).not.toBeInTheDocument();

    // Global application header removed from Community
    expect(screen.queryByLabelText("Search the site")).not.toBeInTheDocument();

    // Realistic mock conversation loads and switching to Groups works
    expect(await screen.findByText("Yusuf Kedir")).toBeInTheDocument();
    fireEvent.click(groupsTab);
    expect(await screen.findByText("ASTU Jemea General")).toBeInTheDocument();
  });

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
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/community"]}>
          <Community />
        </MemoryRouter>
      </HelmetProvider>
    );

    const input = await screen.findByLabelText("Message input");
    fireEvent.change(input, { target: { value: "Meeting at Masjid after Asr" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(screen.getAllByText("Meeting at Masjid after Asr").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("keeps OneSignal uninitialized without credentials", () => {
    const status = getPushProviderStatus();
    expect(status.provider).toBe("onesignal");
    expect(status.isConfigured).toBe(false);
    expect(status.statusNote).toMatch(/pending/i);
  });
});
