import Common "common";

module {
  public type Id = Common.Id;

  /// Nama laboratorium: `"Lab 1 Chasis"`, `"Lab 2 Mesin"`, atau `"Lab 3 Kelistrikan"`.
  public type Lab = Text;

  /// Status peminjaman lab: `"menunggu"`, `"disetujui"`, atau `"ditolak"`.
  public type StatusPeminjamanLab = Text;

  public type PeminjamanLab = {
    id : Common.Id;
    lab : Lab;
    namaPeminjam : Text;
    kelas : Text;
    kontak : ?Text;
    tanggal : Text;
    jamMulai : Text;
    jamSelesai : Text;
    keperluan : Text;
    status : StatusPeminjamanLab;
    waktuDibuat : Common.Timestamp;
  };
};
