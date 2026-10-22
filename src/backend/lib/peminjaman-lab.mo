import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/peminjaman-lab";

module {
  public func listPeminjamanLab(
    peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
    lab : ?Types.Lab,
  ) : [Types.PeminjamanLab] {
    let all = peminjamanLab.values().toArray();
    switch (lab) {
      case null { all };
      case (?l) { all.filter(func(p) = p.lab == l) };
    };
  };

  public func getPeminjamanLab(
    peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
    id : Types.Id,
  ) : ?Types.PeminjamanLab {
    peminjamanLab.get(id);
  };

  /// Pengunjung: mengajukan peminjaman lab; status `"menunggu"`.
  public func ajukanPeminjamanLab(
    peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
    state : { var nextPeminjamanLabId : Nat },
    lab : Types.Lab,
    namaPeminjam : Text,
    kelas : Text,
    kontak : Text,
    tanggal : Text,
    jamMulai : Text,
    jamSelesai : Text,
    keperluan : Text,
  ) : ?Types.PeminjamanLab {
    let id = state.nextPeminjamanLabId;
    state.nextPeminjamanLabId := id + 1;
    let record : Types.PeminjamanLab = {
      id;
      lab;
      namaPeminjam;
      kelas;
      kontak = ?kontak;
      tanggal;
      jamMulai;
      jamSelesai;
      keperluan;
      status = "menunggu";
      waktuDibuat = Time.now();
    };
    peminjamanLab.add(id, record);
    ?record;
  };

  /// Admin: menambah data peminjaman lab secara langsung.
  public func addPeminjamanLab(
    peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
    state : { var nextPeminjamanLabId : Nat },
    lab : Types.Lab,
    namaPeminjam : Text,
    kelas : Text,
    kontak : Text,
    tanggal : Text,
    jamMulai : Text,
    jamSelesai : Text,
    keperluan : Text,
    status : Types.StatusPeminjamanLab,
  ) : ?Types.PeminjamanLab {
    let id = state.nextPeminjamanLabId;
    state.nextPeminjamanLabId := id + 1;
    let record : Types.PeminjamanLab = {
      id;
      lab;
      namaPeminjam;
      kelas;
      kontak = ?kontak;
      tanggal;
      jamMulai;
      jamSelesai;
      keperluan;
      status;
      waktuDibuat = Time.now();
    };
    peminjamanLab.add(id, record);
    ?record;
  };

  /// Admin: mengubah data peminjaman lab.
  public func updatePeminjamanLab(
    peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
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
  ) : ?Types.PeminjamanLab {
    switch (peminjamanLab.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Types.PeminjamanLab = {
          id = existing.id;
          lab;
          namaPeminjam;
          kelas;
          kontak = ?kontak;
          tanggal;
          jamMulai;
          jamSelesai;
          keperluan;
          status;
          waktuDibuat = existing.waktuDibuat;
        };
        peminjamanLab.add(id, updated);
        ?updated;
      };
    };
  };

  /// Admin: menghapus data peminjaman lab.
  public func deletePeminjamanLab(
    peminjamanLab : Map.Map<Types.Id, Types.PeminjamanLab>,
    id : Types.Id,
  ) : Bool {
    switch (peminjamanLab.get(id)) {
      case null { false };
      case (?_) {
        peminjamanLab.remove(id);
        true;
      };
    };
  };
};
