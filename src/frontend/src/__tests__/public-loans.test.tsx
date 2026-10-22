import type { Alat, Peminjaman, PeminjamanLab } from "@/types";
import { StatusPeminjaman, StatusPeminjamanLab } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockActor,
  mockCoreInfrastructure,
  renderWithRouter,
} from "./test-utils";

/**
 * Cover for the accepted public self-service journeys: a visitor with no admin
 * session can open the "Pinjam Alat" and "Peminjaman Lab" pages, fill in their
 * own data, and submit a request that reaches the backend actor.
 *
 * The backend is a typed local mock, so these tests assert the frontend's
 * observable behavior and the exact actor call it makes — not the canister's
 * own stock or approval logic.
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
  {
    id: 2n,
    nama: "Dongkrak",
    kategori: "Sasis",
    jumlahTotal: 3n,
    jumlahTersedia: 0n,
    keterangan: "Sedang dipinjam",
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

beforeEach(() => {
  vi.resetModules();
});

describe("Pinjam Alat (pengunjung tanpa login)", () => {
  it("lists only units with stock and shows the available count", async () => {
    mockCoreInfrastructure(
      createMockActor({ listAlat: vi.fn(async () => alat) }),
    );
    const { PinjamAlat } = await import("@/pages/PinjamAlat");
    renderWithRouter(<PinjamAlat />, "/pinjam-alat");

    // The out-of-stock unit is excluded from the selectable list.
    expect(await screen.findByText("Kunci T")).toBeInTheDocument();
    expect(screen.queryByText("Dongkrak")).not.toBeInTheDocument();
    expect(screen.getByText("5 tersedia")).toBeInTheDocument();
  });

  it("submits a visitor request and shows the pending confirmation", async () => {
    const ajukanPeminjamanAlat = vi.fn(
      async (): Promise<Peminjaman | null> => null,
    );
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        ajukanPeminjamanAlat,
      }),
    );
    const { PinjamAlat } = await import("@/pages/PinjamAlat");
    renderWithRouter(<PinjamAlat />, "/pinjam-alat");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("pinjam_alat.alat_select"));
    await user.click(await screen.findByRole("option", { name: /Kunci T/ }));
    await user.type(screen.getByTestId("pinjam_alat.nama_input"), "Rizky");
    await user.type(screen.getByTestId("pinjam_alat.kelas_input"), "XII TSM 2");
    await user.type(
      screen.getByTestId("pinjam_alat.kontak_input"),
      "0812-3456-7890",
    );
    await user.type(
      screen.getByTestId("pinjam_alat.keperluan_textarea"),
      "Praktik tune up",
    );
    await user.click(screen.getByTestId("pinjam_alat.submit_button"));

    await waitFor(() => expect(ajukanPeminjamanAlat).toHaveBeenCalledTimes(1));
    expect(ajukanPeminjamanAlat).toHaveBeenCalledWith(
      1n,
      "Rizky",
      "XII TSM 2",
      1n,
      expect.any(String),
      "Praktik tune up",
      "0812-3456-7890",
    );

    // Confirmation card echoes the entered data and the pending status.
    const konfirmasi = await screen.findByTestId("pinjam_alat.success_state");
    expect(konfirmasi).toHaveTextContent("Permintaan Terkirim");
    expect(konfirmasi).toHaveTextContent("Menunggu persetujuan admin");
    expect(konfirmasi).toHaveTextContent("Rizky");
    expect(konfirmasi).toHaveTextContent("XII TSM 2");
    expect(konfirmasi).toHaveTextContent("Praktik tune up");
  });

  it("blocks submission until the required fields are complete", async () => {
    const ajukanPeminjamanAlat = vi.fn(async () => null);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        ajukanPeminjamanAlat,
      }),
    );
    const { PinjamAlat } = await import("@/pages/PinjamAlat");
    renderWithRouter(<PinjamAlat />, "/pinjam-alat");

    const submit = await screen.findByTestId("pinjam_alat.submit_button");
    expect(submit).toBeDisabled();

    const user = userEvent.setup();
    await user.click(screen.getByTestId("pinjam_alat.alat_select"));
    await user.click(await screen.findByRole("option", { name: /Kunci T/ }));
    await user.type(screen.getByTestId("pinjam_alat.nama_input"), "Rizky");

    // Still missing kelas, kontak, and keperluan.
    expect(screen.getByTestId("pinjam_alat.submit_button")).toBeDisabled();
    expect(ajukanPeminjamanAlat).not.toHaveBeenCalled();
  });

  it("rejects a quantity above the available stock", async () => {
    const ajukanPeminjamanAlat = vi.fn(async () => null);
    mockCoreInfrastructure(
      createMockActor({
        listAlat: vi.fn(async () => alat),
        ajukanPeminjamanAlat,
      }),
    );
    const { PinjamAlat } = await import("@/pages/PinjamAlat");
    renderWithRouter(<PinjamAlat />, "/pinjam-alat");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("pinjam_alat.alat_select"));
    await user.click(await screen.findByRole("option", { name: /Kunci T/ }));
    await user.type(screen.getByTestId("pinjam_alat.nama_input"), "Rizky");
    await user.type(screen.getByTestId("pinjam_alat.kelas_input"), "XII TSM 2");
    await user.type(screen.getByTestId("pinjam_alat.kontak_input"), "0812");
    await user.type(
      screen.getByTestId("pinjam_alat.keperluan_textarea"),
      "Praktik",
    );
    await user.clear(screen.getByTestId("pinjam_alat.jumlah_input"));
    await user.type(screen.getByTestId("pinjam_alat.jumlah_input"), "9");

    expect(screen.getByTestId("pinjam_alat.jumlah_error")).toBeInTheDocument();
    expect(screen.getByTestId("pinjam_alat.submit_button")).toBeDisabled();
    expect(ajukanPeminjamanAlat).not.toHaveBeenCalled();
  });
});

describe("Peminjaman Lab (pengunjung tanpa login)", () => {
  it("offers all three labs and lists the existing bookings", async () => {
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => peminjamanLab),
      }),
    );
    const { PeminjamanLab } = await import("@/pages/PeminjamanLab");
    renderWithRouter(<PeminjamanLab />, "/peminjaman-lab");

    // All three labs are selectable in the form.
    expect(await screen.findByTestId("peminjaman_lab.radio.1")).toHaveAttribute(
      "value",
      "Lab 1 Chasis",
    );
    expect(screen.getByTestId("peminjaman_lab.radio.2")).toHaveAttribute(
      "value",
      "Lab 2 Mesin",
    );
    expect(screen.getByTestId("peminjaman_lab.radio.3")).toHaveAttribute(
      "value",
      "Lab 3 Kelistrikan",
    );
    // The existing booking is listed with its borrower.
    expect(await screen.findByText("Dwi Anggraini")).toBeInTheDocument();
  });

  it("submits a lab booking and shows the pending confirmation", async () => {
    const ajukanPeminjamanLab = vi.fn(
      async (): Promise<PeminjamanLab | null> => null,
    );
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => []),
        ajukanPeminjamanLab,
      }),
    );
    const { PeminjamanLab } = await import("@/pages/PeminjamanLab");
    renderWithRouter(<PeminjamanLab />, "/peminjaman-lab");

    const user = userEvent.setup();
    await user.click(await screen.findByTestId("peminjaman_lab.radio.2"));
    await user.type(screen.getByLabelText("Nama peminjam"), "Dwi Anggraini");
    await user.type(screen.getByLabelText("Kelas / Unit"), "XI TSM 1");
    await user.type(screen.getByLabelText("Kontak"), "0812-0000");
    await user.type(screen.getByLabelText("Tanggal"), "2026-03-10");
    await user.type(screen.getByLabelText("Jam mulai"), "07:00");
    await user.type(screen.getByLabelText("Jam selesai"), "09:00");
    await user.type(
      screen.getByLabelText("Keperluan"),
      "Praktik pembongkaran mesin",
    );
    await user.click(screen.getByTestId("peminjaman_lab.submit_button"));

    await waitFor(() => expect(ajukanPeminjamanLab).toHaveBeenCalledTimes(1));
    expect(ajukanPeminjamanLab).toHaveBeenCalledWith(
      "Lab 2 Mesin",
      "Dwi Anggraini",
      "XI TSM 1",
      "0812-0000",
      "2026-03-10",
      "07:00",
      "09:00",
      "Praktik pembongkaran mesin",
    );

    const sukses = await screen.findByTestId("peminjaman_lab.success_state");
    expect(sukses).toHaveTextContent("Pengajuan terkirim");
    expect(sukses).toHaveTextContent("Menunggu persetujuan admin");
    expect(sukses).toHaveTextContent("Dwi Anggraini");
  });

  it("rejects a finish time that is not after the start time", async () => {
    const ajukanPeminjamanLab = vi.fn(async () => null);
    mockCoreInfrastructure(
      createMockActor({
        listPeminjamanLab: vi.fn(async () => []),
        ajukanPeminjamanLab,
      }),
    );
    const { PeminjamanLab } = await import("@/pages/PeminjamanLab");
    renderWithRouter(<PeminjamanLab />, "/peminjaman-lab");

    const user = userEvent.setup();
    await user.type(await screen.findByLabelText("Nama peminjam"), "Dwi");
    await user.type(screen.getByLabelText("Kelas / Unit"), "XI TSM 1");
    await user.type(screen.getByLabelText("Kontak"), "0812");
    await user.type(screen.getByLabelText("Tanggal"), "2026-03-10");
    await user.type(screen.getByLabelText("Jam mulai"), "09:00");
    await user.type(screen.getByLabelText("Jam selesai"), "07:00");
    await user.type(screen.getByLabelText("Keperluan"), "Praktik");
    await user.click(screen.getByTestId("peminjaman_lab.submit_button"));

    expect(
      await screen.findByText("Jam selesai harus setelah jam mulai."),
    ).toBeInTheDocument();
    expect(ajukanPeminjamanLab).not.toHaveBeenCalled();
  });
});
