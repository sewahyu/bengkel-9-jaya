import Common "common";

module {
  public type Id = Common.Id;

  public type Sparepart = {
    id : Common.Id;
    nama : Text;
    kode : Text;
    kategori : Text;
    jumlahStok : Nat;
    satuan : Text;
    ambangMinimum : Nat;
  };

  /// Jenis mutasi stok: `"masuk"` (stok bertambah) atau `"keluar"` (stok berkurang).
  public type JenisMutasiStok = Text;

  public type MutasiStok = {
    id : Common.Id;
    sparepartId : Common.Id;
    jenis : JenisMutasiStok;
    jumlah : Nat;
    keterangan : Text;
    waktu : Common.Timestamp;
  };
};
