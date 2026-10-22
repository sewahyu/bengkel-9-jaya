import { JURUSAN_NAME, TATA_TERTIB } from "@/lib/constants";
import type { Alat, JadwalUpj, Sparepart } from "@/types";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

const alat: Alat[] = [
  {
    id: 1n,
    nama: "Kunci T",
    kategori: "Peralatan Tangan",
    jumlahTotal: 5n,
    jumlahTersedia: 5n,
    keterangan: "Set lengkap",
  },
];

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

const jadwal: JadwalUpj[] = [
  {
    id: 1n,
    hari: "Senin",
    tanggal: "2026-03-02",
    namaSiswa: "Andi Saputra",
    kelas: "XI TSM 1",
    tugas: "Menyapu area bengkel",
  },
  {
    id: 2n,
    hari: "Selasa",
    tanggal: "2026-03-03",
    namaSiswa: "Budi Santoso",
    kelas: "XII TSM 2",
    tugas: "Merapikan alat",
  },
];

beforeEach(() => {
  vi.resetModules();
});

describe("Beranda", () => {
  it("renders the jurusan identity and the tata tertib as a numbered list", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        listSparepart: vi.fn(async () => sparepart),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    expect(
      await screen.findByRole("heading", { level: 1, name: JURUSAN_NAME }),
    ).toBeInTheDocument();

    const list = await screen.findByTestId("beranda.tata_tertib_list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(TATA_TERTIB.length);
    expect(items[0]).toHaveTextContent(TATA_TERTIB[0]);
  });

  it("shows the sparepart stock table once data loads", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        listSparepart: vi.fn(async () => sparepart),
      }),
    );
    const { Beranda } = await import("@/pages/Beranda");
    renderWithRouter(<Beranda />, "/");

    expect(await screen.findByText("Busi NGK")).toBeInTheDocument();
  });
});

describe("TataTertib", () => {
  it("lists every rule as an ordered list item", async () => {
    mockCoreInfrastructure(createMockActor());
    const { TataTertib } = await import("@/pages/TataTertib");
    renderWithRouter(<TataTertib />, "/tata-tertib");

    const list = await screen.findByTestId("tata_tertib.list");
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(TATA_TERTIB.length);
    expect(items[items.length - 1]).toHaveTextContent(
      TATA_TERTIB[TATA_TERTIB.length - 1],
    );
  });
});

describe("Jadwal", () => {
  it("shows piket per siswa grouped by day with no edit controls", async () => {
    mockCoreInfrastructure(
      createMockActor({ listJadwal: vi.fn(async () => jadwal) }),
    );
    const { Jadwal } = await import("@/pages/Jadwal");
    renderWithRouter(<Jadwal />, "/jadwal");

    expect(await screen.findByText("Andi Saputra")).toBeInTheDocument();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("Senin")).toBeInTheDocument();
    expect(screen.getByText("Selasa")).toBeInTheDocument();

    // Read-only: no edit/delete affordances on the public page.
    expect(
      screen.queryByRole("button", { name: /ubah|hapus|edit|delete/i }),
    ).not.toBeInTheDocument();
  });

  it("filters the schedule by student name", async () => {
    mockCoreInfrastructure(
      createMockActor({ listJadwal: vi.fn(async () => jadwal) }),
    );
    const { Jadwal } = await import("@/pages/Jadwal");
    renderWithRouter(<Jadwal />, "/jadwal");

    await screen.findByText("Andi Saputra");
    const user = userEvent.setup();
    await user.type(screen.getByTestId("jadwal.search_input"), "Budi");

    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.queryByText("Andi Saputra")).not.toBeInTheDocument();
  });
});
