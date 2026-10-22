import { createActor } from "@/backend";
import type {
  Alat,
  Berita,
  JadwalUpj,
  JenisMutasiStok,
  JenisNota,
  JenisPeminjaman,
  Lab,
  MutasiStok,
  Nota,
  Peminjaman,
  PeminjamanLab,
  RingkasanKategori,
  RingkasanKeuangan,
  Sparepart,
  StatusPeminjaman,
  StatusPeminjamanLab,
  Trainer,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryKeys = {
  trainer: ["trainer"] as const,
  trainerDetail: (id: bigint) => ["trainer", id.toString()] as const,
  ringkasanTrainer: ["trainer", "ringkasan"] as const,
  alat: ["alat"] as const,
  alatDetail: (id: bigint) => ["alat", id.toString()] as const,
  ringkasanAlat: ["alat", "ringkasan"] as const,
  sparepart: ["sparepart"] as const,
  sparepartDetail: (id: bigint) => ["sparepart", id.toString()] as const,
  stokMenipis: ["sparepart", "menipis"] as const,
  mutasiStok: (sparepartId: bigint | null) =>
    ["mutasi-stok", sparepartId?.toString() ?? "semua"] as const,
  peminjaman: ["peminjaman"] as const,
  peminjamanDetail: (id: bigint) => ["peminjaman", id.toString()] as const,
  jadwal: ["jadwal"] as const,
  jadwalDetail: (id: bigint) => ["jadwal", id.toString()] as const,
  nota: ["nota"] as const,
  notaDetail: (id: bigint) => ["nota", id.toString()] as const,
  ringkasanKeuangan: ["nota", "ringkasan"] as const,
  peminjamanLab: ["peminjaman-lab"] as const,
  peminjamanLabDetail: (id: bigint) =>
    ["peminjaman-lab", id.toString()] as const,
  berita: ["berita"] as const,
  beritaDetail: (id: bigint) => ["berita", id.toString()] as const,
  feedUrl: ["berita", "feed-url"] as const,
};

/* ------------------------------------------------------------------ */
/* Trainer                                                             */
/* ------------------------------------------------------------------ */

export function useListTrainer() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Trainer[]>({
    queryKey: queryKeys.trainer,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTrainer();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTrainer(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Trainer | null>({
    queryKey: queryKeys.trainerDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTrainer(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRingkasanTrainerPerKategori() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RingkasanKategori[]>({
    queryKey: queryKeys.ringkasanTrainer,
    queryFn: async () => {
      if (!actor) return [];
      return actor.ringkasanTrainerPerKategori();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTrainer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nama: string;
      kategori: string;
      jumlahTotal: bigint;
      keterangan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addTrainer(
        input.nama,
        input.kategori,
        input.jumlahTotal,
        input.keterangan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
    },
  });
}

export function useUpdateTrainer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      nama: string;
      kategori: string;
      jumlahTotal: bigint;
      keterangan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateTrainer(
        input.id,
        input.nama,
        input.kategori,
        input.jumlahTotal,
        input.keterangan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
    },
  });
}

export function useDeleteTrainer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteTrainer(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Alat                                                                */
/* ------------------------------------------------------------------ */

export function useListAlat() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Alat[]>({
    queryKey: queryKeys.alat,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAlat();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAlat(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Alat | null>({
    queryKey: queryKeys.alatDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getAlat(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRingkasanAlatPerKategori() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RingkasanKategori[]>({
    queryKey: queryKeys.ringkasanAlat,
    queryFn: async () => {
      if (!actor) return [];
      return actor.ringkasanAlatPerKategori();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAlat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nama: string;
      kategori: string;
      jumlahTotal: bigint;
      keterangan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addAlat(
        input.nama,
        input.kategori,
        input.jumlahTotal,
        input.keterangan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

export function useUpdateAlat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      nama: string;
      kategori: string;
      jumlahTotal: bigint;
      keterangan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateAlat(
        input.id,
        input.nama,
        input.kategori,
        input.jumlahTotal,
        input.keterangan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

export function useDeleteAlat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteAlat(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Sparepart                                                           */
/* ------------------------------------------------------------------ */

export function useListSparepart() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Sparepart[]>({
    queryKey: queryKeys.sparepart,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSparepart();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSparepart(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Sparepart | null>({
    queryKey: queryKeys.sparepartDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getSparepart(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useListStokMenipis() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Sparepart[]>({
    queryKey: queryKeys.stokMenipis,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStokMenipis();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListMutasiStok(sparepartId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<MutasiStok[]>({
    queryKey: queryKeys.mutasiStok(sparepartId),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMutasiStok(sparepartId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSparepart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      nama: string;
      kode: string;
      kategori: string;
      jumlahStok: bigint;
      satuan: string;
      ambangMinimum: bigint;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addSparepart(
        input.nama,
        input.kode,
        input.kategori,
        input.jumlahStok,
        input.satuan,
        input.ambangMinimum,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sparepart });
    },
  });
}

export function useUpdateSparepart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      nama: string;
      kode: string;
      kategori: string;
      satuan: string;
      ambangMinimum: bigint;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateSparepart(
        input.id,
        input.nama,
        input.kode,
        input.kategori,
        input.satuan,
        input.ambangMinimum,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sparepart });
    },
  });
}

export function useDeleteSparepart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteSparepart(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sparepart });
    },
  });
}

export function useCatatMutasiStok() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      sparepartId: bigint;
      jenis: JenisMutasiStok;
      jumlah: bigint;
      keterangan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.catatMutasiStok(
        input.sparepartId,
        input.jenis,
        input.jumlah,
        input.keterangan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sparepart });
      void queryClient.invalidateQueries({ queryKey: ["mutasi-stok"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Peminjaman                                                          */
/* ------------------------------------------------------------------ */

export function useListPeminjaman(
  jenis: JenisPeminjaman | null,
  status: StatusPeminjaman | null,
  cari: string | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Peminjaman[]>({
    queryKey: [
      ...queryKeys.peminjaman,
      jenis ?? "semua",
      status ?? "semua",
      cari ?? "",
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPeminjaman(jenis, status, cari);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPeminjaman(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Peminjaman | null>({
    queryKey: queryKeys.peminjamanDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPeminjaman(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCatatPeminjamanTrainer() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      targetId: bigint;
      namaPeminjam: string;
      kelas: string;
      jumlah: bigint;
      tanggalPinjam: string;
      keperluan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.catatPeminjamanTrainer(
        input.targetId,
        input.namaPeminjam,
        input.kelas,
        input.jumlah,
        input.tanggalPinjam,
        input.keperluan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.peminjaman });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
    },
  });
}

export function useCatatPeminjamanAlat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      targetId: bigint;
      namaPeminjam: string;
      kelas: string;
      jumlah: bigint;
      tanggalPinjam: string;
      keperluan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.catatPeminjamanAlat(
        input.targetId,
        input.namaPeminjam,
        input.kelas,
        input.jumlah,
        input.tanggalPinjam,
        input.keperluan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.peminjaman });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

export function useCatatPengembalian() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      tanggalKembali: string;
      kondisiKembali: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.catatPengembalian(
        input.id,
        input.tanggalKembali,
        input.kondisiKembali,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.peminjaman });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Jadwal UPJ                                                          */
/* ------------------------------------------------------------------ */

export function useListJadwal() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<JadwalUpj[]>({
    queryKey: queryKeys.jadwal,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listJadwal();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetJadwal(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<JadwalUpj | null>({
    queryKey: queryKeys.jadwalDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getJadwal(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAddJadwal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      hari: string;
      tanggal: string;
      namaSiswa: string;
      kelas: string;
      tugas: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addJadwal(
        input.hari,
        input.tanggal,
        input.namaSiswa,
        input.kelas,
        input.tugas,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jadwal });
    },
  });
}

export function useUpdateJadwal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      hari: string;
      tanggal: string;
      namaSiswa: string;
      kelas: string;
      tugas: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateJadwal(
        input.id,
        input.hari,
        input.tanggal,
        input.namaSiswa,
        input.kelas,
        input.tugas,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jadwal });
    },
  });
}

export function useDeleteJadwal() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteJadwal(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.jadwal });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Nota & Keuangan                                                     */
/* ------------------------------------------------------------------ */

export function useListNota(
  jenis: JenisNota | null,
  dariTanggal: string | null,
  sampaiTanggal: string | null,
) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Nota[]>({
    queryKey: [
      ...queryKeys.nota,
      jenis ?? "semua",
      dariTanggal ?? "",
      sampaiTanggal ?? "",
    ],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNota(jenis, dariTanggal, sampaiTanggal);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNota(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Nota | null>({
    queryKey: queryKeys.notaDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getNota(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useRingkasanKeuangan() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<RingkasanKeuangan>({
    queryKey: queryKeys.ringkasanKeuangan,
    queryFn: async () => {
      if (!actor) return { totalMasuk: 0n, totalKeluar: 0n, saldo: 0n };
      return actor.ringkasanKeuangan();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNota() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      tanggal: string;
      keterangan: string;
      jenis: JenisNota;
      kategori: string;
      nominal: bigint;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addNota(
        input.tanggal,
        input.keterangan,
        input.jenis,
        input.kategori,
        input.nominal,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.nota });
    },
  });
}

export function useUpdateNota() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      tanggal: string;
      keterangan: string;
      jenis: JenisNota;
      kategori: string;
      nominal: bigint;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateNota(
        input.id,
        input.tanggal,
        input.keterangan,
        input.jenis,
        input.kategori,
        input.nominal,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.nota });
    },
  });
}

export function useDeleteNota() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteNota(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.nota });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Peminjaman pengunjung (self-service)                                */
/* ------------------------------------------------------------------ */

export function useAjukanPeminjamanAlat() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      targetId: bigint;
      namaPeminjam: string;
      kelas: string;
      jumlah: bigint;
      tanggalPinjam: string;
      keperluan: string;
      kontak: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.ajukanPeminjamanAlat(
        input.targetId,
        input.namaPeminjam,
        input.kelas,
        input.jumlah,
        input.tanggalPinjam,
        input.keperluan,
        input.kontak,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.peminjaman });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

export function useSetujuiPeminjaman() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.setujuiPeminjaman(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.peminjaman });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

export function useTolakPeminjaman() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.tolakPeminjaman(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.peminjaman });
      void queryClient.invalidateQueries({ queryKey: queryKeys.trainer });
      void queryClient.invalidateQueries({ queryKey: queryKeys.alat });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Peminjaman Lab                                                      */
/* ------------------------------------------------------------------ */

export function useListPeminjamanLab(lab: Lab | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PeminjamanLab[]>({
    queryKey: [...queryKeys.peminjamanLab, lab ?? "semua"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listPeminjamanLab(lab);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPeminjamanLab(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<PeminjamanLab | null>({
    queryKey: queryKeys.peminjamanLabDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getPeminjamanLab(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useAjukanPeminjamanLab() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      lab: Lab;
      namaPeminjam: string;
      kelas: string;
      kontak: string;
      tanggal: string;
      jamMulai: string;
      jamSelesai: string;
      keperluan: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.ajukanPeminjamanLab(
        input.lab,
        input.namaPeminjam,
        input.kelas,
        input.kontak,
        input.tanggal,
        input.jamMulai,
        input.jamSelesai,
        input.keperluan,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.peminjamanLab,
      });
    },
  });
}

export function useAddPeminjamanLab() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      lab: Lab;
      namaPeminjam: string;
      kelas: string;
      kontak: string;
      tanggal: string;
      jamMulai: string;
      jamSelesai: string;
      keperluan: string;
      status: StatusPeminjamanLab;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addPeminjamanLab(
        input.lab,
        input.namaPeminjam,
        input.kelas,
        input.kontak,
        input.tanggal,
        input.jamMulai,
        input.jamSelesai,
        input.keperluan,
        input.status,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.peminjamanLab,
      });
    },
  });
}

export function useUpdatePeminjamanLab() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      lab: Lab;
      namaPeminjam: string;
      kelas: string;
      kontak: string;
      tanggal: string;
      jamMulai: string;
      jamSelesai: string;
      keperluan: string;
      status: StatusPeminjamanLab;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updatePeminjamanLab(
        input.id,
        input.lab,
        input.namaPeminjam,
        input.kelas,
        input.kontak,
        input.tanggal,
        input.jamMulai,
        input.jamSelesai,
        input.keperluan,
        input.status,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.peminjamanLab,
      });
    },
  });
}

