import Map "mo:core/Map";
import Types "../types/jadwal";

module {
  public func listJadwal(jadwal : Map.Map<Types.Id, Types.JadwalUpj>) : [Types.JadwalUpj] {
    jadwal.values().toArray();
  };

  public func getJadwal(jadwal : Map.Map<Types.Id, Types.JadwalUpj>, id : Types.Id) : ?Types.JadwalUpj {
    jadwal.get(id);
  };

  public func addJadwal(
    jadwal : Map.Map<Types.Id, Types.JadwalUpj>,
    state : { var nextJadwalId : Nat },
    hari : Text,
    tanggal : Text,
    namaSiswa : Text,
    kelas : Text,
    tugas : Text,
  ) : Types.JadwalUpj {
    let id = state.nextJadwalId;
    state.nextJadwalId := id + 1;
    let item : Types.JadwalUpj = { id; hari; tanggal; namaSiswa; kelas; tugas };
    jadwal.add(id, item);
    item;
  };

  public func updateJadwal(
    jadwal : Map.Map<Types.Id, Types.JadwalUpj>,
    id : Types.Id,
    hari : Text,
    tanggal : Text,
    namaSiswa : Text,
    kelas : Text,
    tugas : Text,
  ) : ?Types.JadwalUpj {
    switch (jadwal.get(id)) {
      case null { null };
      case (?_) {
        let updated : Types.JadwalUpj = { id; hari; tanggal; namaSiswa; kelas; tugas };
        jadwal.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteJadwal(jadwal : Map.Map<Types.Id, Types.JadwalUpj>, id : Types.Id) : Bool {
    switch (jadwal.get(id)) {
      case null { false };
      case (?_) {
        jadwal.remove(id);
        true;
      };
    };
  };
};
