import type { KategoriOption, NavItem } from "@/types";

export const APP_NAME = "Bengkel 9 Jaya";
export const JURUSAN_NAME = "Teknik Sepeda Motor";
export const SEKOLAH_NAME = "SMKN 9 Malang";
export const INSTAGRAM_HANDLE = "@bengkel9_jaya";
export const INSTAGRAM_URL = "https://www.instagram.com/bengkel9_jaya";

export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", to: "/" },
  { label: "Tata Tertib", to: "/tata-tertib" },
  { label: "Jadwal UPJ", to: "/jadwal" },
  { label: "Sparepart", to: "/sparepart" },
  { label: "Trainer", to: "/trainer" },
  { label: "Alat", to: "/alat" },
  { label: "Pinjam Alat", to: "/pinjam-alat" },
  { label: "Peminjaman Lab", to: "/peminjaman-lab" },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Ringkasan", to: "/admin" },
  { label: "Peminjaman", to: "/admin/peminjaman" },
  { label: "Peminjaman Lab", to: "/admin/peminjaman-lab" },
  { label: "Berita", to: "/admin/berita" },
  { label: "Keuangan", to: "/admin/keuangan" },
  { label: "Data Trainer", to: "/admin/trainer" },
  { label: "Data Alat", to: "/admin/alat" },
  { label: "Data Sparepart", to: "/admin/sparepart" },
  { label: "Jadwal UPJ", to: "/admin/jadwal" },
];

/** Kategori inventaris Trainer (data unit lama). */
export const KATEGORI_TRAINER: KategoriOption[] = [
  { value: "Mesin", label: "Mesin" },
  { value: "Kelistrikan", label: "Kelistrikan" },
  { value: "Sasis", label: "Sasis" },
  { value: "Peralatan Tangan", label: "Peralatan Tangan" },
  { value: "Peralatan Ukur", label: "Peralatan Ukur" },
  { value: "Keselamatan", label: "Keselamatan" },
];

/** Kategori inventaris Alat (inventaris baru, terpisah dari Trainer). */
export const KATEGORI_ALAT: KategoriOption[] = [
  { value: "Peralatan Tangan", label: "Peralatan Tangan" },
  { value: "Peralatan Ukur", label: "Peralatan Ukur" },
  { value: "Peralatan Keselamatan", label: "Peralatan Keselamatan" },
  { value: "Peralatan Listrik", label: "Peralatan Listrik" },
  { value: "Perkakas Khusus", label: "Perkakas Khusus" },
  { value: "Perawatan & Kebersihan", label: "Perawatan & Kebersihan" },
];

export const KATEGORI_SPAREPART: KategoriOption[] = [
  { value: "Oli & Pelumas", label: "Oli & Pelumas" },
  { value: "Filter", label: "Filter" },
  { value: "Busi & Pengapian", label: "Busi & Pengapian" },
  { value: "Rem", label: "Rem" },
  { value: "Transmisi", label: "Transmisi" },
  { value: "Ban & Roda", label: "Ban & Roda" },
  { value: "Fastener", label: "Fastener" },
];

export const KATEGORI_NOTA: KategoriOption[] = [
  { value: "Pembelian Sparepart", label: "Pembelian Sparepart" },
  { value: "Pembelian Alat", label: "Pembelian Alat" },
  { value: "Perawatan", label: "Perawatan" },
  { value: "Jasa Servis", label: "Jasa Servis" },
  { value: "Donasi", label: "Donasi" },
  { value: "Operasional", label: "Operasional" },
];

export const HARI_OPTIONS: KategoriOption[] = [
  { value: "Senin", label: "Senin" },
  { value: "Selasa", label: "Selasa" },
  { value: "Rabu", label: "Rabu" },
  { value: "Kamis", label: "Kamis" },
  { value: "Jumat", label: "Jumat" },
  { value: "Sabtu", label: "Sabtu" },
];

/** Tiga laboratorium tetap jurusan Teknik Sepeda Motor. */
export const LAB_OPTIONS: KategoriOption[] = [
  { value: "Lab 1 Chasis", label: "Lab 1 Chasis" },
  { value: "Lab 2 Mesin", label: "Lab 2 Mesin" },
  { value: "Lab 3 Kelistrikan", label: "Lab 3 Kelistrikan" },
];

/** Kelas warna per lab untuk kalender dan label. */
export const LAB_STYLE: Record<
  string,
  { chip: string; dot: string; text: string }
> = {
  "Lab 1 Chasis": {
    chip: "bg-lab-chasis-soft text-lab-chasis",
    dot: "bg-lab-chasis",
    text: "text-lab-chasis",
  },
  "Lab 2 Mesin": {
    chip: "bg-lab-mesin-soft text-lab-mesin",
    dot: "bg-lab-mesin",
    text: "text-lab-mesin",
  },
  "Lab 3 Kelistrikan": {
    chip: "bg-lab-listrik-soft text-lab-listrik",
    dot: "bg-lab-listrik",
    text: "text-lab-listrik",
  },
};

