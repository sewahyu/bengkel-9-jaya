import Map "mo:core/Map";
import Types "../types/trainer";
import TrainerLib "../lib/trainer";
import Access "../lib/access";

mixin (
  sessions : Access.SessionState,
  trainer : Map.Map<Types.Id, Types.Trainer>,
  state : { var nextTrainerId : Nat },
) {
  func requireAdminTrainer(caller : Principal) {
    Access.requireAdmin(
      sessions,
      caller,
      "Unauthorized: Hanya admin yang dapat melakukan tindakan ini",
    );
  };

  public query func listTrainer() : async [Types.Trainer] {
    TrainerLib.listTrainer(trainer);
  };

  public query func getTrainer(id : Types.Id) : async ?Types.Trainer {
    TrainerLib.getTrainer(trainer, id);
  };

  public query func ringkasanTrainerPerKategori() : async [Types.RingkasanKategori] {
    TrainerLib.ringkasanPerKategori(trainer);
  };

  public shared ({ caller }) func addTrainer(
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : async Types.Trainer {
    requireAdminTrainer(caller);
    TrainerLib.addTrainer(trainer, state, nama, kategori, jumlahTotal, keterangan);
  };

  public shared ({ caller }) func updateTrainer(
    id : Types.Id,
    nama : Text,
    kategori : Text,
    jumlahTotal : Nat,
    keterangan : Text,
  ) : async ?Types.Trainer {
    requireAdminTrainer(caller);
    TrainerLib.updateTrainer(trainer, id, nama, kategori, jumlahTotal, keterangan);
  };

  public shared ({ caller }) func deleteTrainer(id : Types.Id) : async Bool {
    requireAdminTrainer(caller);
    TrainerLib.deleteTrainer(trainer, id);
  };
};
