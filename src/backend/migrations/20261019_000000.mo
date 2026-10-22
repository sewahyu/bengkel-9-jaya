import Map "mo:core/Map";

module {
  // Adds self-service tool loans (sumber/kontak on Peminjaman), lab loans
  // (peminjamanLab), Instagram news (berita + pengaturan.feedUrl), and the
  // matching id counters. OldActor is the NewActor of the previous migration
  // (20261012_000000.mo); every existing field carries through unchanged.
  type OldActor = {
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
      kontak : ?Text;
      sumber : Text;
    }>;
    peminjamanLab : Map.Map<Nat, {
      id : Nat;
      lab : Text;
      namaPeminjam : Text;
      kelas : Text;
      kontak : ?Text;
      tanggal : Text;
      jamMulai : Text;
      jamSelesai : Text;
      keperluan : Text;
      status : Text;
      waktuDibuat : Int;
    }>;
    berita : Map.Map<Nat, {
      id : Nat;
      judul : Text;
      ringkasan : Text;
      gambarUrl : Text;
      tautan : Text;
      tanggal : Text;
      sumber : Text;
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
      var nextPeminjamanLabId : Nat;
      var nextBeritaId : Nat;
      var nextJadwalId : Nat;
      var nextNotaId : Nat;
    };
    pengaturan : { var feedUrl : Text };
  };

  public func migration(old : OldActor) : NewActor {
    {
      sessions = old.sessions;
      alat = old.alat;
      sparepart = old.sparepart;
      mutasiStok = old.mutasiStok;
      peminjaman = old.peminjaman.map(func(_, p) { { p with kontak = null; sumber = "admin" } });
      peminjamanLab = Map.empty();
      berita = Map.empty();
      jadwal = old.jadwal;
      nota = old.nota;
      state = {
        var nextAlatId = old.state.nextAlatId;
        var nextSparepartId = old.state.nextSparepartId;
        var nextMutasiId = old.state.nextMutasiId;
        var nextPeminjamanId = old.state.nextPeminjamanId;
        var nextPeminjamanLabId = 0;
        var nextBeritaId = 0;
        var nextJadwalId = old.state.nextJadwalId;
        var nextNotaId = old.state.nextNotaId;
      };
      pengaturan = { var feedUrl = "" };
    };
  };
};
