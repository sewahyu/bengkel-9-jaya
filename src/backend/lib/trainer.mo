import Map "mo:core/Map";
import Types "../types/trainer";

module {
  public func listTrainer(trainer : Map.Map<Types.Id, Types.Trainer>) : [Types.Trainer] {
    trainer.values().toArray();
  };

  public func getTrainer(trainer : Map.Map<Types.Id, Types.Trainer>, id : Types.Id) : ?Types.Trainer {
    trainer.get(id);
  };

  public func addTrainer(
    trainer : Map.Map<Types.Id, Types.Trainer>,
    state : { var nextTrainerId : Nat },
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : Types.Trainer {
    let id = state.nextTrainerId;
    state.nextTrainerId := id + 1;
    let item : Types.Trainer = {
      id;
      nama;
      kategori;
      jumlahTotal;
      jumlahTersedia = jumlahTotal;
      keterangan;
    };
    trainer.add(id, item);
    item;
  };

  public func updateTrainer(
    trainer : Map.Map<Types.Id, Types.Trainer>,
    id : Types.Id,
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : ?Types.Trainer {
    switch (trainer.get(id)) {
      case null { null };
      case (?existing) {
        let dipinjam = if (existing.jumlahTotal > existing.jumlahTersedia) {
          existing.jumlahTotal - existing.jumlahTersedia;
        } else {
          0;
        };
        let tersediaBaru = if (jumlahTotal > dipinjam) { jumlahTotal - dipinjam } else { 0 };
        let updated : Types.Trainer = {
          id;
          nama;
          kategori;
          jumlahTotal;
          jumlahTersedia = tersediaBaru;
          keterangan;
        };
        trainer.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteTrainer(trainer : Map.Map<Types.Id, Types.Trainer>, id : Types.Id) : Bool {
    switch (trainer.get(id)) {
      case null { false };
      case (?_) {
        trainer.remove(id);
        true;
      };
    };
  };

  public func ringkasanPerKategori(trainer : Map.Map<Types.Id, Types.Trainer>) : [Types.RingkasanKategori] {
    let totals = Map.empty<Text, { var jumlahTotal : Nat; var jumlahTersedia : Nat }>();
    for (item in trainer.values()) {
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
