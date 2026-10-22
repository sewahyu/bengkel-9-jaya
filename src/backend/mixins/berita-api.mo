import Map "mo:core/Map";
import Types "../types/berita";
import BeritaLib "../lib/berita";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  berita : Map.Map<Types.Id, Types.Berita>,
  pengaturan : { var feedUrl : Text },
  state : { var nextBeritaId : Nat },
) {
  func requireAdminBerita(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  /// Publik: seluruh berita manual yang diisi admin.
  public query func listBerita() : async [Types.Berita] {
    BeritaLib.listBerita(berita);
  };

  /// Publik: detail satu berita.
  public query func getBerita(id : Types.Id) : async ?Types.Berita {
    BeritaLib.getBerita(berita, id);
  };

  /// Publik: URL feed Instagram yang ditempel admin (kosong bila belum diatur).
  public query func getFeedUrl() : async Text {
    BeritaLib.getFeedUrl(pengaturan);
  };

  /// Admin: menambah berita manual.
  public shared ({ caller }) func addBerita(
    judul : Text,
    ringkasan : Text,
    gambarUrl : Text,
    tautan : Text,
    tanggal : Text,
  ) : async ?Types.Berita {
    requireAdminBerita(caller);
    BeritaLib.addBerita(berita, state, judul, ringkasan, gambarUrl, tautan, tanggal);
  };

  /// Admin: mengubah berita manual.
  public shared ({ caller }) func updateBerita(
    id : Types.Id,
    judul : Text,
    ringkasan : Text,
    gambarUrl : Text,
    tautan : Text,
    tanggal : Text,
  ) : async ?Types.Berita {
    requireAdminBerita(caller);
    BeritaLib.updateBerita(berita, id, judul, ringkasan, gambarUrl, tautan, tanggal);
  };

  /// Admin: menghapus berita manual.
  public shared ({ caller }) func deleteBerita(id : Types.Id) : async Bool {
    requireAdminBerita(caller);
    BeritaLib.deleteBerita(berita, id);
  };

  /// Admin: menyimpan URL feed publik Instagram.
  public shared ({ caller }) func setFeedUrl(url : Text) : async () {
    requireAdminBerita(caller);
    BeritaLib.setFeedUrl(pengaturan, url);
  };
};
