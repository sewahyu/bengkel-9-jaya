import Map "mo:core/Map";
import Types "../types/alat";
import AlatLib "../lib/alat";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  alat : Map.Map<Types.Id, Types.Alat>,
  state : { var nextAlatId : Nat },
) {
  func requireAdminAlat(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  public query func listAlat() : async [Types.Alat] {
    AlatLib.listAlat(alat);
  };

  public query func getAlat(id : Types.Id) : async ?Types.Alat {
    AlatLib.getAlat(alat, id);
  };

  public query func ringkasanAlatPerKategori() : async [Types.RingkasanKategori] {
    AlatLib.ringkasanPerKategori(alat);
  };

  public shared ({ caller }) func addAlat(
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : async Types.Alat {
    requireAdminAlat(caller);
    AlatLib.addAlat(alat, state, nama, kategori, jumlahTotal, keterangan);
  };

  public shared ({ caller }) func updateAlat(
    id : Types.Id,
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : async ?Types.Alat {
    requireAdminAlat(caller);
    AlatLib.updateAlat(alat, id, nama, kategori, jumlahTotal, keterangan);
  };

  public shared ({ caller }) func deleteAlat(id : Types.Id) : async Bool {
    requireAdminAlat(caller);
    AlatLib.deleteAlat(alat, id);
  };
};
