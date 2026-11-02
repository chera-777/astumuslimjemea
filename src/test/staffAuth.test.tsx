import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminSignInForm, CommitteeSignInForm } from "@/components/auth/StaffAuthDialog";

const mocks = vi.hoisted(() => ({ signIn: vi.fn(), getUser: vi.fn(), signOut: vi.fn(), roles: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { signInWithPassword: mocks.signIn, getUser: mocks.getUser, signOut: mocks.signOut }, from: () => ({ select: () => ({ eq: mocks.roles }) }) } }));

describe("Independent staff authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signIn.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "verified-user" } }, error: null });
    mocks.signOut.mockResolvedValue({ error: null });
  });
  afterEach(cleanup);
  const fill = () => { fireEvent.change(screen.getByLabelText("Email"), { target: { value: "account@example.com" } }); fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } }); };
  it("routes an assigned admin to Admin only after revalidating their identity", async () => {
    mocks.roles.mockResolvedValue({ data: [{ role: "student" }, { role: "admin" }], error: null });
    const done = vi.fn(); render(<AdminSignInForm onSignedIn={done} onBusyChange={vi.fn()} />); fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in to Admin" }));
    await waitFor(() => expect(done).toHaveBeenCalledWith("/admin"));
    expect(mocks.getUser).toHaveBeenCalledOnce();
    expect(mocks.roles).toHaveBeenCalledWith("user_id", "verified-user");
  });
  it("routes an assigned committee member to Committee", async () => {
    mocks.roles.mockResolvedValue({ data: [{ role: "student" }, { role: "committee" }], error: null });
    const done = vi.fn(); render(<CommitteeSignInForm onSignedIn={done} onBusyChange={vi.fn()} />); fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in to Committee" }));
    await waitFor(() => expect(done).toHaveBeenCalledWith("/portal/committee"));
  });
  it("signs students back out of staff forms without routing them into a staff portal", async () => {
    mocks.roles.mockResolvedValue({ data: [{ role: "student" }], error: null });
    const done = vi.fn(); render(<AdminSignInForm onSignedIn={done} onBusyChange={vi.fn()} />); fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in to Admin" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(done).not.toHaveBeenCalled();
  });
  it("fails closed when role records cannot be read", async () => {
    mocks.roles.mockResolvedValue({ data: null, error: new Error("unavailable") });
    const done = vi.fn(); render(<CommitteeSignInForm onSignedIn={done} onBusyChange={vi.fn()} />); fill();
    fireEvent.click(screen.getByRole("button", { name: "Sign in to Committee" }));
    await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
    expect(mocks.signOut).toHaveBeenCalledOnce();
    expect(done).not.toHaveBeenCalled();
  });
});