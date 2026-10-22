import Map "mo:core/Map";
import Types "../types/jadwal";
import JadwalLib "../lib/jadwal";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  jadwal : Map.Map<Types.Id, Types.JadwalUpj>,
  state : { var nextJadwalId : Nat },
) {
  func requireAdminJadwal(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  public query func listJadwal() : async [Types.JadwalUpj] {
    JadwalLib.listJadwal(jadwal);
  };

  public query func getJadwal(id : Types.Id) : async ?Types.JadwalUpj {
    JadwalLib.getJadwal(jadwal, id);
  };

  public shared ({ caller }) func addJadwal(
    hari : Text,
    tanggal : Text,
    namaSiswa : Text,
    kelas : Text,
    tugas : Text,
  ) : async Types.JadwalUpj {
    requireAdminJadwal(caller);
    JadwalLib.addJadwal(jadwal, state, hari, tanggal, namaSiswa, kelas, tugas);
  };

  public shared ({ caller }) func updateJadwal(
    id : Types.Id,
    hari : Text,
    tanggal : Text,
    namaSiswa : Text,
    kelas : Text,
    tugas : Text,
  ) : async ?Types.JadwalUpj {
    requireAdminJadwal(caller);
    JadwalLib.updateJadwal(jadwal, id, hari, tanggal, namaSiswa, kelas, tugas);
  };

  public shared ({ caller }) func deleteJadwal(id : Types.Id) : async Bool {
    requireAdminJadwal(caller);
    JadwalLib.deleteJadwal(jadwal, id);
  };
};