export const STATUS_LABEL: Record<string, string> = {
  menunggu: "Menunggu Persetujuan",
  dipinjam: "Dipinjam",
  ditolak: "Ditolak",
  dikembalikan: "Dikembalikan",
  disetujui: "Disetujui",
  selesai: "Selesai",
  masuk: "Uang Masuk",
  keluar: "Uang Keluar",
  tersedia: "Tersedia",
  menipis: "Menipis",
  habis: "Habis",
};

export const SUMBER_LABEL: Record<string, string> = {
  admin: "Admin",
  pengunjung: "Pengunjung",
};

/** Satu simpul pada bagan struktur organisasi Kompetensi Keahlian TSM. */
export interface OrgNode {
  /** Jabatan yang ditampilkan pada kepala kartu. */
  jabatan: string;
  /** Nama lengkap beserta gelar. */
  nama: string;
  /** Tingkat kedalaman pada bagan (0 = puncak). */
  tingkat: number;
}

/**
 * Struktur organisasi Kompetensi Keahlian Teknik Sepeda Motor SMK Negeri 9
 * Malang, disusun berjenjang dari Kepala Sekolah hingga Teknisi & Toolman.
 */
export const STRUKTUR_ORGANISASI: OrgNode[] = [
  {
    jabatan: "Kepala Sekolah",
    nama: "Drs. Moh. Guntur Sayekti, M.Pd",
    tingkat: 0,
  },
  { jabatan: "Kakomli TSM", nama: "Ahmat Samsul Ma'arif, S.Pd.", tingkat: 1 },
  { jabatan: "Sekretaris", nama: "Wiwit Riyanti, S.Pd.", tingkat: 2 },
  { jabatan: "Kepala Bengkel", nama: "Moh. Latif Risyda, S.Pd.", tingkat: 2 },
  {
    jabatan: "Bendahara & Unit Produksi",
    nama: "Bagyo Suprapto, S.Pd.",
    tingkat: 2,
  },
  { jabatan: "Litbang & Humas", nama: "Sukirman, S.Pd.", tingkat: 3 },
  { jabatan: "Sarana Prasarana", nama: "Taufik Afandi, S.T.", tingkat: 3 },
  { jabatan: "Admin SHEP", nama: "Ahmat Arip, S.Pd.", tingkat: 4 },
  {
    jabatan: "Kurikulum & Pengembangan Teknologi",
    nama: "Febri Irawan, S.Pd.",
    tingkat: 4,
  },
  { jabatan: "Teknisi & Toolman", nama: "Hendrik Prasetyo, S.Pd.", tingkat: 4 },
];

/** Foto bagan struktur organisasi resmi, ditampilkan sebagai rujukan. */
export const STRUKTUR_FOTO = "/assets/images/struktur-organisasi-tsm.jpg";

/** Gambar dekoratif beranda (foto bengkel dan kegiatan praktik). */
export const GALERI_BERANDA: { src: string; alt: string }[] = [
  {
    src: "/assets/images/beranda-bengkel-1.jpg",
    alt: "Siswa TSM melakukan praktik perawatan sepeda motor di bengkel",
  },
  {
    src: "/assets/images/beranda-bengkel-2.jpg",
    alt: "Kegiatan praktik siswa Teknik Sepeda Motor di area bengkel SMKN 9 Malang",
  },
];

export const TATA_TERTIB: string[] = [
  "Siswa wajib hadir tepat waktu dan mengenakan pakaian praktik lengkap sebelum kegiatan di bengkel dimulai.",
  "Setiap siswa wajib memakai alat pelindung diri: helm kerja, sarung tangan, dan sepatu safety saat berada di area bengkel.",
  "Alat dan sparepart hanya boleh digunakan setelah dicatat oleh petugas UPJ dan sesuai dengan keperluan praktik.",
  "Dilarang menyalakan mesin tanpa izin instruktur dan tanpa pemasangan gas buang yang benar.",
  "Alat yang telah dipinjam wajib dikembalikan pada hari yang sama dalam kondisi bersih dan lengkap.",
  "Kerusakan atau kehilangan alat wajib dilaporkan kepada petugas UPJ dan diganti sesuai ketentuan sekolah.",
  "Area kerja wajib dibersihkan kembali setelah praktik; tumpahan oli dibersihkan dengan bahan penyerap yang tersedia.",
  "Dilarang membawa keluar alat, sparepart, atau bahan praktik dari lingkungan bengkel tanpa izin tertulis.",
  "Bahan bakar dan cairan pembersih disimpan pada lemari khusus dan dijauhkan dari sumber api.",
  "Pelanggaran tata tertib dikenakan sanksi sesuai aturan jurusan dan sekolah.",
];
