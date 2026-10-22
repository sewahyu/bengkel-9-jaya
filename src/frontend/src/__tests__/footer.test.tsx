import { Footer } from "@/components/Footer";
import { APP_NAME, JURUSAN_NAME, SEKOLAH_NAME } from "@/lib/constants";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithProviders,
  renderWithRouter,
} from "./test-utils";

beforeEach(() => {
  vi.resetModules();
});

describe("Footer identity", () => {
  it("renders the studio identity inside the footer landmark", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByTestId("footer.section");
    expect(footer.tagName).toBe("FOOTER");

    // The studio wordmark and the jurusan/sekolah identity are the footer's
    // existing content; the footer redesign must keep them visible.
    expect(within(footer).getByText(APP_NAME)).toBeInTheDocument();
    expect(within(footer).getAllByText(JURUSAN_NAME).length).toBeGreaterThan(0);
    expect(within(footer).getAllByText(SEKOLAH_NAME).length).toBeGreaterThan(0);
  });

  it("keeps the caffeine.ai attribution link", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByTestId("footer.section");
    const link = within(footer).getByRole("link", { name: "caffeine.ai" });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("https://caffeine.ai"),
    );
  });

  it("shows the current year in the copyright line", () => {
    renderWithProviders(<Footer />);

    const footer = screen.getByTestId("footer.section");
    const year = new Date().getFullYear().toString();
    expect(
      within(footer).getAllByText(new RegExp(year)).length,
    ).toBeGreaterThan(0);
  });
});

describe("Footer partner banner", () => {
  it("renders the five-logo banner from the uploaded asset", () => {
    renderWithProviders(<Footer />);

    const banner = screen.getByAltText(
      "Banner lima logo: Universitas Negeri Malang, UM Excellence in Learning Innovation, LP3, UM Mengajar, dan SMK Negeri 9 Malang",
    );
    expect(banner.tagName).toBe("IMG");
    expect(banner).toHaveAttribute(
      "src",
      "/assets/images/um-five-logo-banner.jpg",
    );
  });

  it("keeps the banner proportional inside a light container", () => {
    renderWithProviders(<Footer />);

    const banner = screen.getByAltText(
      "Banner lima logo: Universitas Negeri Malang, UM Excellence in Learning Innovation, LP3, UM Mengajar, dan SMK Negeri 9 Malang",
    );
    // Intrinsic dimensions let the browser reserve a proportional box; the
    // object-contain class prevents stretching when the rendered height is
    // constrained.
    expect(banner).toHaveAttribute("width", "1200");
    expect(banner).toHaveAttribute("height", "200");
    expect(banner.className).toContain("object-contain");

    const container = screen.getByTestId("footer.logo");
    expect(container).toContainElement(banner);
    expect(container.className).toContain("bg-background");
  });
});

describe("Footer creator credit", () => {
  it("shows the creator credit line", () => {
    renderWithProviders(<Footer />);

    const credit = screen.getByTestId("footer.credit");
    expect(credit).toHaveTextContent(
      "Pencipta: Shendy Wahyu Pratama, Universitas Negeri Malang",
    );
  });
});

describe("Layout shell", () => {
  it("renders the footer below the main content", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Layout } = await import("@/components/Layout");
    renderWithRouter(
      <Layout>
        <p>Konten halaman</p>
      </Layout>,
      "/",
    );

    const shell = await screen.findByTestId("app.shell");
    const main = screen.getByTestId("app.main");
    const footer = screen.getByTestId("footer.section");

    expect(shell).toContainElement(main);
    expect(shell).toContainElement(footer);
    expect(within(main).getByText("Konten halaman")).toBeInTheDocument();
    expect(within(footer).getByText(APP_NAME)).toBeInTheDocument();
  });
});
