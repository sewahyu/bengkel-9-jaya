import type { Berita, Peminjaman, PeminjamanLab } from "@/types";
import {
  JenisPeminjaman,
  StatusPeminjaman,
  StatusPeminjamanLab,
  SumberBerita,
  SumberPeminjaman,
} from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

/**
 * Cover for the accepted admin-side behavior added by this request: visitor
 * requests carry a "Pengunjung" source badge and can be approved or rejected,
 * lab loans are managed with full CRUD, the Instagram feed URL and manual news
 * are managed, and the loan/finance lists export to .xlsx.
 *
 * The backend is a typed local mock; these tests assert the frontend's
 * observable behavior and the actor calls it makes.
 */

const peminjamanPengunjung: Peminjaman[] = [
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
    status: StatusPeminjaman.menunggu,
    sumber: SumberPeminjaman.pengunjung,
    kontak: "0812-3456-7890",
  },
];

const peminjamanAdmin: Peminjaman[] = [
  {
    id: 8n,
    targetId: 1n,
    jenis: JenisPeminjaman.alat,
    namaTarget: "Kunci T",
    namaPeminjam: "Petugas UPJ",
    kelas: "Guru",
    jumlah: 1n,
    tanggalPinjam: "2026-02-21",
    keperluan: "Perawatan",
    status: StatusPeminjaman.dipinjam,
    sumber: SumberPeminjaman.admin,
  },
];

const peminjamanLab: PeminjamanLab[] = [
  {
    id: 9n,
    lab: "Lab 1 Chasis",
    status: StatusPeminjamanLab.menunggu,
    jamSelesai: "09:00",
    keperluan: "Praktik pembongkaran",
    tanggal: "2026-03-10",
    namaPeminjam: "Dwi Anggraini",
    jamMulai: "07:00",
    waktuDibuat: 0n,
    kelas: "XI TSM 1",
  },
];

const berita: Berita[] = [
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

describe("AdminPeminjaman sumber pengunjung", () => {
  it("marks a visitor request with the Pengunjung source badge", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => []),
        listPeminjaman: vi.fn(async () => peminjamanPengunjung),
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const row = await screen.findByTestId("peminjaman.row.1");
    expect(row).toHaveTextContent("Pengunjung");
    expect(row).toHaveTextContent("Rizky Pratama");
  });

  it("approves a pending visitor request through the backend", async () => {
    const setujuiPeminjaman = vi.fn(async () => peminjamanPengunjung[0]);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => []),
        listPeminjaman: vi.fn(async () => peminjamanPengunjung),
        setujuiPeminjaman,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman.setujui_button.1"));

    await waitFor(() => expect(setujuiPeminjaman).toHaveBeenCalledWith(7n));
  });

  it("rejects a pending visitor request through the backend", async () => {
    const tolakPeminjaman = vi.fn(async () => peminjamanPengunjung[0]);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => []),
        listPeminjaman: vi.fn(async () => peminjamanPengunjung),
        tolakPeminjaman,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman.tolak_button.1"));

    await waitFor(() => expect(tolakPeminjaman).toHaveBeenCalledWith(7n));
  });

  it("still records a direct admin Alat loan (opsi input admin)", async () => {
    const catatPeminjamanAlat = vi.fn(async () => peminjamanAdmin[0]);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => [
          {
            id: 1n,
            nama: "Kunci T",
            kategori: "Peralatan Tangan",
            jumlahTotal: 5n,
            jumlahTersedia: 5n,
            keterangan: "",
          },
        ]),
        listPeminjaman: vi.fn(async () => []),
        catatPeminjamanAlat,
      }),
    );
    const { AdminPeminjaman } = await import("@/pages/admin/AdminPeminjaman");
    renderWithRouter(<AdminPeminjaman />, "/admin/peminjaman");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman.alat.unit.select"));
    await user.click(await screen.findByRole("option", { name: /Kunci T/ }));
    await user.type(
      screen.getByTestId("peminjaman.alat.nama.input"),
      "Petugas UPJ",
    );
    await user.type(screen.getByTestId("peminjaman.alat.kelas.input"), "Guru");
    await user.type(
      screen.getByTestId("peminjaman.alat.keperluan.textarea"),
      "Perawatan",
    );
    await user.click(screen.getByTestId("peminjaman.alat.submit_button"));

    await waitFor(() => expect(catatPeminjamanAlat).toHaveBeenCalledTimes(1));
    expect(catatPeminjamanAlat).toHaveBeenCalledWith(
      1n,
      "Petugas UPJ",
      "Guru",
      1n,
      expect.any(String),
      "Perawatan",
    );
  });
});

