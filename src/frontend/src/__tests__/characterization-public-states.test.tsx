import type { Sparepart } from "@/types";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

/**
 * Characterization of the public Sparepart and Jadwal pages, which the accepted
 * request does not intentionally change ("fitur lama ... tetap berfungsi").
 *
 * The request splits the single "alat" inventory into Trainer and Alat, changes
 * the public nav labels/routes, and retargets anonymous self-service borrowing.
 * None of that touches the sparepart stock pages or the read-only piket
 * schedule, so the empty, not-found, and mutation-history states below are the
 * adjacent behavior that must survive those edits.
 *
 * The backend is a typed local mock; these tests assert the frontend's
 * observable rendering, not the canister's own data.
 */

const sparepart: Sparepart[] = [
  {
    id: 1n,
    nama: "Busi NGK",
    kode: "SP-BUS-001",
    kategori: "Busi & Pengapian",
    jumlahStok: 10n,
    satuan: "pcs",
    ambangMinimum: 2n,
  },
];

beforeEach(() => {
  vi.resetModules();
});

describe("Sparepart list empty states", () => {
  it("shows the no-data prompt when the inventory is empty", async () => {
    mockCoreInfrastructure(
      createMockActor({ listSparepart: vi.fn(async () => []) }),
    );
    const { Sparepart: Page } = await import("@/pages/Sparepart");
    renderWithRouter(<Page />, "/sparepart");

    const empty = await screen.findByTestId("sparepart.empty_state");
    expect(empty).toHaveTextContent("Belum ada data sparepart");
    // With no active filter there is no reset affordance.
    expect(
      screen.queryByTestId("sparepart.empty_reset_button"),
    ).not.toBeInTheDocument();
  });

  it("shows the filtered-empty prompt with a reset action", async () => {
    mockCoreInfrastructure(
      createMockActor({ listSparepart: vi.fn(async () => sparepart) }),
    );
    const { Sparepart: Page } = await import("@/pages/Sparepart");
    renderWithRouter(<Page />, "/sparepart");

    await screen.findByText("Busi NGK");
    const user = userEvent.setup();
    await user.type(screen.getByTestId("sparepart.search_input"), "tidak-ada");

    const empty = await screen.findByTestId("sparepart.empty_state");
    expect(empty).toHaveTextContent("Sparepart tidak ditemukan");
    expect(
      screen.getByTestId("sparepart.empty_reset_button"),
    ).toBeInTheDocument();
  });
});

describe("Sparepart detail states", () => {
  it("shows the not-found state when the sparepart does not exist", async () => {
    mockCoreInfrastructure(
      createMockActor({ getSparepart: vi.fn(async () => null) }),
    );
    const { SparepartDetail } = await import("@/pages/SparepartDetail");
    renderWithRouter(<SparepartDetail />, "/sparepart/99");

    const notFound = await screen.findByTestId(
      "sparepart_detail.not_found_state",
    );
    expect(notFound).toHaveTextContent("Sparepart tidak ditemukan");
    expect(
      within(notFound).getByTestId("sparepart_detail.back_button"),
    ).toHaveAttribute("href", "/sparepart");
  });

  it("shows the mutation empty state when there is no stock history", async () => {
    mockCoreInfrastructure(
      createMockActor({
        getSparepart: vi.fn(async () => sparepart[0]),
        listMutasiStok: vi.fn(async () => []),
      }),
    );
    const { SparepartDetail } = await import("@/pages/SparepartDetail");
    renderWithRouter(<SparepartDetail />, "/sparepart/1");

    expect(
      await screen.findByTestId("sparepart_detail.mutasi.empty_state"),
    ).toHaveTextContent("Belum ada riwayat mutasi stok");
  });

  it("renders the stock, info rows, and a mutation row", async () => {
    mockCoreInfrastructure(
      createMockActor({
        getSparepart: vi.fn(async () => sparepart[0]),
        listMutasiStok: vi.fn(async () => [
          {
            id: 1n,
            sparepartId: 1n,
            jenis: "masuk" as const,
            jumlah: 10n,
            keterangan: "Restock gudang",
            waktu: 1_772_000_000_000_000_000n,
          },
        ]),
      }),
    );
    const { SparepartDetail } = await import("@/pages/SparepartDetail");
    renderWithRouter(<SparepartDetail />, "/sparepart/1");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Busi NGK" }),
    ).toBeInTheDocument();
    // The code appears in the header and again in the info card.
    expect(screen.getAllByText("SP-BUS-001").length).toBeGreaterThan(0);
    expect(screen.getByText("Busi & Pengapian")).toBeInTheDocument();
    expect(screen.getAllByText("pcs").length).toBeGreaterThan(0);

    const row = await screen.findByTestId("sparepart_detail.mutasi.row.1");
    expect(row).toHaveTextContent("Masuk");
    expect(row).toHaveTextContent("Restock gudang");
  });
});

describe("Jadwal empty states", () => {
  it("shows the no-data prompt when no piket entries exist", async () => {
    mockCoreInfrastructure(
      createMockActor({ listJadwal: vi.fn(async () => []) }),
    );
    const { Jadwal } = await import("@/pages/Jadwal");
    renderWithRouter(<Jadwal />, "/jadwal");

    const empty = await screen.findByTestId("jadwal.empty_state");
    expect(empty).toHaveTextContent("Belum ada jadwal piket");
  });

  it("shows the filtered-empty prompt when the search matches nothing", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listJadwal: vi.fn(async () => [
          {
            id: 1n,
            hari: "Senin",
            tanggal: "2026-03-02",
            namaSiswa: "Andi Saputra",
            kelas: "XI TSM 1",
            tugas: "Menyapu area bengkel",
          },
        ]),
      }),
    );
    const { Jadwal } = await import("@/pages/Jadwal");
    renderWithRouter(<Jadwal />, "/jadwal");

    await screen.findByText("Andi Saputra");
    const user = userEvent.setup();
    await user.type(screen.getByTestId("jadwal.search_input"), "tidak-ada");

    const empty = await screen.findByTestId("jadwal.empty_state");
    expect(empty).toHaveTextContent("Jadwal tidak ditemukan");
  });
});
