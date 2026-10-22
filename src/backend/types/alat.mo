import Common "common";

module {
  public type Id = Common.Id;

  /// Inventaris Alat — inventaris baru dengan data sendiri, terpisah dari
  /// Trainer (mis. peralatan tangan dan sejenisnya).
  public type Alat = {
    id : Common.Id;
    nama : Text;
    kategori : Text;
    jumlahTotal : Nat;
    jumlahTersedia : Nat;
    keterangan : Text;
  };

  public type RingkasanKategori = {
    kategori : Text;
    jumlahTotal : Nat;
    jumlahTersedia : Nat;
  };
};
