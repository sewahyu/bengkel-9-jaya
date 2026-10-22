import type { Alat, JadwalUpj, Nota, Sparepart } from "@/types";
import { JenisMutasiStok, JenisNota, StatusPeminjaman } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

/**
 * Characterization of the pre-existing admin CRUD behavior that the accepted
 * request does not intentionally change ("fitur lama ... tetap berfungsi").
 *
 * The request intentionally changes the homepage layout, the "Alat"/"Unit"
 * wording, the public Alat pages (self-service loan entry), and adds Excel
 * export to the admin loan/finance pages. None of those are asserted here; the
 * forms, tables, filters, and actor calls below are the adjacent behavior that
 * must survive those edits.
 */

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
];

const nota: Nota[] = [
  {
    id: 3n,
    tanggal: "2026-02-18",
    keterangan: "Pembelian oli mesin",
    jenis: JenisNota.keluar,
    kategori: "Pembelian",
    nominal: 150_000n,
  },
];

beforeEach(() => {
  vi.resetModules();
});

describe("AdminSparepart CRUD", () => {
  it("adds a sparepart with the entered values", async () => {
    const addSparepart = vi.fn(async () => sparepart[0]);
    mockCoreInfrastructure(
      createMockActor({
        listSparepart: vi.fn(async () => []),
        addSparepart,
      }),
    );
    const { AdminSparepart } = await import("@/pages/admin/AdminSparepart");
    renderWithRouter(<AdminSparepart />, "/admin/sparepart");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("sparepart.nama.input"),
      "Busi NGK",
    );
    await user.type(screen.getByTestId("sparepart.kode.input"), "SP-BUS-001");
    await user.click(screen.getByTestId("sparepart.submit_button"));

    await waitFor(() => expect(addSparepart).toHaveBeenCalledTimes(1));
    expect(addSparepart).toHaveBeenCalledWith(
      "Busi NGK",
      "SP-BUS-001",
      expect.any(String),
      0n,
      "pcs",
      2n,
    );
  });

  it("loads an existing sparepart into the form for editing", async () => {
    mockCoreInfrastructure(
      createMockActor({ listSparepart: vi.fn(async () => sparepart) }),
    );
    const { AdminSparepart } = await import("@/pages/admin/AdminSparepart");
    renderWithRouter(<AdminSparepart />, "/admin/sparepart");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("sparepart.edit_button.1"));

    expect(screen.getByTestId("sparepart.nama.input")).toHaveValue("Busi NGK");
    expect(screen.getByTestId("sparepart.kode.input")).toHaveValue(
      "SP-BUS-001",
    );
    expect(
      screen.getByRole("button", { name: /Perbarui Sparepart/ }),
    ).toBeInTheDocument();
  });

  it("deletes a sparepart through the backend", async () => {
    const deleteSparepart = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        listSparepart: vi.fn(async () => sparepart),
        deleteSparepart,
      }),
    );
    const { AdminSparepart } = await import("@/pages/admin/AdminSparepart");
    renderWithRouter(<AdminSparepart />, "/admin/sparepart");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("sparepart.delete_button.1"));

    await waitFor(() => expect(deleteSparepart).toHaveBeenCalledWith(1n));
  });

  it("records a stock mutation with the selected sparepart and type", async () => {
    const catatMutasiStok = vi.fn(async () => null);
    mockCoreInfrastructure(
      createMockActor({
        listSparepart: vi.fn(async () => sparepart),
        catatMutasiStok,
      }),
    );
    const { AdminSparepart } = await import("@/pages/admin/AdminSparepart");
    renderWithRouter(<AdminSparepart />, "/admin/sparepart");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("mutasi.sparepart.select"));
    await user.click(await screen.findByRole("option", { name: "Busi NGK" }));
    await user.clear(screen.getByTestId("mutasi.jumlah.input"));
    await user.type(screen.getByTestId("mutasi.jumlah.input"), "3");
    await user.type(
      screen.getByTestId("mutasi.keterangan.input"),
      "Restock gudang",
    );
    await user.click(screen.getByTestId("mutasi.submit_button"));

    await waitFor(() => expect(catatMutasiStok).toHaveBeenCalledTimes(1));
    expect(catatMutasiStok).toHaveBeenCalledWith(
      1n,
      JenisMutasiStok.masuk,
      3n,
      "Restock gudang",
    );
  });
});

describe("AdminJadwal CRUD", () => {
  it("adds a jadwal entry with the entered values", async () => {
    const addJadwal = vi.fn(async () => jadwal[0]);
    mockCoreInfrastructure(
      createMockActor({ listJadwal: vi.fn(async () => []), addJadwal }),
    );
    const { AdminJadwal } = await import("@/pages/admin/AdminJadwal");
    renderWithRouter(<AdminJadwal />, "/admin/jadwal");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("jadwal.nama.input"),
      "Andi Saputra",
    );
    await user.type(screen.getByTestId("jadwal.kelas.input"), "XI TSM 1");
    await user.type(
      screen.getByTestId("jadwal.tugas.input"),
      "Menyapu area bengkel",
    );
    await user.click(screen.getByTestId("jadwal.submit_button"));

    await waitFor(() => expect(addJadwal).toHaveBeenCalledTimes(1));
    expect(addJadwal).toHaveBeenCalledWith(
      "Senin",
      expect.any(String),
      "Andi Saputra",
      "XI TSM 1",
      "Menyapu area bengkel",
    );
  });

  it("loads an existing jadwal into the form for editing", async () => {
    mockCoreInfrastructure(
      createMockActor({ listJadwal: vi.fn(async () => jadwal) }),
    );
    const { AdminJadwal } = await import("@/pages/admin/AdminJadwal");
    renderWithRouter(<AdminJadwal />, "/admin/jadwal");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("jadwal.edit_button.1"));

    expect(screen.getByTestId("jadwal.nama.input")).toHaveValue("Andi Saputra");
    expect(screen.getByTestId("jadwal.kelas.input")).toHaveValue("XI TSM 1");
    expect(
      screen.getByRole("button", { name: /Perbarui Jadwal/ }),
    ).toBeInTheDocument();
  });

  it("deletes a jadwal entry through the backend", async () => {
    const deleteJadwal = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        listJadwal: vi.fn(async () => jadwal),
        deleteJadwal,
      }),
    );
    const { AdminJadwal } = await import("@/pages/admin/AdminJadwal");
    renderWithRouter(<AdminJadwal />, "/admin/jadwal");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("jadwal.delete_button.1"));

    await waitFor(() => expect(deleteJadwal).toHaveBeenCalledWith(1n));
  });
});

