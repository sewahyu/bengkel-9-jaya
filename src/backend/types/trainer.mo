import Common "common";

module {
  public type Id = Common.Id;

  /// Unit Trainer — inventaris lama (kategori Mesin, Kelistrikan, Sasis,
  /// Peralatan Tangan, Peralatan Ukur, Keselamatan). Data lama tetap utuh.
  public type Trainer = {
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
