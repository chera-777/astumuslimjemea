import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { parse12hToMinutes, detectFiringPrayer, useAzanAutoPlay } from "@/hooks/useAzanAutoPlay";

// ---- Mocks ----
const mockPrayers = [
  { name: "Fajr", time: "5:12 AM" },
  { name: "Dhuhr", time: "12:27 PM" },
  { name: "Asr", time: "3:37 PM" },
  { name: "Maghrib", time: "6:33 PM" },
  { name: "Isha", time: "7:39 PM" },
];

vi.mock("@/hooks/usePrayerTimes", () => ({
  usePrayerTimes: () => ({
    loading: false,
    prayers: mockPrayers,
    fajr: "5:12 AM", dhuhr: "12:27 PM", asr: "3:37 PM", maghrib: "6:33 PM", isha: "7:39 PM",
    sunrise: "6:23 AM", sunset: "6:33 PM",
    hijriDate: "11 Shawwal 1447 AH", city: "Adama",
    nextPrayer: "Dhuhr", nextTime: "12:27 PM", error: null,
  }),
}));

vi.mock("@/lib/azanNotifications", () => ({
  isNativePlatform: () => false,
  requestNotificationPermission: vi.fn().mockResolvedValue(false),
  scheduleAzanNotifications: vi.fn().mockResolvedValue(0),
  registerNotificationTapHandler: vi.fn().mockResolvedValue(() => {}),
}));

function Harness() {
  useAzanAutoPlay();
  const loc = useLocation();
  return <div data-testid="loc">{loc.pathname + loc.search}</div>;
}

describe("parse12hToMinutes", () => {
  it("parses AM/PM correctly", () => {
    expect(parse12hToMinutes("12:00 AM")).toBe(0);
    expect(parse12hToMinutes("12:00 PM")).toBe(720);
    expect(parse12hToMinutes("5:12 AM")).toBe(5 * 60 + 12);
    expect(parse12hToMinutes("7:39 PM")).toBe(19 * 60 + 39);
  });
  it("returns null for bad input", () => {
    expect(parse12hToMinutes("not a time")).toBeNull();
    expect(parse12hToMinutes("")).toBeNull();
  });
});

describe("detectFiringPrayer", () => {
  it("returns the prayer when 'now' matches", () => {
    const now = new Date(); now.setHours(12, 27, 0, 0);
    expect(detectFiringPrayer(mockPrayers, now)?.name).toBe("Dhuhr");
  });
  it("returns null when no prayer matches", () => {
    const now = new Date(); now.setHours(2, 0, 0, 0);
    expect(detectFiringPrayer(mockPrayers, now)).toBeNull();
  });
  it("honors tolerance window", () => {
    const now = new Date(); now.setHours(12, 29, 0, 0);
    expect(detectFiringPrayer(mockPrayers, now, 0)).toBeNull();
    expect(detectFiringPrayer(mockPrayers, now, 2)?.name).toBe("Dhuhr");
  });
});

describe("useAzanAutoPlay navigation", () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it("navigates to /azan/now when a prayer time hits", async () => {
    const fixed = new Date(); fixed.setHours(12, 27, 0, 0);
    vi.setSystemTime(fixed);

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="*" element={<Harness />} />
        </Routes>
      </MemoryRouter>,
    );

    await act(async () => { vi.advanceTimersByTime(20001); });
    await waitFor(() => {
      expect(screen.getByTestId("loc").textContent).toContain("/azan/now");
      expect(screen.getByTestId("loc").textContent).toContain("prayer=Dhuhr");
      expect(screen.getByTestId("loc").textContent).toContain("auto=1");
    });
  });
});

// ---- Reciter selection / playback ----
import { RECITERS, getReciter, getSavedReciterId, saveReciterId } from "@/lib/reciters";
import AzanFullscreen from "@/pages/AzanFullscreen";
import { HelmetProvider } from "react-helmet-async";

describe("Reciter library", () => {
  beforeEach(() => { localStorage.clear(); });
  it("defaults to the first reciter", () => {
    expect(getSavedReciterId()).toBe(RECITERS[0].id);
    expect(getReciter().id).toBe(RECITERS[0].id);
  });
  it("persists selection", () => {
    saveReciterId("alqatami");
    expect(getSavedReciterId()).toBe("alqatami");
    expect(getReciter().name).toBe("Nasser Al Qatami");
  });
  it("falls back to first when id unknown", () => {
    expect(getReciter("nonexistent").id).toBe(RECITERS[0].id);
  });
});

describe("AzanFullscreen playback", () => {
  beforeEach(() => {
    localStorage.clear();
    // jsdom stubs for HTMLMediaElement
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  it("loads the chosen reciter's audio URL and toggles playback", async () => {
    saveReciterId("makkah");
    const expected = RECITERS.find(r => r.id === "makkah")!.url;

    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/azan/now?prayer=Dhuhr"]}>
          <Routes>
            <Route path="/azan/now" element={<AzanFullscreen />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );

    const audio = document.querySelector("audio") as HTMLAudioElement;
    expect(audio).toBeTruthy();
    await waitFor(() => expect(audio.src).toContain(expected.split("/").pop()!));

    // Tap "Pray Now" -> play() called
    fireEvent.click(screen.getByRole("button", { name: /Pray Now/i }));
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
  });

  it("auto-plays when ?auto=1 is set", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/azan/now?prayer=Dhuhr&auto=1"]}>
          <Routes>
            <Route path="/azan/now" element={<AzanFullscreen />} />
          </Routes>
        </MemoryRouter>
      </HelmetProvider>,
    );
    await waitFor(() => expect(HTMLMediaElement.prototype.play).toHaveBeenCalled());
  });
});
