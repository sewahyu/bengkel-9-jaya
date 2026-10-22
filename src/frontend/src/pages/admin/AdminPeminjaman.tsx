import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useCatatPeminjamanAlat,
  useCatatPeminjamanTrainer,
  useCatatPengembalian,
  useListAlat,
  useListPeminjaman,
  useListTrainer,
  useSetujuiPeminjaman,
  useTolakPeminjaman,
} from "@/hooks/use-backend";
import { STATUS_LABEL, SUMBER_LABEL } from "@/lib/constants";
import { formatAngka, formatTanggal, todayIso } from "@/lib/format";
import { JenisPeminjaman, StatusPeminjaman, SumberPeminjaman } from "@/types";
import type { Peminjaman } from "@/types";
import {
  AlertCircle,
  Check,
  ClipboardList,
  Loader2,
  RotateCcw,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

const SEMUA = "semua";

function StatusBadge({ status }: { status: StatusPeminjaman }) {
  const gaya =
    status === StatusPeminjaman.dipinjam
      ? "bg-warning/15 text-warning"
      : status === StatusPeminjaman.menunggu
        ? "bg-accent/15 text-accent"
        : status === StatusPeminjaman.ditolak
          ? "bg-destructive/15 text-destructive"
          : "bg-success/15 text-success";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gaya}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function SumberBadge({ sumber }: { sumber: SumberPeminjaman }) {
  const pengunjung = sumber === SumberPeminjaman.pengunjung;
  return (
    <span
      className={
        pengunjung
          ? "inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent"
          : "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
      }
    >
      {SUMBER_LABEL[sumber] ?? sumber}
    </span>
  );
}

function JenisBadge({ jenis }: { jenis: JenisPeminjaman }) {
  const trainer = jenis === JenisPeminjaman.trainer;
  return (
    <span
      className={
        trainer
          ? "inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
          : "inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
      }
    >
      {trainer ? "Trainer" : "Alat"}
    </span>
  );
}

interface FormPeminjamanProps {
  judul: string;
  keterangan: string;
  opsi: { id: bigint; nama: string; jumlahTersedia: bigint }[];
  sedangMemuat: boolean;
  sedangSimpan: boolean;
  onSimpan: (input: {
    targetId: bigint;
    namaPeminjam: string;
    kelas: string;
    jumlah: bigint;
    tanggalPinjam: string;
    keperluan: string;
  }) => void;
  ocidPrefix: string;
}

/**
 * Formulir pencatatan peminjaman untuk satu jenis inventaris. Dipakai dua kali
 * (Trainer dan Alat) dengan daftar unit yang berbeda sehingga kedua inventaris
 * tidak pernah tercampur.
 */
function FormPeminjaman({
  judul,
  keterangan,
  opsi,
  sedangMemuat,
  sedangSimpan,
  onSimpan,
  ocidPrefix,
}: FormPeminjamanProps) {
  const [targetId, setTargetId] = useState("");
  const [namaPeminjam, setNamaPeminjam] = useState("");
  const [kelas, setKelas] = useState("");
  const [jumlah, setJumlah] = useState("1");
  const [tanggalPinjam, setTanggalPinjam] = useState(todayIso());
  const [keperluan, setKeperluan] = useState("");
  const [error, setError] = useState<string | null>(null);

  const terpilih = opsi.find((item) => item.id.toString() === targetId);
  const jumlahAngka = Number(jumlah);
  const jumlahValid =
    Number.isInteger(jumlahAngka) &&
    jumlahAngka > 0 &&
    (terpilih ? BigInt(jumlahAngka) <= terpilih.jumlahTersedia : true);

  const bisaSimpan =
    targetId !== "" &&
    namaPeminjam.trim() !== "" &&
    kelas.trim() !== "" &&
    keperluan.trim() !== "" &&
    jumlahValid;

  function reset() {
    setTargetId("");
    setNamaPeminjam("");
    setKelas("");
    setJumlah("1");
    setTanggalPinjam(todayIso());
    setKeperluan("");
    setError(null);
  }

  function simpan() {
    if (!bisaSimpan) return;
    setError(null);
    onSimpan({
      targetId: BigInt(targetId),
      namaPeminjam: namaPeminjam.trim(),
      kelas: kelas.trim(),
      jumlah: BigInt(jumlahAngka),
      tanggalPinjam,
      keperluan: keperluan.trim(),
    });
    reset();
  }

  return (
    <Card
      className="border-border shadow-subtle"
      data-ocid={`${ocidPrefix}.card`}
    >
      <CardContent className="flex flex-col gap-5 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-accent" aria-hidden="true" />
          <h2 className="font-display text-base font-bold tracking-tight">
            {judul}
          </h2>
        </div>
        <p className="-mt-3 text-xs text-muted-foreground">{keterangan}</p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${ocidPrefix}-unit`}>Unit</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger
                id={`${ocidPrefix}-unit`}
                data-ocid={`${ocidPrefix}.unit.select`}
              >
                <SelectValue
                  placeholder={
                    sedangMemuat ? "Memuat unit…" : "Pilih unit inventaris"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {opsi.length === 0 ? (
                  <SelectItem value="__kosong__" disabled>
                    Belum ada unit tersedia
                  </SelectItem>
                ) : (
                  opsi.map((item) => (
                    <SelectItem
                      key={item.id.toString()}
                      value={item.id.toString()}
                      disabled={item.jumlahTersedia <= 0n}
                    >
                      {item.nama} · tersedia {formatAngka(item.jumlahTersedia)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${ocidPrefix}-nama`}>Nama Peminjam</Label>
            <Input
              id={`${ocidPrefix}-nama`}
              value={namaPeminjam}
              onChange={(event) => setNamaPeminjam(event.target.value)}
              placeholder="Contoh: Rizky Pratama"
              data-ocid={`${ocidPrefix}.nama.input`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${ocidPrefix}-kelas`}>Kelas / Unit</Label>
            <Input
              id={`${ocidPrefix}-kelas`}
              value={kelas}
              onChange={(event) => setKelas(event.target.value)}
              placeholder="Contoh: XII TSM 2"
              data-ocid={`${ocidPrefix}.kelas.input`}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${ocidPrefix}-jumlah`}>Jumlah</Label>
            <Input
              id={`${ocidPrefix}-jumlah`}
              type="number"
              min={1}
              value={jumlah}
              onChange={(event) => setJumlah(event.target.value)}
              data-ocid={`${ocidPrefix}.jumlah.input`}
            />
            {terpilih && !jumlahValid ? (
              <p className="text-xs text-destructive">
                Maksimal {formatAngka(terpilih.jumlahTersedia)} unit tersedia.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor={`${ocidPrefix}-tanggal`}>Tanggal Pinjam</Label>
            <Input
              id={`${ocidPrefix}-tanggal`}
              type="date"
              value={tanggalPinjam}
              onChange={(event) => setTanggalPinjam(event.target.value)}
              data-ocid={`${ocidPrefix}.tanggal.input`}
            />
          </div>

          <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-1">
            <Label htmlFor={`${ocidPrefix}-keperluan`}>Keperluan</Label>
            <Textarea
              id={`${ocidPrefix}-keperluan`}
              value={keperluan}
              onChange={(event) => setKeperluan(event.target.value)}
              placeholder="Contoh: Praktik tune up mesin"
              rows={2}
              data-ocid={`${ocidPrefix}.keperluan.textarea`}
            />
          </div>
        </div>

        {error ? (
          <p
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            data-ocid={`${ocidPrefix}.form.error_state`}
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {error}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={simpan}
            disabled={!bisaSimpan || sedangSimpan}
            data-ocid={`${ocidPrefix}.submit_button`}
          >
            {sedangSimpan ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ClipboardList className="size-4" aria-hidden="true" />
            )}
            Catat Peminjaman
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminPeminjaman() {
  const [jenisFilter, setJenisFilter] = useState<string>(SEMUA);
  const [statusFilter, setStatusFilter] = useState<string>(SEMUA);
  const [cari, setCari] = useState("");

  const jenisParam =
    jenisFilter === SEMUA ? null : (jenisFilter as JenisPeminjaman);
  const statusParam =
    statusFilter === SEMUA ? null : (statusFilter as StatusPeminjaman);
  const cariParam = cari.trim() === "" ? null : cari.trim();

  const trainerQuery = useListTrainer();
  const alatQuery = useListAlat();
  const peminjamanQuery = useListPeminjaman(jenisParam, statusParam, cariParam);
  const catatTrainer = useCatatPeminjamanTrainer();
  const catatAlat = useCatatPeminjamanAlat();
  const catatPengembalian = useCatatPengembalian();
  const setujuiPeminjaman = useSetujuiPeminjaman();
  const tolakPeminjaman = useTolakPeminjaman();

  const [kembaliId, setKembaliId] = useState<bigint | null>(null);
  const [tanggalKembali, setTanggalKembali] = useState(todayIso());
  const [kondisiKembali, setKondisiKembali] = useState("");
  const [aksiError, setAksiError] = useState<string | null>(null);

  const daftarTrainer = trainerQuery.data ?? [];
  const daftarAlat = alatQuery.data ?? [];
  const daftarPeminjaman = peminjamanQuery.data ?? [];

  function simpanPengembalian() {
    if (kembaliId === null || kondisiKembali.trim() === "") return;
    setAksiError(null);
    catatPengembalian.mutate(
      {
        id: kembaliId,
        tanggalKembali,
        kondisiKembali: kondisiKembali.trim(),
      },
      {
        onSuccess: () => {
          setKembaliId(null);
          setKondisiKembali("");
          setTanggalKembali(todayIso());
        },
        onError: (error) => setAksiError(error.message),
      },
    );
  }

  return (
    <AdminShell
      title="Peminjaman"
      description="Catat peminjaman Trainer dan Alat secara langsung, tinjau permintaan pengunjung, lalu tandai pengembaliannya. Stok inventaris diperbarui otomatis."
    >
      <div className="flex flex-col gap-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <FormPeminjaman
            judul="Catat Peminjaman Trainer"
            keterangan="Peminjaman Trainer hanya dapat dicatat oleh admin. Pilih unit dari inventaris Trainer."
            opsi={daftarTrainer}
            sedangMemuat={trainerQuery.isLoading}
            sedangSimpan={catatTrainer.isPending}
            onSimpan={(input) =>
              catatTrainer.mutate(input, {
                onError: (error) => setAksiError(error.message),
              })
            }
            ocidPrefix="peminjaman.trainer"
          />
          <FormPeminjaman
            judul="Catat Peminjaman Alat"
            keterangan="Pilih unit dari inventaris Alat. Daftar ini terpisah dari inventaris Trainer."
            opsi={daftarAlat}
            sedangMemuat={alatQuery.isLoading}
            sedangSimpan={catatAlat.isPending}
            onSimpan={(input) =>
              catatAlat.mutate(input, {
                onError: (error) => setAksiError(error.message),
              })
            }
            ocidPrefix="peminjaman.alat"
          />
        </div>

        {aksiError ? (
          <p
            className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            data-ocid="peminjaman.aksi.error_state"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {aksiError}
          </p>
        ) : null}

        <Card
          className="border-border shadow-subtle"
          data-ocid="peminjaman.list.card"
        >
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-accent" aria-hidden="true" />
                <h2 className="font-display text-base font-bold tracking-tight">
                  Daftar Peminjaman
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={cari}
                    onChange={(event) => setCari(event.target.value)}
                    placeholder="Cari nama peminjam"
                    className="w-56 pl-9"
                    aria-label="Cari nama peminjam"
                    data-ocid="peminjaman.search_input"
                  />
                </div>
                <Select value={jenisFilter} onValueChange={setJenisFilter}>
                  <SelectTrigger
                    className="w-40"
                    aria-label="Filter jenis inventaris"
                    data-ocid="peminjaman.jenis.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA}>Semua Jenis</SelectItem>
                    <SelectItem value={JenisPeminjaman.trainer}>
                      Trainer
                    </SelectItem>
                    <SelectItem value={JenisPeminjaman.alat}>Alat</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    className="w-48"
                    aria-label="Filter status"
                    data-ocid="peminjaman.status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA}>Semua Status</SelectItem>
                    <SelectItem value={StatusPeminjaman.menunggu}>
                      Menunggu Persetujuan
                    </SelectItem>
                    <SelectItem value={StatusPeminjaman.dipinjam}>
                      Dipinjam
                    </SelectItem>
                    <SelectItem value={StatusPeminjaman.ditolak}>
                      Ditolak
                    </SelectItem>
                    <SelectItem value={StatusPeminjaman.dikembalikan}>
                      Dikembalikan
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {peminjamanQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="peminjaman.loading_state"
              >
                {Array.from(
                  { length: 4 },
                  (_, i) => `peminjaman-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-12 w-full" />
                ))}
              </div>
            ) : daftarPeminjaman.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="peminjaman.empty_state"
              >
                <ClipboardList
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada peminjaman
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Catat peminjaman pertama menggunakan formulir di atas, atau
                  tunggu permintaan pengunjung masuk.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="peminjaman.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarPeminjaman.map((item: Peminjaman, index) => (
                      <TableRow
                        key={item.id.toString()}
                        data-ocid={`peminjaman.row.${index + 1}`}
                      >
                        <TableCell>
                          <JenisBadge jenis={item.jenis} />
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.namaTarget}
                        </TableCell>
                        <TableCell>{item.namaPeminjam}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.kelas}
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {formatAngka(item.jumlah)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTanggal(item.tanggalPinjam)}
                        </TableCell>
                        <TableCell>
                          <SumberBadge sumber={item.sumber} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={item.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === StatusPeminjaman.menunggu ? (
                            <div className="flex justify-end gap-1">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  setujuiPeminjaman.mutate(item.id, {
                                    onError: (error) =>
                                      setAksiError(error.message),
                                  })
                                }
                                disabled={
                                  setujuiPeminjaman.isPending ||
                                  tolakPeminjaman.isPending
                                }
                                data-ocid={`peminjaman.setujui_button.${index + 1}`}
                              >
                                <Check className="size-4" aria-hidden="true" />
                                Setujui
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  tolakPeminjaman.mutate(item.id, {
                                    onError: (error) =>
                                      setAksiError(error.message),
                                  })
                                }
                                disabled={
                                  setujuiPeminjaman.isPending ||
                                  tolakPeminjaman.isPending
                                }
                                className="text-destructive hover:text-destructive"
                                data-ocid={`peminjaman.tolak_button.${index + 1}`}
                              >
                                <X className="size-4" aria-hidden="true" />
                                Tolak
                              </Button>
                            </div>
                          ) : item.status === StatusPeminjaman.dipinjam ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setKembaliId(item.id);
                                setTanggalKembali(todayIso());
                                setKondisiKembali("");
                              }}
                              data-ocid={`peminjaman.kembali_button.${index + 1}`}
                            >
                              Catat Kembali
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {formatTanggal(item.tanggalKembali)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {kembaliId !== null ? (
          <Card
            className="border-accent/40 shadow-subtle"
            data-ocid="peminjaman.kembali.card"
          >
            <CardContent className="flex flex-col gap-4 p-5 md:p-6">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-accent" aria-hidden="true" />
                <h2 className="font-display text-base font-bold tracking-tight">
                  Catat Pengembalian
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="kembali-tanggal">Tanggal Kembali</Label>
                  <Input
                    id="kembali-tanggal"
                    type="date"
                    value={tanggalKembali}
                    onChange={(event) => setTanggalKembali(event.target.value)}
                    data-ocid="peminjaman.kembali_tanggal.input"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="kembali-kondisi">Kondisi Unit</Label>
                  <Input
                    id="kembali-kondisi"
                    value={kondisiKembali}
                    onChange={(event) => setKondisiKembali(event.target.value)}
                    placeholder="Contoh: Baik, lengkap"
                    data-ocid="peminjaman.kondisi.input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setKembaliId(null)}
                  data-ocid="peminjaman.kembali_cancel_button"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={simpanPengembalian}
                  disabled={
                    kondisiKembali.trim() === "" || catatPengembalian.isPending
                  }
                  data-ocid="peminjaman.kembali_submit_button"
                >
                  {catatPengembalian.isPending ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <RotateCcw className="size-4" aria-hidden="true" />
                  )}
                  Simpan Pengembalian
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AdminShell>
  );
}
