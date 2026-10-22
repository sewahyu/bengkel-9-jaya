import Map "mo:core/Map";
import Types "../types/berita";

module {
  public func listBerita(berita : Map.Map<Types.Id, Types.Berita>) : [Types.Berita] {
    berita.values().toArray();
  };

  public func getBerita(berita : Map.Map<Types.Id, Types.Berita>, id : Types.Id) : ?Types.Berita {
    berita.get(id);
  };

  /// Admin: menambah berita manual; sumber `"manual"`.
  public func addBerita(
    berita : Map.Map<Types.Id, Types.Berita>,
    state : { var nextBeritaId : Nat },
    judul : Text,
    ringkasan : Text,
    gambarUrl : Text,
    tautan : Text,
    tanggal : Text,
  ) : ?Types.Berita {
    let id = state.nextBeritaId;
    state.nextBeritaId := id + 1;
    let record : Types.Berita = {
      id;
      judul;
      ringkasan;
      gambarUrl;
      tautan;
      tanggal;
      sumber = "manual";
    };
    berita.add(id, record);
    ?record;
  };

  /// Admin: mengubah berita manual.
  public func updateBerita(
    berita : Map.Map<Types.Id, Types.Berita>,
    id : Types.Id,
    judul : Text,
    ringkasan : Text,
    gambarUrl : Text,
    tautan : Text,
    tanggal : Text,
  ) : ?Types.Berita {
    switch (berita.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Types.Berita = {
          id = existing.id;
          judul;
          ringkasan;
          gambarUrl;
          tautan;
          tanggal;
          sumber = existing.sumber;
        };
        berita.add(id, updated);
        ?updated;
      };
    };
  };

  /// Admin: menghapus berita manual.
  public func deleteBerita(berita : Map.Map<Types.Id, Types.Berita>, id : Types.Id) : Bool {
    switch (berita.get(id)) {
      case null { false };
      case (?_) {
        berita.remove(id);
        true;
      };
    };
  };

  /// URL feed publik Instagram yang ditempel admin (kosong bila belum diatur).
  public func getFeedUrl(pengaturan : { var feedUrl : Text }) : Text {
    pengaturan.feedUrl;
  };

  /// Admin: menyimpan URL feed publik Instagram.
  public func setFeedUrl(pengaturan : { var feedUrl : Text }, url : Text) {
    pengaturan.feedUrl := url;
  };
};
