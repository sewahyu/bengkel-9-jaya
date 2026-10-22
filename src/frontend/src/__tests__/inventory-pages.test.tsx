import type { Alat, Sparepart } from "@/types";
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
  {
    id: 2n,
    nama: "Multimeter",
    kategori: "Kelistrikan",
    jumlahTotal: 2n,
    jumlahTersedia: 0n,
    keterangan: "Untuk praktik kelistrikan",
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
  {
    id: 2n,
    nama: "Oli Mesin",
    kode: "SP-OLI-001",
    kategori: "Oli & Pelumas",
    jumlahStok: 1n,
    satuan: "liter",
    ambangMinimum: 3n,
  },
];

beforeEach(() => {
  vi.resetModules();
});

describe("Sparepart list", () => {
  it("renders the list and filters by search text", async () => {
    mockCoreInfrastructure(
      createMockActor({ listSparepart: vi.fn(async () => sparepart) }),
    );
    const { Sparepart: Page } = await import("@/pages/Sparepart");
    renderWithRouter(<Page />, "/sparepart");

    expect(await screen.findByText("Busi NGK")).toBeInTheDocument();
    expect(screen.getByText("Oli Mesin")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByTestId("sparepart.search_input"), "Oli");

    expect(screen.getByText("Oli Mesin")).toBeInTheDocument();
    expect(screen.queryByText("Busi NGK")).not.toBeInTheDocument();
  });

  it("applies a category filter from the URL", async () => {
    mockCoreInfrastructure(
      createMockActor({ listSparepart: vi.fn(async () => sparepart) }),
    );
    const { Sparepart: Page } = await import("@/pages/Sparepart");
    renderWithRouter(<Page />, "/sparepart?kategori=Busi%20%26%20Pengapian");

    expect(await screen.findByText("Busi NGK")).toBeInTheDocument();
    expect(screen.queryByText("Oli Mesin")).not.toBeInTheDocument();
  });

  it("links each item to its detail page", async () => {
    mockCoreInfrastructure(
      createMockActor({ listSparepart: vi.fn(async () => sparepart) }),
    );
    const { Sparepart: Page } = await import("@/pages/Sparepart");
    renderWithRouter(<Page />, "/sparepart");

    const item = await screen.findByTestId("sparepart.item.1");
    expect(item).toHaveAttribute("href", "/sparepart/1");
  });
});

describe("Alat list", () => {
  it("renders the list and filters by search text", async () => {
    mockCoreInfrastructure(
      createMockActor({ listAlat: vi.fn(async () => alat) }),
    );
    const { Alat: Page } = await import("@/pages/Alat");
    renderWithRouter(<Page />, "/alat");

    expect(await screen.findByText("Kunci T")).toBeInTheDocument();
    expect(screen.getByText("Multimeter")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(screen.getByTestId("alat.search_input"), "Multimeter");

    expect(screen.getByText("Multimeter")).toBeInTheDocument();
    expect(screen.queryByText("Kunci T")).not.toBeInTheDocument();
  });

  it("applies a category filter from the URL", async () => {
    mockCoreInfrastructure(
      createMockActor({ listAlat: vi.fn(async () => alat) }),
    );
    const { Alat: Page } = await import("@/pages/Alat");
    renderWithRouter(<Page />, "/alat?kategori=Kelistrikan");

    expect(await screen.findByText("Multimeter")).toBeInTheDocument();
    expect(screen.queryByText("Kunci T")).not.toBeInTheDocument();
  });

  it("links each item to its detail page", async () => {
    mockCoreInfrastructure(
      createMockActor({ listAlat: vi.fn(async () => alat) }),
    );
    const { Alat: Page } = await import("@/pages/Alat");
    renderWithRouter(<Page />, "/alat");

    const item = await screen.findByTestId("alat.item.1");
    expect(item).toHaveAttribute("href", "/alat/1");
  });
});

describe("Detail pages", () => {
  it("shows a sparepart detail with its stock and mutation history", async () => {
    mockCoreInfrastructure(
      createMockActor({
        getSparepart: vi.fn(async () => sparepart[0]),
        listMutasiStok: vi.fn(async () => [
          {
            id: 1n,
            sparepartId: 1n,
            jenis: "masuk" as const,
            jumlah: 10n,
            keterangan: "Restock",
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
    expect(screen.getAllByText("SP-BUS-001").length).toBeGreaterThan(0);
    expect(await screen.findByText("Restock")).toBeInTheDocument();
  });

  it("shows an alat detail with total, available, and borrowed counts", async () => {
    mockCoreInfrastructure(
      createMockActor({ getAlat: vi.fn(async () => alat[1]) }),
    );
    const { AlatDetail } = await import("@/pages/AlatDetail");
    renderWithRouter(<AlatDetail />, "/alat/2");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Multimeter" }),
    ).toBeInTheDocument();
    const dipinjam = screen.getByText("Dipinjam").closest("div");
    expect(within(dipinjam as HTMLElement).getByText("2")).toBeInTheDocument();
  });
});
