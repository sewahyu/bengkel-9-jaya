import Map "mo:core/Map";
import Types "../types/keuangan";
import KeuanganLib "../lib/keuangan";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  nota : Map.Map<Types.Id, Types.Nota>,
  state : { var nextNotaId : Nat },
) {
  func requireAdminKeuangan(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Data keuangan hanya dapat diakses admin yang sudah login",
    );
  };

  public query ({ caller }) func listNota(
    jenis : ?Types.JenisNota,
    dariTanggal : ?Text,
    sampaiTanggal : ?Text,
  ) : async [Types.Nota] {
    requireAdminKeuangan(caller);
    KeuanganLib.listNota(nota, jenis, dariTanggal, sampaiTanggal);
  };

  public query ({ caller }) func getNota(id : Types.Id) : async ?Types.Nota {
    requireAdminKeuangan(caller);
    KeuanganLib.getNota(nota, id);
  };

  public query ({ caller }) func ringkasanKeuangan() : async Types.RingkasanKeuangan {
    requireAdminKeuangan(caller);
    KeuanganLib.ringkasanKeuangan(nota);
  };

  public shared ({ caller }) func addNota(
    tanggal : Text,
    keterangan : Text,
    jenis : Types.JenisNota,
    kategori : Text,
    nominal : Nat,
  ) : async Types.Nota {
    requireAdminKeuangan(caller);
    KeuanganLib.addNota(nota, state, tanggal, keterangan, jenis, kategori, nominal);
  };

  public shared ({ caller }) func updateNota(
    id : Types.Id,
    tanggal : Text,
    keterangan : Text,
    jenis : Types.JenisNota,
    kategori : Text,
    nominal : Nat,
  ) : async ?Types.Nota {
    requireAdminKeuangan(caller);
    KeuanganLib.updateNota(nota, id, tanggal, keterangan, jenis, kategori, nominal);
  };

  public shared ({ caller }) func deleteNota(id : Types.Id) : async Bool {
    requireAdminKeuangan(caller);
    KeuanganLib.deleteNota(nota, id);
  };
};
