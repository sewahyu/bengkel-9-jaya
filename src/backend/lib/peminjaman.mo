import Map "mo:core/Map";
import TrainerTypes "../types/trainer";
import AlatTypes "../types/alat";
import Types "../types/peminjaman";

module {
  public func listPeminjaman(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    jenis : ?Types.JenisPeminjaman,
    status : ?Types.StatusPeminjaman,
    cari : ?Text,
  ) : [Types.Peminjaman] {
    let all = peminjaman.values().toArray();
    all.filter(
      func(p) {
        let jenisOk = switch (jenis) {
          case null { true };
          case (?j) { p.jenis == j };
        };
        let statusOk = switch (status) {
          case null { true };
          case (?s) { p.status == s };
        };
        let cariOk = switch (cari) {
          case null { true };
          case (?q) {
            let term = q.toLower();
            p.namaPeminjam.toLower().contains(#text term)
              or p.namaTarget.toLower().contains(#text term)
              or p.kelas.toLower().contains(#text term);
          };
        };
        jenisOk and statusOk and cariOk;
      }
    );
  };

  public func getPeminjaman(peminjaman : Map.Map<Types.Id, Types.Peminjaman>, id : Types.Id) : ?Types.Peminjaman {
    peminjaman.get(id);
  };

  /// Mengurangi stok pada inventaris Trainer; `false` bila unit tidak ada atau
  /// jumlah tersedia tidak mencukupi.
  func kurangiTrainer(
    trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>,
    targetId : TrainerTypes.Id,
    jumlah : Nat,
  ) : Bool {
    switch (trainer.get(targetId)) {
      case null { false };
      case (?unit) {
        if (jumlah > unit.jumlahTersedia) { return false };
        let updated : TrainerTypes.Trainer = {
          id = unit.id;
          nama = unit.nama;
          kategori = unit.kategori;
          jumlahTotal = unit.jumlahTotal;
          jumlahTersedia = unit.jumlahTersedia - jumlah;
          keterangan = unit.keterangan;
        };
        trainer.add(targetId, updated);
        true;
      };
    };
  };

  /// Mengurangi stok pada inventaris Alat; `false` bila alat tidak ada atau
  /// jumlah tersedia tidak mencukupi.
  func kurangiAlat(
    alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
    targetId : AlatTypes.Id,
    jumlah : Nat,
  ) : Bool {
    switch (alat.get(targetId)) {
      case null { false };
      case (?item) {
        if (jumlah > item.jumlahTersedia) { return false };
        let updated : AlatTypes.Alat = {
          id = item.id;
          nama = item.nama;
          kategori = item.kategori;
          jumlahTotal = item.jumlahTotal;
          jumlahTersedia = item.jumlahTersedia - jumlah;
          keterangan = item.keterangan;
        };
        alat.add(targetId, updated);
        true;
      };
    };
  };

  /// Mengembalikan stok pada inventaris Trainer.
  func tambahTrainer(
    trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>,
    targetId : TrainerTypes.Id,
    jumlah : Nat,
  ) {
    switch (trainer.get(targetId)) {
      case null {};
      case (?unit) {
        let updated : TrainerTypes.Trainer = {
          id = unit.id;
          nama = unit.nama;
          kategori = unit.kategori;
          jumlahTotal = unit.jumlahTotal;
          jumlahTersedia = unit.jumlahTersedia + jumlah;
          keterangan = unit.keterangan;
        };
        trainer.add(targetId, updated);
      };
    };
  };

  /// Mengembalikan stok pada inventaris Alat.
  func tambahAlat(
    alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
    targetId : AlatTypes.Id,
    jumlah : Nat,
  ) {
    switch (alat.get(targetId)) {
      case null {};
      case (?item) {
        let updated : AlatTypes.Alat = {
          id = item.id;
          nama = item.nama;
          kategori = item.kategori;
          jumlahTotal = item.jumlahTotal;
          jumlahTersedia = item.jumlahTersedia + jumlah;
          keterangan = item.keterangan;
        };
        alat.add(targetId, updated);
      };
    };
  };

  /// Admin: mencatat peminjaman Trainer langsung; sumber `"admin"`, status
  /// `"dipinjam"`, dan mengurangi jumlah tersedia unit Trainer.
  public func catatPeminjamanTrainer(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>,
    state : { var nextPeminjamanId : Nat },
    targetId : TrainerTypes.Id,
    namaPeminjam : Text,
    kelas : Text,
    jumlah : Nat,
    tanggalPinjam : Text,
    keperluan : Text,
  ) : ?Types.Peminjaman {
    let unit = switch (trainer.get(targetId)) {
      case null { return null };
      case (?u) { u };
    };
    if (not kurangiTrainer(trainer, targetId, jumlah)) { return null };
    let id = state.nextPeminjamanId;
    state.nextPeminjamanId := id + 1;
    let record : Types.Peminjaman = {
      id;
      jenis = "trainer";
      targetId;
      namaTarget = unit.nama;
      namaPeminjam;
      kelas;
      jumlah;
      tanggalPinjam;
      keperluan;
      status = "dipinjam";
      tanggalKembali = null;
      kondisiKembali = null;
      kontak = null;
      sumber = "admin";
    };
    peminjaman.add(id, record);
    ?record;
  };

  /// Admin: mencatat peminjaman Alat langsung; sumber `"admin"`, status
  /// `"dipinjam"`, dan mengurangi jumlah tersedia alat.
  public func catatPeminjamanAlat(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
    state : { var nextPeminjamanId : Nat },
    targetId : AlatTypes.Id,
    namaPeminjam : Text,
    kelas : Text,
    jumlah : Nat,
    tanggalPinjam : Text,
    keperluan : Text,
  ) : ?Types.Peminjaman {
    let item = switch (alat.get(targetId)) {
      case null { return null };
      case (?a) { a };
    };
    if (not kurangiAlat(alat, targetId, jumlah)) { return null };
    let id = state.nextPeminjamanId;
    state.nextPeminjamanId := id + 1;
    let record : Types.Peminjaman = {
      id;
      jenis = "alat";
      targetId;
      namaTarget = item.nama;
      namaPeminjam;
      kelas;
      jumlah;
      tanggalPinjam;
      keperluan;
      status = "dipinjam";
      tanggalKembali = null;
      kondisiKembali = null;
      kontak = null;
      sumber = "admin";
    };
    peminjaman.add(id, record);
    ?record;
  };

  /// Pengunjung: mengajukan permintaan peminjaman Alat; status `"menunggu"`,
  /// sumber `"pengunjung"`, dan TIDAK mengubah stok alat. Hanya untuk Alat.
  public func ajukanPeminjamanAlat(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
    state : { var nextPeminjamanId : Nat },
    targetId : AlatTypes.Id,
    namaPeminjam : Text,
    kelas : Text,
    jumlah : Nat,
    tanggalPinjam : Text,
    keperluan : Text,
    kontak : Text,
  ) : ?Types.Peminjaman {
    let item = switch (alat.get(targetId)) {
      case null { return null };
      case (?a) { a };
    };
    if (jumlah > item.jumlahTersedia) { return null };
    let id = state.nextPeminjamanId;
    state.nextPeminjamanId := id + 1;
    let record : Types.Peminjaman = {
      id;
      jenis = "alat";
      targetId;
      namaTarget = item.nama;
      namaPeminjam;
      kelas;
      jumlah;
      tanggalPinjam;
      keperluan;
      status = "menunggu";
      tanggalKembali = null;
      kondisiKembali = null;
      kontak = ?kontak;
      sumber = "pengunjung";
    };
    peminjaman.add(id, record);
    ?record;
  };

  /// Admin: menyetujui permintaan pengunjung; `"menunggu"` -> `"dipinjam"`
  /// dan mengurangi stok pada inventaris yang sesuai (`jenis`).
  public func setujuiPeminjaman(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>,
    alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
    id : Types.Id,
  ) : ?Types.Peminjaman {
    let record = switch (peminjaman.get(id)) {
      case null { return null };
      case (?p) { p };
    };
    if (record.status != "menunggu") { return null };
    let ok = if (record.jenis == "trainer") {
      kurangiTrainer(trainer, record.targetId, record.jumlah);
    } else if (record.jenis == "alat") {
      kurangiAlat(alat, record.targetId, record.jumlah);
    } else {
      false;
    };
    if (not ok) { return null };
    let updated : Types.Peminjaman = {
      id = record.id;
      jenis = record.jenis;
      targetId = record.targetId;
      namaTarget = record.namaTarget;
      namaPeminjam = record.namaPeminjam;
      kelas = record.kelas;
      jumlah = record.jumlah;
      tanggalPinjam = record.tanggalPinjam;
      keperluan = record.keperluan;
      status = "dipinjam";
      tanggalKembali = record.tanggalKembali;
      kondisiKembali = record.kondisiKembali;
      kontak = record.kontak;
      sumber = record.sumber;
    };
    peminjaman.add(id, updated);
    ?updated;
  };

  /// Admin: menolak permintaan pengunjung; `"menunggu"` -> `"ditolak"`
  /// tanpa mengubah stok.
  public func tolakPeminjaman(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    id : Types.Id,
  ) : ?Types.Peminjaman {
    let record = switch (peminjaman.get(id)) {
      case null { return null };
      case (?p) { p };
    };
    if (record.status != "menunggu") { return null };
    let updated : Types.Peminjaman = {
      id = record.id;
      jenis = record.jenis;
      targetId = record.targetId;
      namaTarget = record.namaTarget;
      namaPeminjam = record.namaPeminjam;
      kelas = record.kelas;
      jumlah = record.jumlah;
      tanggalPinjam = record.tanggalPinjam;
      keperluan = record.keperluan;
      status = "ditolak";
      tanggalKembali = record.tanggalKembali;
      kondisiKembali = record.kondisiKembali;
      kontak = record.kontak;
      sumber = record.sumber;
    };
    peminjaman.add(id, updated);
    ?updated;
  };

  /// Admin: mencatat pengembalian; mengembalikan stok pada inventaris yang
  /// sesuai (`jenis`).
  public func catatPengembalian(
    peminjaman : Map.Map<Types.Id, Types.Peminjaman>,
    trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>,
    alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>,
    id : Types.Id,
    tanggalKembali : Text,
    kondisiKembali : Text,
  ) : ?Types.Peminjaman {
    let record = switch (peminjaman.get(id)) {
      case null { return null };
      case (?p) { p };
    };
    if (record.status != "dipinjam") { return null };
    if (record.jenis == "trainer") {
      tambahTrainer(trainer, record.targetId, record.jumlah);
    } else if (record.jenis == "alat") {
      tambahAlat(alat, record.targetId, record.jumlah);
    };
    let updated : Types.Peminjaman = {
      id = record.id;
      jenis = record.jenis;
      targetId = record.targetId;
      namaTarget = record.namaTarget;
      namaPeminjam = record.namaPeminjam;
      kelas = record.kelas;
      jumlah = record.jumlah;
      tanggalPinjam = record.tanggalPinjam;
      keperluan = record.keperluan;
      status = "dikembalikan";
      tanggalKembali = ?tanggalKembali;
      kondisiKembali = ?kondisiKembali;
      kontak = record.kontak;
      sumber = record.sumber;
    };
    peminjaman.add(id, updated);
    ?updated;
  };
};
