import Map "mo:core/Map";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";

import Access "lib/access";
import TrainerTypes "types/trainer";
import AlatTypes "types/alat";
import SparepartTypes "types/sparepart";
import PeminjamanTypes "types/peminjaman";
import PeminjamanLabTypes "types/peminjaman-lab";
import BeritaTypes "types/berita";
import JadwalTypes "types/jadwal";
import KeuanganTypes "types/keuangan";
import AuthApi "mixins/auth-api";
import TrainerApi "mixins/trainer-api";
import AlatApi "mixins/alat-api";
import SparepartApi "mixins/sparepart-api";
import PeminjamanApi "mixins/peminjaman-api";
import PeminjamanLabApi "mixins/peminjaman-lab-api";
import BeritaApi "mixins/berita-api";
import JadwalApi "mixins/jadwal-api";
import KeuanganApi "mixins/keuangan-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let sessions : Access.SessionState;

  let trainer : Map.Map<TrainerTypes.Id, TrainerTypes.Trainer>;
  let alat : Map.Map<AlatTypes.Id, AlatTypes.Alat>;
  let sparepart : Map.Map<SparepartTypes.Id, SparepartTypes.Sparepart>;
  let mutasiStok : Map.Map<SparepartTypes.Id, SparepartTypes.MutasiStok>;
  let peminjaman : Map.Map<PeminjamanTypes.Id, PeminjamanTypes.Peminjaman>;
  let peminjamanLab : Map.Map<PeminjamanLabTypes.Id, PeminjamanLabTypes.PeminjamanLab>;
  let berita : Map.Map<BeritaTypes.Id, BeritaTypes.Berita>;
  let jadwal : Map.Map<JadwalTypes.Id, JadwalTypes.JadwalUpj>;
  let nota : Map.Map<KeuanganTypes.Id, KeuanganTypes.Nota>;

  let state : {
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

  let pengaturan : { var feedUrl : Text };

  func optText(t : ?Text) : Text =
    switch t { case null ""; case (?v) v };

  include AuthApi(sessions);
  include TrainerApi(sessions, trainer, state);
  include AlatApi(sessions, alat, state);
  include SparepartApi(sessions, sparepart, mutasiStok, state);
  include PeminjamanApi(sessions, peminjaman, trainer, alat, state);
  include PeminjamanLabApi(sessions, peminjamanLab, state);
  include BeritaApi(sessions, berita, pengaturan, state);
  include JadwalApi(sessions, jadwal, state);
  include KeuanganApi(sessions, nota, state);
  include ApiDocMixin();

  include Expose({
    entities = [
      trainer.toEntity("trainer", "Trainer", "id")
        .sample({ id = 0; nama = ""; kategori = ""; jumlahTotal = 0; jumlahTersedia = 0; keterangan = "" })
        .public_()
        .build(),
      alat.toEntity("alat", "Alat", "id")
        .sample({ id = 0; nama = ""; kategori = ""; jumlahTotal = 0; jumlahTersedia = 0; keterangan = "" })
        .public_()
        .build(),
      sparepart.toEntity("sparepart", "Sparepart", "id")
        .sample({ id = 0; nama = ""; kode = ""; kategori = ""; jumlahStok = 0; satuan = ""; ambangMinimum = 0 })
        .public_()
        .build(),
      mutasiStok.toEntityManual("mutasiStok", "MutasiStok", "id")
        .sample({ id = 0; sparepartId = 0; jenis = "masuk"; jumlah = 0; keterangan = ""; waktu = 0 })
        .payload("id", func m = m.id)
        .payload("sparepartId", func m = m.sparepartId)
        .payload("jenis", func m = m.jenis)
        .payload("jumlah", func m = m.jumlah)
        .payload("keterangan", func m = m.keterangan)
        .payload("waktu", func m = m.waktu)
        .controllerOnly()
        .build(),
      peminjaman.toEntityManual("peminjaman", "Peminjaman", "id")
        .sample({
          id = 0;
          jenis = "alat";
          targetId = 0;
          namaTarget = "";
          namaPeminjam = "";
          kelas = "";
          jumlah = 0;
          tanggalPinjam = "";
          keperluan = "";
          status = "dipinjam";
          tanggalKembali = null;
          kondisiKembali = null;
          kontak = null;
          sumber = "admin";
        })
        .payload("id", func p = p.id)
        .payload("jenis", func p = p.jenis)
        .payload("targetId", func p = p.targetId)
        .payload("namaTarget", func p = p.namaTarget)
        .payload("namaPeminjam", func p = p.namaPeminjam)
        .payload("kelas", func p = p.kelas)
        .payload("jumlah", func p = p.jumlah)
        .payload("tanggalPinjam", func p = p.tanggalPinjam)
        .payload("keperluan", func p = p.keperluan)
        .payload("status", func p = p.status)
        .payload("tanggalKembali", func p = optText(p.tanggalKembali))
        .payload("kondisiKembali", func p = optText(p.kondisiKembali))
        .payload("kontak", func p = optText(p.kontak))
        .payload("sumber", func p = p.sumber)
        .controllerOnly()
        .build(),
      peminjamanLab.toEntityManual("peminjamanLab", "PeminjamanLab", "id")
        .sample({
          id = 0;
          lab = "Lab 1 Chasis";
          namaPeminjam = "";
          kelas = "";
          kontak = null;
          tanggal = "";
          jamMulai = "";
          jamSelesai = "";
          keperluan = "";
          status = "menunggu";
          waktuDibuat = 0;
        })
        .payload("id", func p = p.id)
        .payload("lab", func p = p.lab)
        .payload("namaPeminjam", func p = p.namaPeminjam)
        .payload("kelas", func p = p.kelas)
        .payload("kontak", func p = optText(p.kontak))
        .payload("tanggal", func p = p.tanggal)
        .payload("jamMulai", func p = p.jamMulai)
        .payload("jamSelesai", func p = p.jamSelesai)
        .payload("keperluan", func p = p.keperluan)
        .payload("status", func p = p.status)
        .payload("waktuDibuat", func p = p.waktuDibuat)
        .public_()
        .build(),
      berita.toEntityManual("berita", "Berita", "id")
        .sample({
          id = 0;
          judul = "";
          ringkasan = "";
          gambarUrl = "";
          tautan = "";
          tanggal = "";
          sumber = "manual";
        })
        .payload("id", func b = b.id)
        .payload("judul", func b = b.judul)
        .payload("ringkasan", func b = b.ringkasan)
        .payload("gambarUrl", func b = b.gambarUrl)
        .payload("tautan", func b = b.tautan)
        .payload("tanggal", func b = b.tanggal)
        .payload("sumber", func b = b.sumber)
        .public_()
        .build(),
      jadwal.toEntity("jadwalUpj", "JadwalUpj", "id")
        .sample({ id = 0; hari = ""; tanggal = ""; namaSiswa = ""; kelas = ""; tugas = "" })
        .public_()
        .build(),
      nota.toEntityManual("nota", "Nota", "id")
        .sample({ id = 0; tanggal = ""; keterangan = ""; jenis = "masuk"; kategori = ""; nominal = 0 })
        .payload("id", func n = n.id)
        .payload("tanggal", func n = n.tanggal)
        .payload("keterangan", func n = n.keterangan)
        .payload("jenis", func n = n.jenis)
        .payload("kategori", func n = n.kategori)
        .payload("nominal", func n = n.nominal)
        .controllerOnly()
        .build(),
    ];
  });
};
