import Common "common";

module {
  public type Id = Common.Id;

  public type JadwalUpj = {
    id : Common.Id;
    hari : Text;
    tanggal : Text;
    namaSiswa : Text;
    kelas : Text;
    tugas : Text;
  };
};
