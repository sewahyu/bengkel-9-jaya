import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

beforeEach(() => {
  vi.resetModules();
});

/**
 * Cover for the accepted auth change: the admin login is a built-in
 * username/password form backed by `login`/`getSession`, replacing the Internet
 * Identity button.
 */
describe("AdminLogin form", () => {
  it("shows Username and Password fields instead of an Internet Identity button", async () => {
    mockCoreInfrastructure(createMockActor(), { session: null });
    const { AdminLogin } = await import("@/pages/admin/AdminLogin");
    renderWithRouter(<AdminLogin />, "/admin/login");

    expect(await screen.findByTestId("admin.login.form")).toBeInTheDocument();
    expect(
      screen.getByTestId("admin.login.username_input"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin.login.password_input"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /internet identity/i }),
    ).not.toBeInTheDocument();
  });

  it("submits the entered credentials to the backend login", async () => {
    const login = vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: { username: "admin", loginAt: 0n },
    }));
    mockCoreInfrastructure(createMockActor(), { session: null, login });
    const { AdminLogin } = await import("@/pages/admin/AdminLogin");
    renderWithRouter(<AdminLogin />, "/admin/login");

    const user = userEvent.setup();
    // The fields are disabled while the session query is still loading, so wait
    // for the initial session read to settle before typing.
    const usernameInput = await screen.findByTestId(
      "admin.login.username_input",
    );
    await waitFor(() => expect(usernameInput).toBeEnabled());
    await user.type(usernameInput, "admin");
    await user.type(
      screen.getByTestId("admin.login.password_input"),
      "admin01",
    );
    await user.click(screen.getByTestId("admin.login.submit_button"));

    await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
    expect(login).toHaveBeenCalledWith("admin", "admin01");
  });

  it("shows an error message when the credentials are rejected", async () => {
    const login = vi.fn(async () => ({
      __kind__: "invalidCredentials" as const,
      invalidCredentials: null,
    }));
    mockCoreInfrastructure(createMockActor(), { session: null, login });
    const { AdminLogin } = await import("@/pages/admin/AdminLogin");
    renderWithRouter(<AdminLogin />, "/admin/login");

    const user = userEvent.setup();
    const usernameInput = await screen.findByTestId(
      "admin.login.username_input",
    );
    await waitFor(() => expect(usernameInput).toBeEnabled());
    await user.type(usernameInput, "admin");
    await user.type(screen.getByTestId("admin.login.password_input"), "salah");
    await user.click(screen.getByTestId("admin.login.submit_button"));

    expect(
      await screen.findByTestId("admin.login.error_state"),
    ).toHaveTextContent("Username atau password salah.");
  });

  it("shows the admin status panel for an existing session", async () => {
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: true,
    });
    const { AdminLogin } = await import("@/pages/admin/AdminLogin");
    renderWithRouter(<AdminLogin />, "/admin/login");

    expect(
      await screen.findByTestId("admin.login.status_panel"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("admin.login.form")).not.toBeInTheDocument();
  });
});

/**
 * The session is read from the backend on mount, so a reload that still has a
 * session renders the admin panel rather than the login form.
 */
describe("AdminGuard session", () => {
  it("does not render admin content for a visitor without a session", async () => {
    mockCoreInfrastructure(createMockActor(), { session: null });
    const { AdminGuard } = await import("@/components/AdminGuard");
    renderWithRouter(
      <AdminGuard>
        <p>Konten rahasia</p>
      </AdminGuard>,
      "/admin",
    );

    expect(
      await screen.findByTestId("admin.guard.login_panel"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Konten rahasia")).not.toBeInTheDocument();
  });

  it("renders admin content when the backend reports a session", async () => {
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: true,
    });
    const { AdminGuard } = await import("@/components/AdminGuard");
    renderWithRouter(
      <AdminGuard>
        <p>Konten rahasia</p>
      </AdminGuard>,
      "/admin",
    );

    expect(await screen.findByText("Konten rahasia")).toBeInTheDocument();
  });
});

/**
 * The accepted logout ends the session through the backend `logout` method.
 */
describe("Header logout", () => {
  it("calls the backend logout when Keluar is clicked", async () => {
    const logout = vi.fn(async () => undefined);
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: true,
      logout,
    });
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("nav.logout_button"));

    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
  });
});