describe("AdminKeuangan edit and delete", () => {
  it("loads an existing nota into the form and updates it", async () => {
    const updateNota = vi.fn(async () => nota[0]);
    mockCoreInfrastructure(
      createMockActor({
        listNota: vi.fn(async () => nota),
        updateNota,
      }),
    );
    const { AdminKeuangan } = await import("@/pages/admin/AdminKeuangan");
    renderWithRouter(<AdminKeuangan />, "/admin/keuangan");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("keuangan.edit_button.1"));

    expect(screen.getByTestId("keuangan.keterangan.input")).toHaveValue(
      "Pembelian oli mesin",
    );
    expect(screen.getByTestId("keuangan.nominal.input")).toHaveValue(150000);

    await user.click(screen.getByTestId("keuangan.submit_button"));

    await waitFor(() => expect(updateNota).toHaveBeenCalledTimes(1));
    expect(updateNota).toHaveBeenCalledWith(
      3n,
      "2026-02-18",
      "Pembelian oli mesin",
      JenisNota.keluar,
      "Pembelian",
      150_000n,
    );
  });

  it("deletes a nota through the backend", async () => {
    const deleteNota = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        listNota: vi.fn(async () => nota),
        deleteNota,
      }),
    );
    const { AdminKeuangan } = await import("@/pages/admin/AdminKeuangan");
    renderWithRouter(<AdminKeuangan />, "/admin/keuangan");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("keuangan.delete_button.1"));

    await waitFor(() => expect(deleteNota).toHaveBeenCalledWith(3n));
  });

  it("passes the selected jenis filter to the backend list query", async () => {
    const listNota = vi.fn(async () => nota);
    mockCoreInfrastructure(createMockActor({ listNota }));
    const { AdminKeuangan } = await import("@/pages/admin/AdminKeuangan");
    renderWithRouter(<AdminKeuangan />, "/admin/keuangan");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("keuangan.filter.select"));
    await user.click(await screen.findByRole("option", { name: "Uang Masuk" }));

    await waitFor(() =>
      expect(listNota).toHaveBeenCalledWith(JenisNota.masuk, null, null),
    );
  });
});

describe("AdminPeminjaman validation and filter", () => {
  it("blocks an Alat loan larger than the available stock", async () => {
    const catatPeminjamanAlat = vi.fn(async () => null);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        listPeminjaman: vi.fn(async () => []),
        catatPeminjamanAlat,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman.alat.unit.select"));
    await user.click(await screen.findByRole("option", { name: /Kunci T/ }));
    await user.type(screen.getByTestId("peminjaman.alat.nama.input"), "Rizky");
    await user.type(
      screen.getByTestId("peminjaman.alat.kelas.input"),
      "XII TSM 2",
    );
    await user.type(
      screen.getByTestId("peminjaman.alat.keperluan.textarea"),
      "Praktik",
    );
    await user.clear(screen.getByTestId("peminjaman.alat.jumlah.input"));
    await user.type(screen.getByTestId("peminjaman.alat.jumlah.input"), "9");

    expect(screen.getByTestId("peminjaman.alat.submit_button")).toBeDisabled();
    expect(catatPeminjamanAlat).not.toHaveBeenCalled();
  });

  it("passes the selected status filter to the backend list query", async () => {
    const listPeminjaman = vi.fn(async () => []);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        listPeminjaman,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman.status.select"));
    await user.click(await screen.findByRole("option", { name: "Dipinjam" }));

    await waitFor(() =>
      expect(listPeminjaman).toHaveBeenCalledWith(
        null,
        StatusPeminjaman.dipinjam,
        null,
      ),
    );
  });
});

describe("AdminDashboard", () => {
  it("renders the summary statistics and quick links", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        listSparepart: vi.fn(async () => sparepart),
        listPeminjaman: vi.fn(async () => []),
        ringkasanKeuangan: vi.fn(async () => ({
          totalMasuk: 500_000n,
          totalKeluar: 150_000n,
          saldo: 350_000n,
        })),
      }),
    );
    const { AdminDashboard } = await import("@/pages/admin/AdminDashboard");
    renderWithRouter(<AdminDashboard />, "/admin");

    expect(
      await screen.findByTestId("admin.dashboard.stat.alat"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin.dashboard.stat.sparepart"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin.dashboard.stat.peminjaman"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByTestId("admin.dashboard.stat.saldo"),
      ).toHaveTextContent("350.000"),
    );

    expect(
      screen.getByTestId("admin.dashboard.link.peminjaman"),
    ).toHaveAttribute("href", "/admin/peminjaman");
    expect(screen.getByTestId("admin.dashboard.link.keuangan")).toHaveAttribute(
      "href",
      "/admin/keuangan",
    );
  });
});
