import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Alat {
    id: Id;
    jumlahTotal: bigint;
    nama: string;
    kategori: string;
    jumlahTersedia: bigint;
    keterangan: string;
}
export interface Berita {
    id: Id;
    tanggal: string;
    ringkasan: string;
    judul: string;
    tautan: string;
    gambarUrl: string;
    sumber: SumberBerita;
}
export interface Cell {
    value: Value;
    name: string;
}
export type Id = bigint;
export interface JadwalUpj {
    id: Id;
    tugas: string;
    tanggal: string;
    hari: string;
    namaSiswa: string;
    kelas: string;
}
export type JenisMutasiStok = string;
export type JenisNota = string;
export type JenisPeminjaman = string;
export type Lab = string;
export type LoginResult = {
    __kind__: "ok";
    ok: Session;
} | {
    __kind__: "invalidCredentials";
    invalidCredentials: null;
};
export interface MutasiStok {
    id: Id;
    jumlah: bigint;
    jenis: JenisMutasiStok;
    keterangan: string;
    sparepartId: Id;
    waktu: Timestamp;
}
export interface Nota {
    id: Id;
    tanggal: string;
    nominal: bigint;
    jenis: JenisNota;
    kategori: string;
    keterangan: string;
}
export interface Peminjaman {
    id: Id;
    status: StatusPeminjaman;
    jumlah: bigint;
    tanggalPinjam: string;
    keperluan: string;
    jenis: JenisPeminjaman;
    namaTarget: string;
    namaPeminjam: string;
    sumber: SumberPeminjaman;
    tanggalKembali?: string;
    targetId: Id;
    kelas: string;
    kondisiKembali?: string;
    kontak?: string;
}
export interface PeminjamanLab {
    id: Id;
    lab: Lab;
    status: StatusPeminjamanLab;
    jamSelesai: string;
    keperluan: string;
    tanggal: string;
    namaPeminjam: string;
    jamMulai: string;
    waktuDibuat: Timestamp;
    kelas: string;
    kontak?: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface RingkasanKategori {
    jumlahTotal: bigint;
    kategori: string;
    jumlahTersedia: bigint;
}
export interface RingkasanKeuangan {
    totalMasuk: bigint;
    saldo: bigint;
    totalKeluar: bigint;
}
export interface Session {
    username: string;
    loginAt: bigint;
}
export interface Sparepart {
    id: Id;
    satuan: string;
    kode: string;
    nama: string;
    ambangMinimum: bigint;
    kategori: string;
    jumlahStok: bigint;
}
export type StatusPeminjaman = string;
export type StatusPeminjamanLab = string;
export type SumberBerita = string;
export type SumberPeminjaman = string;
export type Timestamp = bigint;
export interface Trainer {
    id: Id;
    jumlahTotal: bigint;
    nama: string;
    kategori: string;
    jumlahTersedia: bigint;
    keterangan: string;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface backendInterface {
    addAlat(nama: string, kategori: string, jumlahTotal: bigint, keterangan: string): Promise<Alat>;
    /**
     * / Admin: menambah berita manual.
     */
    addBerita(judul: string, ringkasan: string, gambarUrl: string, tautan: string, tanggal: string): Promise<Berita | null>;
    addJadwal(hari: string, tanggal: string, namaSiswa: string, kelas: string, tugas: string): Promise<JadwalUpj>;
    addNota(tanggal: string, keterangan: string, jenis: JenisNota, kategori: string, nominal: bigint): Promise<Nota>;
    /**
     * / Admin: menambah data peminjaman lab secara langsung.
     */
    addPeminjamanLab(lab: Lab, namaPeminjam: string, kelas: string, kontak: string, tanggal: string, jamMulai: string, jamSelesai: string, keperluan: string, status: StatusPeminjamanLab): Promise<PeminjamanLab | null>;
    addSparepart(nama: string, kode: string, kategori: string, jumlahStok: bigint, satuan: string, ambangMinimum: bigint): Promise<Sparepart>;
    addTrainer(nama: string, kategori: string, jumlahTotal: bigint, keterangan: string): Promise<Trainer>;
    /**
     * / Publik: pengunjung mengajukan permintaan peminjaman Alat tanpa login.
     * / Hanya untuk Alat — tidak ada jalur anonim untuk Trainer.
     */
    ajukanPeminjamanAlat(targetId: Id, namaPeminjam: string, kelas: string, jumlah: bigint, tanggalPinjam: string, keperluan: string, kontak: string): Promise<Peminjaman | null>;
    /**
     * / Publik: pengunjung mengajukan peminjaman lab tanpa login.
     */
    ajukanPeminjamanLab(lab: Lab, namaPeminjam: string, kelas: string, kontak: string, tanggal: string, jamMulai: string, jamSelesai: string, keperluan: string): Promise<PeminjamanLab | null>;
    catatMutasiStok(sparepartId: Id, jenis: JenisMutasiStok, jumlah: bigint, keterangan: string): Promise<MutasiStok | null>;
    /**
     * / Admin: mencatat peminjaman Alat; mengurangi stok alat.
     */
    catatPeminjamanAlat(targetId: Id, namaPeminjam: string, kelas: string, jumlah: bigint, tanggalPinjam: string, keperluan: string): Promise<Peminjaman | null>;
    /**
     * / Admin: mencatat peminjaman Trainer; mengurangi stok unit Trainer.
     */
    catatPeminjamanTrainer(targetId: Id, namaPeminjam: string, kelas: string, jumlah: bigint, tanggalPinjam: string, keperluan: string): Promise<Peminjaman | null>;
    /**
     * / Admin: mencatat pengembalian; mengembalikan stok inventaris terkait.
     */
    catatPengembalian(id: Id, tanggalKembali: string, kondisiKembali: string): Promise<Peminjaman | null>;
    deleteAlat(id: Id): Promise<boolean>;
    /**
     * / Admin: menghapus berita manual.
     */
    deleteBerita(id: Id): Promise<boolean>;
    deleteJadwal(id: Id): Promise<boolean>;
    deleteNota(id: Id): Promise<boolean>;
    /**
     * / Admin: menghapus data peminjaman lab.
     */
    deletePeminjamanLab(id: Id): Promise<boolean>;
    deleteSparepart(id: Id): Promise<boolean>;
    deleteTrainer(id: Id): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getAlat(id: Id): Promise<Alat | null>;
    getApiDoc(): Promise<string>;
    /**
     * / Publik: detail satu berita.
     */
    getBerita(id: Id): Promise<Berita | null>;
    /**
     * / Publik: URL feed Instagram yang ditempel admin (kosong bila belum diatur).
     */
    getFeedUrl(): Promise<string>;
    getJadwal(id: Id): Promise<JadwalUpj | null>;
    getNota(id: Id): Promise<Nota | null>;
    getPeminjaman(id: Id): Promise<Peminjaman | null>;
    /**
     * / Publik: detail satu peminjaman lab.
     */
    getPeminjamanLab(id: Id): Promise<PeminjamanLab | null>;
    /**
     * / Mengembalikan sesi pemanggil, atau `null` bila belum login.
     */
    getSession(): Promise<Session | null>;
    getSparepart(id: Id): Promise<Sparepart | null>;
    getTrainer(id: Id): Promise<Trainer | null>;
    /**
     * / `true` bila pemanggil sudah login sebagai admin.
     */
    isCallerAdmin(): Promise<boolean>;
    listAlat(): Promise<Array<Alat>>;
    /**
     * / Publik: seluruh berita manual yang diisi admin.
     */
    listBerita(): Promise<Array<Berita>>;
    listJadwal(): Promise<Array<JadwalUpj>>;
    listMutasiStok(sparepartId: Id | null): Promise<Array<MutasiStok>>;
    listNota(jenis: JenisNota | null, dariTanggal: string | null, sampaiTanggal: string | null): Promise<Array<Nota>>;
    listPeminjaman(jenis: JenisPeminjaman | null, status: StatusPeminjaman | null, cari: string | null): Promise<Array<Peminjaman>>;
    /**
     * / Publik: seluruh jadwal peminjaman lab, dapat difilter per lab.
     */
    listPeminjamanLab(lab: Lab | null): Promise<Array<PeminjamanLab>>;
    listSparepart(): Promise<Array<Sparepart>>;
    listStokMenipis(): Promise<Array<Sparepart>>;
    listTrainer(): Promise<Array<Trainer>>;
    /**
     * / Memverifikasi kredensial akun bawaan dan memulai sesi untuk pemanggil.
     */
    login(username: string, password: string): Promise<LoginResult>;
    /**
     * / Mengakhiri sesi pemanggil.
     */
    logout(): Promise<void>;
    ringkasanAlatPerKategori(): Promise<Array<RingkasanKategori>>;
    ringkasanKeuangan(): Promise<RingkasanKeuangan>;
    ringkasanTrainerPerKategori(): Promise<Array<RingkasanKategori>>;
    schema(): Promise<string>;
    /**
     * / Admin: menyimpan URL feed publik Instagram.
     */
    setFeedUrl(url: string): Promise<void>;
    /**
     * / Admin: menyetujui permintaan pengunjung; mengurangi stok inventaris terkait.
     */
    setujuiPeminjaman(id: Id): Promise<Peminjaman | null>;
    /**
     * / Admin: menolak permintaan pengunjung tanpa mengubah stok.
     */
    tolakPeminjaman(id: Id): Promise<Peminjaman | null>;
    updateAlat(id: Id, nama: string, kategori: string, jumlahTotal: bigint, keterangan: string): Promise<Alat | null>;
    /**
     * / Admin: mengubah berita manual.
     */
    updateBerita(id: Id, judul: string, ringkasan: string, gambarUrl: string, tautan: string, tanggal: string): Promise<Berita | null>;
    updateJadwal(id: Id, hari: string, tanggal: string, namaSiswa: string, kelas: string, tugas: string): Promise<JadwalUpj | null>;
    updateNota(id: Id, tanggal: string, keterangan: string, jenis: JenisNota, kategori: string, nominal: bigint): Promise<Nota | null>;
    /**
     * / Admin: mengubah data peminjaman lab.
     */
    updatePeminjamanLab(id: Id, lab: Lab, namaPeminjam: string, kelas: string, kontak: string, tanggal: string, jamMulai: string, jamSelesai: string, keperluan: string, status: StatusPeminjamanLab): Promise<PeminjamanLab | null>;
    updateSparepart(id: Id, nama: string, kode: string, kategori: string, satuan: string, ambangMinimum: bigint): Promise<Sparepart | null>;
    updateTrainer(id: Id, nama: string, kategori: string, jumlahTotal: bigint, keterangan: string): Promise<Trainer | null>;
}
