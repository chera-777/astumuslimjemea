import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ProfileDetailsEditor } from "@/components/ProfileDetailsEditor";

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn(),
  profile: { id: "student-123", full_name: "Chera Kemal", phone: "123", gender: "male", university_id: "ASTU", department: "Computing", batch_year: "2026", student_id: "OLD-ID", profile_photo_url: null, id_card_url: null },
}));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "student-123" }, profile: mocks.profile, refreshProfile: mocks.refresh }) }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: () => ({ update: mocks.update }) } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));

describe("Profile editor persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ single: mocks.single });
    mocks.single.mockResolvedValue({ data: { id: "student-123" }, error: null });
    mocks.refresh.mockResolvedValue(undefined);
  });
  afterEach(cleanup);
  it("updates the signed-in student's ID, then refreshes the displayed profile", async () => {
    const close = vi.fn();
    render(<ProfileDetailsEditor open onOpenChange={close} />);
    expect(screen.getByLabelText("Full name")).toHaveValue("Chera Kemal");
    fireEvent.click(screen.getByRole("button", { name: "Next profile section" }));
    expect(screen.getByLabelText("Student ID")).toHaveValue("OLD-ID");
    fireEvent.change(screen.getByLabelText("Student ID"), { target: { value: "ASTU-2026-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(close).toHaveBeenCalledWith(false));
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ student_id: "ASTU-2026-123" }));
    expect(mocks.eq).toHaveBeenCalledWith("id", "student-123");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });
  it("keeps edits and reports save errors rather than claiming success", async () => {
    mocks.single.mockResolvedValue({ data: null, error: new Error("Could not save") });
    const close = vi.fn();
    render(<ProfileDetailsEditor open onOpenChange={close} />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Updated Name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not save"));
    expect(screen.getByLabelText("Full name")).toHaveValue("Updated Name");
    expect(close).not.toHaveBeenCalled();
    expect(mocks.refresh).not.toHaveBeenCalled();
  });
});