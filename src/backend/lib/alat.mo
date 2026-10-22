import Map "mo:core/Map";
import Types "../types/alat";

module {
  public func listAlat(alat : Map.Map<Types.Id, Types.Alat>) : [Types.Alat] {
    alat.values().toArray();
  };

  public func getAlat(alat : Map.Map<Types.Id, Types.Alat>, id : Types.Id) : ?Types.Alat {
    alat.get(id);
  };

  public func addAlat(
    alat : Map.Map<Types.Id, Types.Alat>,
    state : { var nextAlatId : Nat },
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : Types.Alat {
    let id = state.nextAlatId;
    state.nextAlatId := id + 1;
    let item : Types.Alat = {
      id;
      nama;
      kategori;
      jumlahTotal;
      jumlahTersedia = jumlahTotal;
      keterangan;
    };
    alat.add(id, item);
    item;
  };

  public func updateAlat(
    alat : Map.Map<Types.Id, Types.Alat>,
    id : Types.Id,
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : ?Types.Alat {
    switch (alat.get(id)) {
      case null { null };
      case (?existing) {
        let dipinjam = if (existing.jumlahTotal > existing.jumlahTersedia) {
          existing.jumlahTotal - existing.jumlahTersedia;
        } else {
          0;
        };
        let tersediaBaru = if (jumlahTotal > dipinjam) { jumlahTotal - dipinjam } else { 0 };
        let updated : Types.Alat = {
          id;
          nama;
          kategori;
          jumlahTotal;
          jumlahTersedia = tersediaBaru;
          keterangan;
        };
        alat.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteAlat(alat : Map.Map<Types.Id, Types.Alat>, id : Types.Id) : Bool {
    switch (alat.get(id)) {
      case null { false };
      case (?_) {
        alat.remove(id);
        true;
      };
    };
  };

  public func ringkasanPerKategori(alat : Map.Map<Types.Id, Types.Alat>) : [Types.RingkasanKategori] {
    let totals = Map.empty<Text, { var jumlahTotal : Nat; var jumlahTersedia : Nat }>();
    for (item in alat.values()) {
      let entry = switch (totals.get(item.kategori)) {
        case (?e) { e };
        case null {
          let e = { var jumlahTotal = 0; var jumlahTersedia = 0 };
          totals.add(item.kategori, e);
          e;
        };
      };
      entry.jumlahTotal := entry.jumlahTotal + item.jumlahTotal;
      entry.jumlahTersedia := entry.jumlahTersedia + item.jumlahTersedia;
    };
    totals.entries().map(
      func((kategori, e)) {
        { kategori; jumlahTotal = e.jumlahTotal; jumlahTersedia = e.jumlahTersedia };
      }
    ).toArray();
  };
};
