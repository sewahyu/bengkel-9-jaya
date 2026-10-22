import Common "common";

module {
  public type Id = Common.Id;

  /// Status peminjaman: `"menunggu"`, `"dipinjam"`, `"ditolak"`, atau `"dikembalikan"`.
  public type StatusPeminjaman = Text;

  /// Sumber pencatatan: `"admin"` (dicatat admin) atau `"pengunjung"` (diajukan pengunjung).
  public type SumberPeminjaman = Text;

  /// Jenis target peminjaman: `"trainer"` (inventaris Trainer) atau `"alat"`
  /// (inventaris Alat). Menentukan inventaris mana yang stoknya berubah.
  public type JenisPeminjaman = Text;

  public type Peminjaman = {
    id : Common.Id;
    jenis : JenisPeminjaman;
    targetId : Common.Id;
    namaTarget : Text;
    namaPeminjam : Text;
    kelas : Text;
    jumlah : Nat;
    tanggalPinjam : Text;
    keperluan : Text;
    status : StatusPeminjaman;
    tanggalKembali : ?Text;
    kondisiKembali : ?Text;
    kontak : ?Text;
    sumber : SumberPeminjaman;
  };
};
