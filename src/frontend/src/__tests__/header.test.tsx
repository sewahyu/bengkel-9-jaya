import { APP_NAME, JURUSAN_NAME, NAV_ITEMS } from "@/lib/constants";
import { screen, waitFor, within } from "@testing-library/react";
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
 * Cover for the accepted header redesign: the title is now APP_NAME
 * ("Bengkel 9 Jaya") and the brand mark shows the SMKN 9 Malang logo instead
 * of the old Wrench icon.
 */
describe("Header brand identity", () => {
  it("shows the accepted app title in the brand link", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const brand = await screen.findByTestId("nav.brand_link");
    expect(within(brand).getByText(APP_NAME)).toBeInTheDocument();
    expect(APP_NAME).toBe("Bengkel 9 Jaya");
  });

  it("shows the SMKN 9 Malang logo instead of the wrench icon", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const brand = await screen.findByTestId("nav.brand_link");
    const logo = within(brand).getByAltText("Lambang SMK Negeri 9 Malang");
    expect(logo.tagName).toBe("IMG");
    expect(logo).toHaveAttribute("src", "/assets/images/smkn9-malang-logo.png");
    expect(logo).toHaveAttribute("width", "194");
    expect(logo).toHaveAttribute("height", "300");
  });
});

/**
 * Characterization of the header's adjacent working behavior. The accepted
 * request intentionally changes the brand title text and the brand icon, so
 * neither is asserted here; navigation, the brand link, the jurusan subtitle,
 * and the auth controls are the behavior that must survive the redesign.
 */
describe("Header navigation", () => {
  it("renders the header landmark with the brand link and jurusan subtitle", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const header = await screen.findByTestId("nav.header");
    expect(header.tagName).toBe("HEADER");

    const brand = within(header).getByTestId("nav.brand_link");
    expect(brand.tagName).toBe("A");
    expect(brand).toHaveAttribute("href", "/");
    expect(within(brand).getByText(JURUSAN_NAME)).toBeInTheDocument();
  });

  it("renders every nav item as a link to its route", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const nav = await screen.findByRole("navigation", {
      name: "Navigasi utama",
    });
    for (const item of NAV_ITEMS) {
      const ocid = `nav.link.${item.to === "/" ? "beranda" : item.to.slice(1)}`;
      const link = within(nav).getByTestId(ocid);
      expect(link).toHaveAttribute("href", item.to);
      expect(link).toHaveTextContent(item.label);
    }
  });

  it("exposes Trainer and Alat as separate public entries", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const nav = await screen.findByRole("navigation", {
      name: "Navigasi utama",
    });
    const trainer = within(nav).getByTestId("nav.link.trainer");
    const alat = within(nav).getByTestId("nav.link.alat");
    expect(trainer).toHaveAttribute("href", "/trainer");
    expect(trainer).toHaveTextContent("Trainer");
    expect(alat).toHaveAttribute("href", "/alat");
    expect(alat).toHaveTextContent("Alat");
  });

  it("marks the active route and dims the inactive ones", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/jadwal");

    const nav = await screen.findByRole("navigation", {
      name: "Navigasi utama",
    });
    const active = within(nav).getByTestId("nav.link.jadwal");
    expect(active.className).toContain("text-foreground");

    const inactive = within(nav).getByTestId("nav.link.beranda");
    expect(inactive.className).toContain("text-muted-foreground");
  });
});

describe("Header auth controls", () => {
  it("links an unauthenticated visitor to the admin login", async () => {
    mockCoreInfrastructure(createMockActor(), { session: null });
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    // While the session query is loading the control is a disabled button; wait
    // for the settled unauthenticated state, which renders the link.
    await waitFor(() =>
      expect(screen.getByTestId("nav.login_link")).toHaveAttribute(
        "href",
        "/admin",
      ),
    );
    expect(screen.getByTestId("nav.login_link")).toHaveTextContent(
      "Login Admin",
    );
  });

  it("shows the admin panel and logout for an authenticated admin", async () => {
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: true,
    });
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    expect(await screen.findByTestId("nav.admin_link")).toHaveAttribute(
      "href",
      "/admin",
    );
    expect(screen.getByTestId("nav.logout_button")).toBeInTheDocument();
  });

  it("hides the admin panel from an authenticated non-admin", async () => {
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: false,
    });
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    expect(await screen.findByTestId("nav.logout_button")).toBeInTheDocument();
    expect(screen.queryByTestId("nav.admin_link")).not.toBeInTheDocument();
  });
});

describe("Header mobile menu", () => {
  it("opens the sheet with the mobile nav links", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Header } = await import("@/components/Header");
    renderWithRouter(<Header />, "/");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("nav.mobile_menu_button"));

    const nav = await screen.findByRole("navigation", {
      name: "Navigasi mobile",
    });
    for (const item of NAV_ITEMS) {
      const ocid = `nav.mobile_link.${item.to === "/" ? "beranda" : item.to.slice(1)}`;
      expect(within(nav).getByTestId(ocid)).toHaveTextContent(item.label);
    }
  });
});
