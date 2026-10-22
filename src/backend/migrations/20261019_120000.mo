import Map "mo:core/Map";

module {
  // Splits the single inventory into two: the existing `alat` map becomes the
  // Trainer inventory (renamed field `trainer`, data preserved), and a NEW
  // separate `alat` inventory is introduced with its own id counter. Peminjaman
  // records gain `jenis`/`targetId`/`namaTarget` (replacing `alatId`/`namaAlat`)
  // so a loan routes its stock change to the correct inventory; existing loans
  // are all Trainer loans. OldActor is the NewActor of the previous migration
  // (20261019_000000.mo); every existing field carries through unchanged.
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

  type NewActor = {
    sessions : Map.Map<Principal, { username : Text; loginAt : Int }>;
    trainer : Map.Map<Nat, {
      id : Nat;
      nama : Text;
      kategori : Text;
      jumlahTotal : Nat;
      jumlahTersedia : Nat;
      keterangan : Text;
    }>;
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
      jenis : Text;
      targetId : Nat;
      namaTarget : Text;
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
      var nextTrainerId : Nat;
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
      trainer = old.alat;
      alat = Map.empty();
      sparepart = old.sparepart;
      mutasiStok = old.mutasiStok;
      peminjaman = old.peminjaman.map(
        func(_, p) {
          {
            id = p.id;
            jenis = "trainer";
            targetId = p.alatId;
            namaTarget = p.namaAlat;
            namaPeminjam = p.namaPeminjam;
            kelas = p.kelas;
            jumlah = p.jumlah;
            tanggalPinjam = p.tanggalPinjam;
            keperluan = p.keperluan;
            status = p.status;
            tanggalKembali = p.tanggalKembali;
            kondisiKembali = p.kondisiKembali;
            kontak = p.kontak;
            sumber = p.sumber;
          };
        }
      );
      peminjamanLab = old.peminjamanLab;
      berita = old.berita;
      jadwal = old.jadwal;
      nota = old.nota;
      state = {
        var nextTrainerId = old.state.nextAlatId;
        var nextAlatId = 0;
        var nextSparepartId = old.state.nextSparepartId;
        var nextMutasiId = old.state.nextMutasiId;
        var nextPeminjamanId = old.state.nextPeminjamanId;
        var nextPeminjamanLabId = old.state.nextPeminjamanLabId;
        var nextBeritaId = old.state.nextBeritaId;
        var nextJadwalId = old.state.nextJadwalId;
        var nextNotaId = old.state.nextNotaId;
      };
      pengaturan = old.pengaturan;
    };
  };
};
