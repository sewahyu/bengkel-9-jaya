import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/sparepart";
import SparepartLib "../lib/sparepart";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  sparepart : Map.Map<Types.Id, Types.Sparepart>,
  mutasi : Map.Map<Types.Id, Types.MutasiStok>,
  state : { var nextSparepartId : Nat; var nextMutasiId : Nat },
) {
  func requireAdminSparepart(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  public query func listSparepart() : async [Types.Sparepart] {
    SparepartLib.listSparepart(sparepart);
  };

  public query func getSparepart(id : Types.Id) : async ?Types.Sparepart {
    SparepartLib.getSparepart(sparepart, id);
  };

  public query func listStokMenipis() : async [Types.Sparepart] {
    SparepartLib.listStokMenipis(sparepart);
  };

  public query func listMutasiStok(sparepartId : ?Types.Id) : async [Types.MutasiStok] {
    SparepartLib.listMutasiStok(mutasi, sparepartId);
  };

  public shared ({ caller }) func addSparepart(
    nama : Text,
    kode : Text,
    kategori : Text,
    jumlahStok : Nat,
    satuan : Text,
    ambangMinimum : Nat,
  ) : async Types.Sparepart {
    requireAdminSparepart(caller);
    SparepartLib.addSparepart(sparepart, state, nama, kode, kategori, jumlahStok, satuan, ambangMinimum);
  };

  public shared ({ caller }) func updateSparepart(
    id : Types.Id,
    nama : Text,
    kode : Text,
    kategori : Text,
    satuan : Text,
    ambangMinimum : Nat,
  ) : async ?Types.Sparepart {
    requireAdminSparepart(caller);
    SparepartLib.updateSparepart(sparepart, id, nama, kode, kategori, satuan, ambangMinimum);
  };

  public shared ({ caller }) func deleteSparepart(id : Types.Id) : async Bool {
    requireAdminSparepart(caller);
    SparepartLib.deleteSparepart(sparepart, id);
  };

  public shared ({ caller }) func catatMutasiStok(
    sparepartId : Types.Id,
    jenis : Types.JenisMutasiStok,
    jumlah : Nat,
    keterangan : Text,
  ) : async ?Types.MutasiStok {
    requireAdminSparepart(caller);
    SparepartLib.catatMutasiStok(sparepart, mutasi, state, sparepartId, jenis, jumlah, keterangan, Time.now());
  };
};
