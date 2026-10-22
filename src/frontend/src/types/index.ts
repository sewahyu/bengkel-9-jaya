import type {
  Alat,
  Berita,
  JadwalUpj,
  JenisMutasiStok as JenisMutasiStokBackend,
  JenisNota as JenisNotaBackend,
  JenisPeminjaman as JenisPeminjamanBackend,
  Lab as LabBackend,
  MutasiStok,
  Nota,
  Peminjaman,
  PeminjamanLab,
  RingkasanKategori,
  RingkasanKeuangan,
  Sparepart,
  StatusPeminjaman as StatusPeminjamanBackend,
  StatusPeminjamanLab as StatusPeminjamanLabBackend,
  SumberBerita as SumberBeritaBackend,
  SumberPeminjaman as SumberPeminjamanBackend,
  Trainer,
} from "@/backend";

export type {
  Alat,
  Berita,
  JadwalUpj,
  MutasiStok,
  Nota,
  Peminjaman,
  PeminjamanLab,
  RingkasanKategori,
  RingkasanKeuangan,
  Sparepart,
  Trainer,
};

/**
 * Nilai-nilai enum backend kini bertipe `string` (bukan varian Candid), jadi
 * konstanta runtime berikut menggantikan enum yang dulu dihasilkan bindgen.
 * Tipe alias di bawah mempertahankan penggunaan lama sebagai tipe.
 */
export const JenisNota = {
  masuk: "masuk",
  keluar: "keluar",
} as const;

export const JenisMutasiStok = {
  masuk: "masuk",
  keluar: "keluar",
} as const;

export const StatusPeminjaman = {
  menunggu: "menunggu",
  dipinjam: "dipinjam",
  ditolak: "ditolak",
  dikembalikan: "dikembalikan",
} as const;

export const StatusPeminjamanLab = {
  menunggu: "menunggu",
  disetujui: "disetujui",
  ditolak: "ditolak",
  selesai: "selesai",
} as const;

export const SumberPeminjaman = {
  admin: "admin",
  pengunjung: "pengunjung",
} as const;

export const JenisPeminjaman = {
  trainer: "trainer",
  alat: "alat",
} as const;

export const SumberBerita = {
  instagram: "instagram",
  manual: "manual",
} as const;

export const Lab = {
  chasis: "Lab 1 Chasis",
  mesin: "Lab 2 Mesin",
  listrik: "Lab 3 Kelistrikan",
} as const;

export type JenisNota = JenisNotaBackend;
export type JenisMutasiStok = JenisMutasiStokBackend;
export type JenisPeminjaman = JenisPeminjamanBackend;
export type StatusPeminjaman = StatusPeminjamanBackend;
export type StatusPeminjamanLab = StatusPeminjamanLabBackend;
export type SumberPeminjaman = SumberPeminjamanBackend;
export type SumberBerita = SumberBeritaBackend;
export type Lab = LabBackend;

/** Status ketersediaan alat/sparepart yang dipakai di seluruh antarmuka. */
export type StatusKetersediaan = "tersedia" | "menipis" | "habis";

export interface NavItem {
  label: string;
  to: string;
}

export interface KategoriOption {
  value: string;
  label: string;
}