describe("AdminPeminjamanLab CRUD", () => {
  it("adds a lab loan with the entered values", async () => {
    const addPeminjamanLab = vi.fn(async () => peminjamanLab[0]);
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => []),
        addPeminjamanLab,
      }),
    );
    const { AdminPeminjamanLab } = await import(
      "@/pages/admin/AdminPeminjamanLab"
    );
    renderWithRouter(<AdminPeminjamanLab />, "/admin/peminjaman-lab");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("lab.nama.input"),
      "Dwi Anggraini",
    );
    await user.type(screen.getByTestId("lab.kelas.input"), "XI TSM 1");
    await user.type(
      screen.getByTestId("lab.keperluan.textarea"),
      "Praktik pembongkaran",
    );
    await user.click(screen.getByTestId("lab.submit_button"));

    await waitFor(() => expect(addPeminjamanLab).toHaveBeenCalledTimes(1));
    expect(addPeminjamanLab).toHaveBeenCalledWith(
      "Lab 1 Chasis",
      "Dwi Anggraini",
      "XI TSM 1",
      "",
      expect.any(String),
      "07:00",
      "09:00",
      "Praktik pembongkaran",
      StatusPeminjamanLab.menunggu,
    );
  });

  it("loads an existing lab loan into the form and updates it", async () => {
    const updatePeminjamanLab = vi.fn(async () => peminjamanLab[0]);
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => peminjamanLab),
        updatePeminjamanLab,
      }),
    );
    const { AdminPeminjamanLab } = await import(
      "@/pages/admin/AdminPeminjamanLab"
    );
    renderWithRouter(<AdminPeminjamanLab />, "/admin/peminjaman-lab");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("lab.edit_button.1"));

    expect(screen.getByTestId("lab.nama.input")).toHaveValue("Dwi Anggraini");
    expect(screen.getByTestId("lab.kelas.input")).toHaveValue("XI TSM 1");

    await user.click(screen.getByTestId("lab.submit_button"));

    await waitFor(() => expect(updatePeminjamanLab).toHaveBeenCalledTimes(1));
    expect(updatePeminjamanLab).toHaveBeenCalledWith(
      9n,
      "Lab 1 Chasis",
      "Dwi Anggraini",
      "XI TSM 1",
      "",
      "2026-03-10",
      "07:00",
      "09:00",
      "Praktik pembongkaran",
      StatusPeminjamanLab.menunggu,
    );
  });

  it("deletes a lab loan through the backend", async () => {
    const deletePeminjamanLab = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => peminjamanLab),
        deletePeminjamanLab,
      }),
    );
    const { AdminPeminjamanLab } = await import(
      "@/pages/admin/AdminPeminjamanLab"
    );
    renderWithRouter(<AdminPeminjamanLab />, "/admin/peminjaman-lab");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("lab.delete_button.1"));

    await waitFor(() => expect(deletePeminjamanLab).toHaveBeenCalledWith(9n));
  });
});

describe("AdminBerita", () => {
  it("saves the Instagram feed URL through the backend", async () => {
    const setFeedUrl = vi.fn(async () => undefined);
    mockCoreInfrastructure(
      createMockActor({
        getFeedUrl: vi.fn(async () => ""),
        listBerita: vi.fn(async () => []),
        setFeedUrl,
      }),
    );
    const { AdminBerita } = await import("@/pages/admin/AdminBerita");
    renderWithRouter(<AdminBerita />, "/admin/berita");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("berita.feed_url.input"),
      "https://rss.app/feeds/abc.xml",
    );
    await user.click(screen.getByTestId("berita.feed.submit_button"));

    await waitFor(() =>
      expect(setFeedUrl).toHaveBeenCalledWith("https://rss.app/feeds/abc.xml"),
    );
    expect(
      await screen.findByTestId("berita.feed.success_state"),
    ).toBeInTheDocument();
  });

  it("adds a manual news item with the entered values", async () => {
    const addBerita = vi.fn(async () => berita[0]);
    mockCoreInfrastructure(
      createMockActor({
        getFeedUrl: vi.fn(async () => ""),
        listBerita: vi.fn(async () => []),
        addBerita,
      }),
    );
    const { AdminBerita } = await import("@/pages/admin/AdminBerita");
    renderWithRouter(<AdminBerita />, "/admin/berita");

    const user = userEvent.setup();
    await user.type(
      await screen.findByTestId("berita.judul.input"),
      "Bengkel 9 Jaya Juara LKS",
    );
    await user.type(
      screen.getByTestId("berita.ringkasan.textarea"),
      "Tim TSM menjuarai LKS tingkat provinsi.",
    );
    await user.click(screen.getByTestId("berita.submit_button"));

    await waitFor(() => expect(addBerita).toHaveBeenCalledTimes(1));
    expect(addBerita).toHaveBeenCalledWith(
      "Bengkel 9 Jaya Juara LKS",
      "Tim TSM menjuarai LKS tingkat provinsi.",
      "",
      "",
      expect.any(String),
    );
  });

  it("deletes a news item through the backend", async () => {
    const deleteBerita = vi.fn(async () => true);
    mockCoreInfrastructure(
      createMockActor({
        getFeedUrl: vi.fn(async () => ""),
        listBerita: vi.fn(async () => berita),
        deleteBerita,
      }),
    );
    const { AdminBerita } = await import("@/pages/admin/AdminBerita");
    renderWithRouter(<AdminBerita />, "/admin/berita");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("berita.delete_button.1"));

    await waitFor(() => expect(deleteBerita).toHaveBeenCalledWith(4n));
  });
});

describe("AdminKeuangan export", () => {
  it("exports the finance list as an .xlsx download", async () => {
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    mockCoreInfrastructure(
      createMockActor({
        listNota: vi.fn(async () => [
          {
            id: 3n,
            tanggal: "2026-02-18",
            keterangan: "Pembelian oli mesin",
            jenis: "keluar",
            kategori: "Pembelian",
            nominal: 150_000n,
          },
        ]),
      }),
    );
    const { AdminKeuangan } = await import("@/pages/admin/AdminKeuangan");
    renderWithRouter(<AdminKeuangan />, "/admin/keuangan");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("keuangan.ekspor_button"));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });
});