export function useDeletePeminjamanLab() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deletePeminjamanLab(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.peminjamanLab,
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Berita & feed Instagram                                             */
/* ------------------------------------------------------------------ */

export function useListBerita() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Berita[]>({
    queryKey: queryKeys.berita,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listBerita();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBerita(id: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Berita | null>({
    queryKey: queryKeys.beritaDetail(id ?? 0n),
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getBerita(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetFeedUrl() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<string>({
    queryKey: queryKeys.feedUrl,
    queryFn: async () => {
      if (!actor) return "";
      return actor.getFeedUrl();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetFeedUrl() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.setFeedUrl(url);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.feedUrl });
    },
  });
}

export function useAddBerita() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      judul: string;
      ringkasan: string;
      gambarUrl: string;
      tautan: string;
      tanggal: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.addBerita(
        input.judul,
        input.ringkasan,
        input.gambarUrl,
        input.tautan,
        input.tanggal,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.berita });
    },
  });
}

export function useUpdateBerita() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: bigint;
      judul: string;
      ringkasan: string;
      gambarUrl: string;
      tautan: string;
      tanggal: string;
    }) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.updateBerita(
        input.id,
        input.judul,
        input.ringkasan,
        input.gambarUrl,
        input.tautan,
        input.tanggal,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.berita });
    },
  });
}

export function useDeleteBerita() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.deleteBerita(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.berita });
    },
  });
}
