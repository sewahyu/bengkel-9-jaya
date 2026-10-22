import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // Deployed baseline is an empty actor ({}), so this single pending migration
  // initializes the full stable state. jenis/status are plain Text
  // ("masuk"/"keluar", "dipinjam"/"dikembalikan"), matching the frontend
  // string enums and the Candid encoding the generated bindings use.
  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    alat : Map.Map<Nat, {
      id : Nat;
      nama : Text;
      kategori : Text;
      jumlahTotal : Nat;
      jumlahTersedia : Nat;
      keterangan : Text;
    }>;
    sparepart : Map.Map<Nat, {
      id : Nat;
      nama : Text;
      kode : Text;
      kategori : Text;
      jumlahStok : Nat;
      satuan : Text;
      ambangMinimum : Nat;
    }>;
    mutasiStok : Map.Map<Nat, {
      id : Nat;
      sparepartId : Nat;
      jenis : Text;
      jumlah : Nat;
      keterangan : Text;
      waktu : Int;
    }>;
    peminjaman : Map.Map<Nat, {
      id : Nat;
      alatId : Nat;
      namaAlat : Text;
      namaPeminjam : Text;
      kelas : Text;
      jumlah : Nat;
      tanggalPinjam : Text;
      keperluan : Text;
      status : Text;
      tanggalKembali : ?Text;
      kondisiKembali : ?Text;
    }>;
    jadwal : Map.Map<Nat, {
      id : Nat;
      hari : Text;
      tanggal : Text;
      namaSiswa : Text;
      kelas : Text;
      tugas : Text;
    }>;
    nota : Map.Map<Nat, {
      id : Nat;
      tanggal : Text;
      keterangan : Text;
      jenis : Text;
      kategori : Text;
      nominal : Nat;
    }>;
    state : {
      var nextAlatId : Nat;
      var nextSparepartId : Nat;
      var nextMutasiId : Nat;
      var nextPeminjamanId : Nat;
      var nextJadwalId : Nat;
      var nextNotaId : Nat;
    };
  };

  public func migration(_old : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      alat = Map.empty();
      sparepart = Map.empty();
      mutasiStok = Map.empty();
      peminjaman = Map.empty();
      jadwal = Map.empty();
      nota = Map.empty();
      state = {
        var nextAlatId = 0;
        var nextSparepartId = 0;
        var nextMutasiId = 0;
        var nextPeminjamanId = 0;
        var nextJadwalId = 0;
        var nextNotaId = 0;
      };
    };
  };
};
