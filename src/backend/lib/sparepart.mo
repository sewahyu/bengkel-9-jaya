import Map "mo:core/Map";
import Types "../types/sparepart";

module {
  public func listSparepart(sparepart : Map.Map<Types.Id, Types.Sparepart>) : [Types.Sparepart] {
    sparepart.values().toArray();
  };

  public func getSparepart(sparepart : Map.Map<Types.Id, Types.Sparepart>, id : Types.Id) : ?Types.Sparepart {
    sparepart.get(id);
  };

  public func addSparepart(
    sparepart : Map.Map<Types.Id, Types.Sparepart>,
    state : { var nextSparepartId : Nat },
    nama : Text,
    kode : Text,
    kategori : Text,
    jumlahStok : Nat,
    satuan : Text,
    ambangMinimum : Nat,
  ) : Types.Sparepart {
    let id = state.nextSparepartId;
    state.nextSparepartId := id + 1;
    let item : Types.Sparepart = {
      id;
      nama;
      kode;
      kategori;
      jumlahStok;
      satuan;
      ambangMinimum;
    };
    sparepart.add(id, item);
    item;
  };

  public func updateSparepart(
    sparepart : Map.Map<Types.Id, Types.Sparepart>,
    id : Types.Id,
    nama : Text,
    kode : Text,
    kategori : Text,
    satuan : Text,
    ambangMinimum : Nat,
  ) : ?Types.Sparepart {
    switch (sparepart.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Types.Sparepart = {
          id;
          nama;
          kode;
          kategori;
          jumlahStok = existing.jumlahStok;
          satuan;
          ambangMinimum;
        };
        sparepart.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteSparepart(sparepart : Map.Map<Types.Id, Types.Sparepart>, id : Types.Id) : Bool {
    switch (sparepart.get(id)) {
      case null { false };
      case (?_) {
        sparepart.remove(id);
        true;
      };
    };
  };

  public func catatMutasiStok(
    sparepart : Map.Map<Types.Id, Types.Sparepart>,
    mutasi : Map.Map<Types.Id, Types.MutasiStok>,
    state : { var nextMutasiId : Nat },
    sparepartId : Types.Id,
    jenis : Types.JenisMutasiStok,
    jumlah : Nat,
    keterangan : Text,
    waktu : Int,
  ) : ?Types.MutasiStok {
    switch (sparepart.get(sparepartId)) {
      case null { null };
      case (?item) {
        let stokBaru = if (jenis == "masuk") {
          item.jumlahStok + jumlah;
        } else if (jenis == "keluar") {
          if (jumlah > item.jumlahStok) { return null };
          item.jumlahStok - jumlah;
        } else {
          return null;
        };
        let updated : Types.Sparepart = {
          id = item.id;
          nama = item.nama;
          kode = item.kode;
          kategori = item.kategori;
          jumlahStok = stokBaru;
          satuan = item.satuan;
          ambangMinimum = item.ambangMinimum;
        };
        sparepart.add(sparepartId, updated);
        let mutasiId = state.nextMutasiId;
        state.nextMutasiId := mutasiId + 1;
        let record : Types.MutasiStok = {
          id = mutasiId;
          sparepartId;
          jenis;
          jumlah;
          keterangan;
          waktu;
        };
        mutasi.add(mutasiId, record);
        ?record;
      };
    };
  };

  public func listMutasiStok(
    mutasi : Map.Map<Types.Id, Types.MutasiStok>,
    sparepartId : ?Types.Id,
  ) : [Types.MutasiStok] {
    let all = mutasi.values().toArray();
    switch (sparepartId) {
      case null { all };
      case (?pid) { all.filter(func(m) = m.sparepartId == pid) };
    };
  };

  public func listStokMenipis(sparepart : Map.Map<Types.Id, Types.Sparepart>) : [Types.Sparepart] {
    sparepart.values().toArray().filter(func(item) = item.jumlahStok <= item.ambangMinimum);
  };
};
