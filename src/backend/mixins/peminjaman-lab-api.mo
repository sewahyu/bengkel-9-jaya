import Map "mo:core/Map";
import Types "../types/peminjaman-lab";
import PeminjamanLabLib "../lib/peminjaman-lab";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
  state : { var nextPeminjamanLabId : Nat },
) {
  func requireAdminPeminjamanLab(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  /// Publik: seluruh jadwal peminjaman lab, dapat difilter per lab.
  public query func listPeminjamanLab(lab : ?Types.Lab) : async [Types.PeminjamanLab] {
    PeminjamanLabLib.listPeminjamanLab(peminjamanLab, lab);
  };

  /// Publik: detail satu peminjaman lab.
  public query func getPeminjamanLab(id : Types.Id) : async ?Types.PeminjamanLab {
    PeminjamanLabLib.getPeminjamanLab(peminjamanLab, id);
  };

  /// Publik: pengunjung mengajukan peminjaman lab tanpa login.
  public shared ({ caller }) func ajukanPeminjamanLab(
    lab : Types.Lab,
    namaPeminjam : Text,
    kelas : Text,
    kontak : Text,
    tanggal : Text,
    jamMulai : Text,
    jamSelesai : Text,
    keperluan : Text,
  ) : async ?Types.PeminjamanLab {
    ignore caller;
    PeminjamanLabLib.ajukanPeminjamanLab(
      peminjamanLab,
      state,
      lab,
      namaPeminjam,
      kelas,
      kontak,
      tanggal,
      jamMulai,
      jamSelesai,
      keperluan,
    );
  };

  /// Admin: menambah data peminjaman lab secara langsung.
  public shared ({ caller }) func addPeminjamanLab(
    lab : Types.Lab,
    namaPeminjam : Text,
    kelas : Text,
    kontak : Text,
    tanggal : Text,
    jamMulai : Text,
    jamSelesai : Text,
    keperluan : Text,
    status : Types.StatusPeminjamanLab,
  ) : async ?Types.PeminjamanLab {
    requireAdminPeminjamanLab(caller);
    PeminjamanLabLib.addPeminjamanLab(
      peminjamanLab,
      state,
      lab,
      namaPeminjam,
      kelas,
      kontak,
      tanggal,
      jamMulai,
      jamSelesai,
      keperluan,
      status,
    );
  };

  /// Admin: mengubah data peminjaman lab.
  public shared ({ caller }) func updatePeminjamanLab(
    id : Types.Id,
    lab : Types.Lab,
    namaPeminjam : Text,
    kelas : Text,
    kontak : Text,
    tanggal : Text,
    jamMulai : Text,
    jamSelesai : Text,
    keperluan : Text,
    status : Types.StatusPeminjamanLab,
  ) : async ?Types.PeminjamanLab {
    requireAdminPeminjamanLab(caller);
    PeminjamanLabLib.updatePeminjamanLab(
      peminjamanLab,
      id,
      lab,
      namaPeminjam,
      kelas,
      kontak,
      tanggal,
      jamMulai,
      jamSelesai,
      keperluan,
      status,
    );
  };

  /// Admin: menghapus data peminjaman lab.
  public shared ({ caller }) func deletePeminjamanLab(id : Types.Id) : async Bool {
    requireAdminPeminjamanLab(caller);
    PeminjamanLabLib.deletePeminjamanLab(peminjamanLab, id);
  };
};
