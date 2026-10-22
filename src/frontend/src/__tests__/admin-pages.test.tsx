import type { Alat, Nota, Peminjaman } from "@/types";
import {
  JenisNota,
  JenisPeminjaman,
  StatusPeminjaman,
  SumberPeminjaman,
} from "@/types";
import { screen, waitFor, within } from "@testing-library/react";
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

const peminjaman: Peminjaman[] = [
  {
    id: 7n,
    targetId: 1n,
    jenis: JenisPeminjaman.alat,
    namaTarget: "Kunci T",
    namaPeminjam: "Rizky Pratama",
    kelas: "XII TSM 2",
    jumlah: 2n,
    tanggalPinjam: "2026-02-20",
    keperluan: "Praktik tune up",
    status: StatusPeminjaman.dipinjam,
    sumber: SumberPeminjaman.admin,
    tanggalKembali: undefined,
    kondisiKembali: undefined,
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

describe("AdminGuard", () => {
  it("shows the login panel when the visitor is not authenticated", async () => {
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

  it("shows the denied panel for an authenticated non-admin", async () => {
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: false,
    });
    const { AdminGuard } = await import("@/components/AdminGuard");
    renderWithRouter(
      <AdminGuard>
        <p>Konten rahasia</p>
      </AdminGuard>,
      "/admin",
    );

    expect(
      await screen.findByTestId("admin.guard.denied_panel"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Konten rahasia")).not.toBeInTheDocument();
  });

  it("renders children once the backend confirms the caller is admin", async () => {
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
    expect(
      screen.queryByTestId("admin.guard.denied_panel"),
    ).not.toBeInTheDocument();
  });
});

describe("AdminShell navigation", () => {
  it("exposes Data Trainer and Data Alat as separate admin entries", async () => {
    mockCoreInfrastructure(createMockActor(), {
      session: { username: "admin", loginAt: 0n },
      isAdmin: true,
    });
    const { AdminTrainer } = await import("@/pages/admin/AdminTrainer");
    renderWithRouter(<AdminTrainer />, "/admin/trainer");

    const nav = await screen.findByRole("navigation", {
      name: "Navigasi panel admin",
    });
    const trainer = within(nav).getByTestId("admin.nav.link.trainer");
    const alat = within(nav).getByTestId("admin.nav.link.alat");
    expect(trainer).toHaveAttribute("href", "/admin/trainer");
    expect(trainer).toHaveTextContent("Data Trainer");
    expect(alat).toHaveAttribute("href", "/admin/alat");
    expect(alat).toHaveTextContent("Data Alat");
  });
});

describe("AdminKeuangan", () => {
  it("renders the financial summary from the backend", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listNota: vi.fn(async () => nota),
        ringkasanKeuangan: vi.fn(async () => ({
          totalMasuk: 500_000n,
          totalKeluar: 150_000n,
          saldo: 350_000n,
        })),
      }),
    );
    const { AdminKeuangan } = await import("@/pages/admin/AdminKeuangan");
    renderWithRouter(<AdminKeuangan />, "/admin/keuangan");

    expect(await screen.findByText("Pembelian oli mesin")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId("keuangan.stat.saldo")).toHaveTextContent(
        "350.000",
      );
    });
  });

  it("submits a new nota with the entered values", async () => {
    const addNota = vi.fn(async () => nota[0]);
    mockCoreInfrastructure(
      createMockActor({
        listNota: vi.fn(async () => []),
        addNota,
      }),
    );
    const { AdminKeuangan } = await import("@/pages/admin/AdminKeuangan");
    renderWithRouter(<AdminKeuangan />, "/admin/keuangan");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("keuangan.keterangan.input"),
      "Beli busi",
    );
    await user.type(screen.getByTestId("keuangan.nominal.input"), "50000");
    await user.click(screen.getByTestId("keuangan.submit_button"));

    await waitFor(() => expect(addNota).toHaveBeenCalledTimes(1));
    expect(addNota).toHaveBeenCalledWith(
      expect.any(String),
      "Beli busi",
      JenisNota.masuk,
      expect.any(String),
      50_000n,
    );
  });
});

