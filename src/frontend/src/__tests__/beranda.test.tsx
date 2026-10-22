import {
  GALERI_BERANDA,
  INSTAGRAM_HANDLE,
  STRUKTUR_ORGANISASI,
} from "@/lib/constants";
import { todayIso } from "@/lib/format";
import type { Berita, PeminjamanLab } from "@/types";
import { StatusPeminjamanLab, SumberBerita } from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

/**
 * Cover for the accepted Beranda additions: the monthly lab calendar with
 * month navigation and per-day detail, the TSM org structure, the "Berita
 * Terkini" section with its manual fallback, the decorative gallery, and the
 * "Unit Trainer" wording.
 *
 * The backend is a typed local mock; the Instagram feed is a stubbed global
 * fetch, so no external network call is made.
 */

// The calendar opens on the current month, so the booking is dated inside it.
const TANGGAL_BOOKING = todayIso();

const peminjamanLab: PeminjamanLab[] = [
  {
    id: 9n,
    lab: "Lab 1 Chasis",
    status: StatusPeminjamanLab.menunggu,
    jamSelesai: "09:00",
    keperluan: "Praktik pembongkaran mesin",
    tanggal: TANGGAL_BOOKING,
    namaPeminjam: "Dwi Anggraini",
    jamMulai: "07:00",
    waktuDibuat: 0n,
    kelas: "XI TSM 1",
  },
];

const beritaManual: Berita[] = [
  {
    id: 4n,
    judul: "Bengkel 9 Jaya Juara LKS",
    ringkasan: "Tim TSM menjuarai LKS tingkat provinsi.",
    gambarUrl: "",
    tautan: "https://www.instagram.com/p/abc",
    tanggal: "2026-03-01",
    sumber: SumberBerita.manual,
  },
];

beforeEach(() => {
  vi.resetModules();
});

describe("Beranda kalender lab", () => {
  it("renders the calendar and shows a booking on its date", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => peminjamanLab),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    // The calendar section and its day cells render.
    expect(
      await screen.findByTestId("beranda.kalender_section"),
    ).toBeInTheDocument();
    const sel = await screen.findByTestId(
      `beranda.kalender.day.${TANGGAL_BOOKING}`,
    );
    expect(sel).toHaveTextContent("Lab 1 Chasis");
  });

  it("shows the booking detail when a date is clicked", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => peminjamanLab),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    const user = userEvent.setup();
    await user.click(
      await screen.findByTestId(`beranda.kalender.day.${TANGGAL_BOOKING}`),
    );

    const detail = await screen.findByTestId("beranda.kalender.detail_panel");
    expect(detail).toHaveTextContent("Dwi Anggraini");
    expect(detail).toHaveTextContent("07:00–09:00");
    expect(detail).toHaveTextContent("Praktik pembongkaran mesin");
  });

  it("moves to the next month and clears the selected date", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => peminjamanLab),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    const user = userEvent.setup();
    await user.click(
      await screen.findByTestId(`beranda.kalender.day.${TANGGAL_BOOKING}`),
    );
    expect(
      await screen.findByTestId("beranda.kalender.detail_panel"),
    ).toHaveTextContent("Dwi Anggraini");

    await user.click(screen.getByTestId("beranda.kalender.pagination_next"));

    // The detail panel resets to its empty prompt after a month change.
    await waitFor(() =>
      expect(
        screen.getByTestId("beranda.kalender.detail.empty_state"),
      ).toBeInTheDocument(),
    );
  });
});

describe("Beranda struktur organisasi", () => {
  it("renders every org node with its jabatan and nama", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    const chart = await screen.findByTestId("beranda.struktur.chart");
    for (const node of STRUKTUR_ORGANISASI) {
      expect(within(chart).getByText(node.jabatan)).toBeInTheDocument();
      expect(within(chart).getByText(node.nama)).toBeInTheDocument();
    }
  });
});

describe("Beranda berita terkini", () => {
  it("falls back to manual news when no feed URL is set", async () => {
    mockCoreInfrastructure(
      createMockActor({
        getFeedUrl: vi.fn(async () => ""),
        listBerita: vi.fn(async () => beritaManual),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    const section = await screen.findByTestId("beranda.berita_section");
    expect(within(section).getByText(INSTAGRAM_HANDLE)).toBeInTheDocument();
    expect(
      await within(section).findByText("Bengkel 9 Jaya Juara LKS"),
    ).toBeInTheDocument();
  });

  it("shows the empty state when there is no feed and no manual news", async () => {
    mockCoreInfrastructure(
      createMockActor({
        getFeedUrl: vi.fn(async () => ""),
        listBerita: vi.fn(async () => []),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    expect(
      await screen.findByTestId("beranda.berita.empty_state"),
    ).toBeInTheDocument();
  });
});

describe("Beranda hero dan galeri", () => {
  it("renders the hero, the decorative gallery, and the Unit Trainer wording", async () => {
    mockCoreInfrastructure(createMockActor());
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    expect(await screen.findByTestId("beranda.hero")).toBeInTheDocument();
    expect(screen.getByTestId("beranda.galeri_section")).toBeInTheDocument();
    for (let i = 0; i < GALERI_BERANDA.length; i += 1) {
      expect(
        screen.getByTestId(`beranda.galeri.item.${i + 1}`),
      ).toBeInTheDocument();
    }

    // The accepted wording replaces "Unit" with "Unit Trainer".
    expect(screen.getByText("Jenis Unit Trainer")).toBeInTheDocument();
    expect(screen.getByText("Unit Trainer Tersedia")).toBeInTheDocument();
  });
});
