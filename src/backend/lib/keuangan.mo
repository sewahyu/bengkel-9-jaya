import Map "mo:core/Map";
import Types "../types/keuangan";

module {
  public func listNota(
    nota : Map.Map<Types.Id, Types.Nota>,
    jenis : ?Types.JenisNota,
    dariTanggal : ?Text,
    sampaiTanggal : ?Text,
  ) : [Types.Nota] {
    let all = nota.values().toArray();
    let byJenis = switch (jenis) {
      case null { all };
      case (?j) { all.filter(func(n) = n.jenis == j) };
    };
    let byDari = switch (dariTanggal) {
      case null { byJenis };
      case (?d) { byJenis.filter(func(n) = n.tanggal >= d) };
    };
    switch (sampaiTanggal) {
      case null { byDari };
      case (?s) { byDari.filter(func(n) = n.tanggal <= s) };
    };
  };

  public func getNota(nota : Map.Map<Types.Id, Types.Nota>, id : Types.Id) : ?Types.Nota {
    nota.get(id);
  };

  public func addNota(
    nota : Map.Map<Types.Id, Types.Nota>,
    state : { var nextNotaId : Nat },
    tanggal : Text,
    keterangan : Text,
    jenis : Types.JenisNota,
    kategori : Text,
    nominal : Nat,
  ) : Types.Nota {
    let id = state.nextNotaId;
    state.nextNotaId := id + 1;
    let item : Types.Nota = { id; tanggal; keterangan; jenis; kategori; nominal };
    nota.add(id, item);
    item;
  };

  public func updateNota(
    nota : Map.Map<Types.Id, Types.Nota>,
    id : Types.Id,
    tanggal : Text,
    keterangan : Text,
    jenis : Types.JenisNota,
    kategori : Text,
    nominal : Nat,
  ) : ?Types.Nota {
    switch (nota.get(id)) {
      case null { null };
      case (?_) {
        let updated : Types.Nota = { id; tanggal; keterangan; jenis; kategori; nominal };
        nota.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteNota(nota : Map.Map<Types.Id, Types.Nota>, id : Types.Id) : Bool {
    switch (nota.get(id)) {
      case null { false };
      case (?_) {
        nota.remove(id);
        true;
      };
    };
  };

  public func ringkasanKeuangan(nota : Map.Map<Types.Id, Types.Nota>) : Types.RingkasanKeuangan {
    var totalMasuk = 0;
    var totalKeluar = 0;
    for (item in nota.values()) {
      if (item.jenis == "masuk") {
        totalMasuk += item.nominal;
      } else if (item.jenis == "keluar") {
        totalKeluar += item.nominal;
      };
    };
    {
      totalMasuk;
      totalKeluar;
      saldo = totalMasuk.toInt() - totalKeluar.toInt();
    };
  };
};
