import Map "mo:core/Map";
import TrainerTypes "../types/trainer";
import AlatTypes "../types/alat";
import Types "../types/peminjaman";
import PeminjamanLib "../lib/peminjaman";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
  trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>,
  alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
  state : { var nextPeminjamanId : Nat },
) {
  func requireAdminPeminjaman(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  public query ({ caller }) func listPeminjaman(
    jenis : ?Types.JenisPeminjaman,
    status : ?Types.StatusPeminjaman,
    cari : ?Text,
  ) : async [Types.Peminjaman] {
    requireAdminPeminjaman(caller);
    PeminjamanLib.listPeminjaman(peminjaman, jenis, status, cari);
  };

  public query ({ caller }) func getPeminjaman(id : Types.Id) : async ?Types.Peminjaman {
    requireAdminPeminjaman(caller);
    PeminjamanLib.getPeminjaman(peminjaman, id);
  };

  /// Admin: mencatat peminjaman Trainer; mengurangi stok unit Trainer.
  public shared ({ caller }) func catatPeminjamanTrainer(
    targetId : TrainerTypes.Id,
    namaPeminjam : Text,
    kelas : Text,
    jumlah : Nat,
    tanggalPinjam : Text,
    keperluan : Text,
  ) : async ?Types.Peminjaman {
    requireAdminPeminjaman(caller);
    PeminjamanLib.catatPeminjamanTrainer(
      peminjaman,
      trainer,
      state,
      targetId,
      namaPeminjam,
      kelas,
      jumlah,
      tanggalPinjam,
      keperluan,
    );
  };

  /// Admin: mencatat peminjaman Alat; mengurangi stok alat.
  public shared ({ caller }) func catatPeminjamanAlat(
    targetId : AlatTypes.Id,
    namaPeminjam : Text,
    kelas : Text,
    jumlah : Nat,
    tanggalPinjam : Text,
    keperluan : Text,
  ) : async ?Types.Peminjaman {
    requireAdminPeminjaman(caller);
    PeminjamanLib.catatPeminjamanAlat(
      peminjaman,
      alat,
      state,
      targetId,
      namaPeminjam,
      kelas,
      jumlah,
      tanggalPinjam,
      keperluan,
    );
  };

  /// Publik: pengunjung mengajukan permintaan peminjaman Alat tanpa login.
  /// Hanya untuk Alat — tidak ada jalur anonim untuk Trainer.
  public shared ({ caller }) func ajukanPeminjamanAlat(
    targetId : AlatTypes.Id,
    namaPeminjam : Text,
    kelas : Text,
    jumlah : Nat,
    tanggalPinjam : Text,
    keperluan : Text,
    kontak : Text,
  ) : async ?Types.Peminjaman {
    ignore caller;
    PeminjamanLib.ajukanPeminjamanAlat(
      peminjaman,
      alat,
      state,
      targetId,
      namaPeminjam,
      kelas,
      jumlah,
      tanggalPinjam,
      keperluan,
      kontak,
    );
  };

  /// Admin: menyetujui permintaan pengunjung; mengurangi stok inventaris terkait.
  public shared ({ caller }) func setujuiPeminjaman(id : Types.Id) : async ?Types.Peminjaman {
    requireAdminPeminjaman(caller);
    PeminjamanLib.setujuiPeminjaman(peminjaman, trainer, alat, id);
  };

  /// Admin: menolak permintaan pengunjung tanpa mengubah stok.
  public shared ({ caller }) func tolakPeminjaman(id : Types.Id) : async ?Types.Peminjaman {
    requireAdminPeminjaman(caller);
    PeminjamanLib.tolakPeminjaman(peminjaman, id);
  };

  /// Admin: mencatat pengembalian; mengembalikan stok inventaris terkait.
  public shared ({ caller }) func catatPengembalian(
    id : Types.Id,
    tanggalKembali : Text,
    kondisiKembali : Text,
  ) : async ?Types.Peminjaman {
    requireAdminPeminjaman(caller);
    PeminjamanLib.catatPengembalian(peminjaman, trainer, alat, id, tanggalKembali, kondisiKembali);
  };
};
