import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // Replaces Internet Identity with a single built-in username/password account.
  // The previous stable shape carried `accessControlState`; the new shape drops
  // it and adds `sessions`. Domain maps and counters carry through unchanged.
  type OldActor = {
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

  type NewActor = {
    sessions : Map.Map<Principal, { username : Text; loginAt : Int }>;
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

  public func migration(old : OldActor) : NewActor {
    {
      sessions = Map.empty();
      alat = old.alat;
      sparepart = old.sparepart;
      mutasiStok = old.mutasiStok;
      peminjaman = old.peminjaman;
      jadwal = old.jadwal;
      nota = old.nota;
      state = old.state;
    };
  };
};
