import Common "common";

module {
  public type Id = Common.Id;

  /// Sumber berita: `"instagram"` (dari feed) atau `"manual"` (diisi admin).
  public type SumberBerita = Text;

  public type Berita = {
    id : Common.Id;
    judul : Text;
    ringkasan : Text;
    gambarUrl : Text;
    tautan : Text;
    tanggal : Text;
    sumber : SumberBerita;
  };

  /// Pengaturan tunggal berita: URL feed publik Instagram yang ditempel admin.
  public type PengaturanBerita = {
    feedUrl : Text;
  };
};
