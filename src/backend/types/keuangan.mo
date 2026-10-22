import Common "common";

module {
  public type Id = Common.Id;

  /// Jenis nota keuangan: `"masuk"` (uang masuk) atau `"keluar"` (uang keluar).
  public type JenisNota = Text;

  public type Nota = {
    id : Common.Id;
    tanggal : Text;
    keterangan : Text;
    jenis : JenisNota;
    kategori : Text;
    nominal : Nat;
  };

  public type RingkasanKeuangan = {
    totalMasuk : Nat;
    totalKeluar : Nat;
    saldo : Int;
  };
};