describe("AdminPeminjaman", () => {
  it("records an Alat loan with the selected unit and borrower", async () => {
    const catatPeminjamanAlat = vi.fn(async () => peminjaman[0]);
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
    await user.click(screen.getByTestId("peminjaman.alat.submit_button"));

    await waitFor(() => expect(catatPeminjamanAlat).toHaveBeenCalledTimes(1));
    expect(catatPeminjamanAlat).toHaveBeenCalledWith(
      1n,
      "Rizky",
      "XII TSM 2",
      1n,
      expect.any(String),
      "Praktik",
    );
  });

  it("records a Trainer loan from the separate Trainer form", async () => {
    const catatPeminjamanTrainer = vi.fn(async () => peminjaman[0]);
    mockCoreInfrastructure(
      createMockActor({
        listTrainer: vi.fn(async () => [
          {
            id: 5n,
            nama: "Unit Trainer Mesin",
            kategori: "Mesin",
            jumlahTotal: 3n,
            jumlahTersedia: 3n,
            keterangan: "",
          },
        ]),
        listPeminjaman: vi.fn(async () => []),
        catatPeminjamanTrainer,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(
      await screen.findByTestId("peminjaman.trainer.unit.select"),
    );
    await user.click(
      await screen.findByRole("option", { name: /Unit Trainer Mesin/ }),
    );
    await user.type(
      screen.getByTestId("peminjaman.trainer.nama.input"),
      "Petugas UPJ",
    );
    await user.type(
      screen.getByTestId("peminjaman.trainer.kelas.input"),
      "Guru",
    );
    await user.type(
      screen.getByTestId("peminjaman.trainer.keperluan.textarea"),
      "Perawatan",
    );
    await user.click(screen.getByTestId("peminjaman.trainer.submit_button"));

    await waitFor(() =>
      expect(catatPeminjamanTrainer).toHaveBeenCalledTimes(1),
    );
    expect(catatPeminjamanTrainer).toHaveBeenCalledWith(
      5n,
      "Petugas UPJ",
      "Guru",
      1n,
      expect.any(String),
      "Perawatan",
    );
  });

  it("records a pengembalian for a borrowed item", async () => {
    const catatPengembalian = vi.fn(async () => peminjaman[0]);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        listPeminjaman: vi.fn(async () => peminjaman),
        catatPengembalian,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman.kembali_button.1"));
    await user.type(
      await screen.findByTestId("peminjaman.kondisi.input"),
      "Baik, lengkap",
    );
    await user.click(screen.getByTestId("peminjaman.kembali_submit_button"));

    await waitFor(() => expect(catatPengembalian).toHaveBeenCalledTimes(1));
    expect(catatPengembalian).toHaveBeenCalledWith(
      7n,
      expect.any(String),
      "Baik, lengkap",
    );
  });
});

describe("AdminAlat", () => {
  it("adds a new alat from the form", async () => {
    const addAlat = vi.fn(async () => alat[0]);
    mockCoreInfrastructure(
      createMockActor({ listAlat: vi.fn(async () => []), addAlat }),
    );
    const { AdminAlat } = await import("@/pages/admin/AdminAlat");
    renderWithRouter(<AdminAlat />, "/admin/alat");

    const user = userEvent.setup();
    await user.type(await screen.findByTestId("alat.nama.input"), "Kunci T");
    await user.click(screen.getByTestId("alat.submit_button"));

    await waitFor(() => expect(addAlat).toHaveBeenCalledTimes(1));
    expect(addAlat).toHaveBeenCalledWith("Kunci T", expect.any(String), 1n, "");
  });

  it("loads an existing alat into the form for editing", async () => {
    mockCoreInfrastructure(
      createMockActor({ listAlat: vi.fn(async () => alat) }),
    );
    const { AdminAlat } = await import("@/pages/admin/AdminAlat");
    renderWithRouter(<AdminAlat />, "/admin/alat");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("alat.edit_button.1"));

    expect(screen.getByTestId("alat.nama.input")).toHaveValue("Kunci T");
    expect(screen.getByTestId("alat.total.input")).toHaveValue(5);
    expect(
      screen.getByRole("button", { name: /Perbarui Alat/ }),
    ).toBeInTheDocument();
  });

  it("deletes an alat through the backend", async () => {
    const deleteAlat = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        deleteAlat,
      }),
    );
    const { AdminAlat } = await import("@/pages/admin/AdminAlat");
    renderWithRouter(<AdminAlat />, "/admin/alat");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("alat.delete_button.1"));

    await waitFor(() => expect(deleteAlat).toHaveBeenCalledWith(1n));
  });
});
