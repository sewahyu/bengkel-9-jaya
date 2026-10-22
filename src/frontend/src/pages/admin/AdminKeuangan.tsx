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
import {
  useAddNota,
  useDeleteNota,
  useListNota,
  useRingkasanKeuangan,
  useUpdateNota,
} from "@/hooks/use-backend";
import { KATEGORI_NOTA, STATUS_LABEL } from "@/lib/constants";
import {
  eksporXlsx,
  formatRupiah,
  formatTanggal,
  todayIso,
} from "@/lib/format";
import type { SelExcel } from "@/lib/format";
import { JenisNota } from "@/types";
import type { Nota } from "@/types";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

const SEMUA = "semua";

interface FormState {
  id: bigint | null;
  tanggal: string;
  keterangan: string;
  jenis: JenisNota;
  kategori: string;
  nominal: string;
}

function formKosong(): FormState {
  return {
    id: null,
    tanggal: todayIso(),
    keterangan: "",
    jenis: JenisNota.masuk,
    kategori: KATEGORI_NOTA[0]?.value ?? "",
    nominal: "",
  };
}

export function AdminKeuangan() {
  const [jenisFilter, setJenisFilter] = useState<string>(SEMUA);
  const [dariTanggal, setDariTanggal] = useState("");
  const [sampaiTanggal, setSampaiTanggal] = useState("");
  const [cari, setCari] = useState("");
  const [form, setForm] = useState<FormState>(formKosong);
  const [formError, setFormError] = useState<string | null>(null);

  const jenisParam = jenisFilter === SEMUA ? null : (jenisFilter as JenisNota);

  const notaQuery = useListNota(
    jenisParam,
    dariTanggal === "" ? null : dariTanggal,
    sampaiTanggal === "" ? null : sampaiTanggal,
  );
  const ringkasanQuery = useRingkasanKeuangan();
  const addNota = useAddNota();
  const updateNota = useUpdateNota();
  const deleteNota = useDeleteNota();

  const daftarNota = notaQuery.data ?? [];
  const ringkasan = ringkasanQuery.data ?? {
    totalMasuk: 0n,
    totalKeluar: 0n,
    saldo: 0n,
  };

  const kataKunci = cari.trim().toLowerCase();
  const notaTampil =
    kataKunci === ""
      ? daftarNota
      : daftarNota.filter((nota) =>
          nota.keterangan.toLowerCase().includes(kataKunci),
        );

  const nominalAngka = Number(form.nominal);
  const nominalValid = Number.isInteger(nominalAngka) && nominalAngka > 0;
  const bisaSimpan =
    form.keterangan.trim() !== "" &&
    form.kategori !== "" &&
    nominalValid &&
    form.tanggal !== "";

  function simpan() {
    if (!bisaSimpan) return;
    const payload = {
      tanggal: form.tanggal,
      keterangan: form.keterangan.trim(),
      jenis: form.jenis,
      kategori: form.kategori,
      nominal: BigInt(nominalAngka),
    };
    const id = form.id;
    setFormError(null);
    if (id === null) {
      addNota.mutate(payload, {
        onSuccess: () => setForm(formKosong()),
        onError: (error) => setFormError(error.message),
      });
    } else {
      updateNota.mutate(
        { id, ...payload },
        {
          onSuccess: () => setForm(formKosong()),
          onError: (error) => setFormError(error.message),
        },
      );
    }
  }

  function eksporDaftar() {
    const header: SelExcel[] = [
      "Tanggal",
      "Keterangan",
      "Kategori",
      "Jenis",
      "Nominal",
    ];
    const baris: SelExcel[][] = notaTampil.map((nota) => [
      nota.tanggal,
      nota.keterangan,
      nota.kategori,
      STATUS_LABEL[nota.jenis] ?? nota.jenis,
      Number(nota.nominal),
    ]);
    eksporXlsx(`keuangan-nota-${todayIso()}.xlsx`, "Nota Keuangan", [
      header,
      ...baris,
    ]);
  }

  function mulaiUbah(nota: Nota) {
    setForm({
      id: nota.id,
      tanggal: nota.tanggal,
      keterangan: nota.keterangan,
      jenis: nota.jenis,
      kategori: nota.kategori,
      nominal: nota.nominal.toString(),
    });
    setFormError(null);
  }

  const ringkasanKartu = [
    {
      label: "Total Uang Masuk",
      value: formatRupiah(ringkasan.totalMasuk),
      icon: ArrowDownLeft,
      tone: "text-success",
      bg: "bg-success/10",
      ocid: "keuangan.stat.masuk",
    },
    {
      label: "Total Uang Keluar",
      value: formatRupiah(ringkasan.totalKeluar),
      icon: ArrowUpRight,
      tone: "text-destructive",
      bg: "bg-destructive/10",
      ocid: "keuangan.stat.keluar",
    },
    {
      label: "Saldo Kas",
      value: formatRupiah(ringkasan.saldo),
      icon: Wallet,
      tone: "text-accent",
      bg: "bg-accent/10",
      ocid: "keuangan.stat.saldo",
    },
  ];

  return (
    <AdminShell
      title="Laporan Keuangan Nota"
      description="Catat uang masuk dan keluar bengkel, pantau saldo kas, dan kelola nota keuangan UPJ."
    >
      <div className="flex flex-col gap-8">
        <section
          className="grid gap-4 sm:grid-cols-3"
          aria-label="Ringkasan keuangan"
          data-ocid="keuangan.ringkasan.section"
        >
          {ringkasanKartu.map((kartu) => (
            <Card
              key={kartu.ocid}
              className="border-border shadow-subtle"
              data-ocid={kartu.ocid}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <span
                  className={`flex size-11 shrink-0 items-center justify-center rounded-md ${kartu.bg} ${kartu.tone}`}
                >
                  <kartu.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {kartu.label}
                  </span>
                  {ringkasanQuery.isLoading ? (
                    <Skeleton className="h-7 w-28" />
                  ) : (
                    <span className="rule-numeral truncate text-xl font-bold tracking-tight">
                      {kartu.value}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card
          className="border-border shadow-subtle"
          data-ocid="keuangan.form.card"
        >
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              {form.id === null ? (
                <Plus className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Pencil className="size-4 text-accent" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-bold tracking-tight">
                {form.id === null ? "Catat Nota Baru" : "Ubah Nota"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nota-tanggal">Tanggal</Label>
                <Input
                  id="nota-tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal: event.target.value,
                    }))
                  }
                  data-ocid="keuangan.tanggal.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="nota-jenis">Jenis</Label>
                <Select
                  value={form.jenis}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, jenis: value as JenisNota }))
                  }
                >
                  <SelectTrigger
                    id="nota-jenis"
                    data-ocid="keuangan.jenis.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JenisNota.masuk}>Uang Masuk</SelectItem>
                    <SelectItem value={JenisNota.keluar}>
                      Uang Keluar
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="nota-kategori">Kategori</Label>
                <Select
                  value={form.kategori}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, kategori: value }))
                  }
                >
                  <SelectTrigger
                    id="nota-kategori"
                    data-ocid="keuangan.kategori.select"
                  >
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_NOTA.map((kategori) => (
                      <SelectItem key={kategori.value} value={kategori.value}>
                        {kategori.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="nota-keterangan">Keterangan</Label>
                <Input
                  id="nota-keterangan"
                  value={form.keterangan}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      keterangan: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Pembelian oli mesin 4 liter"
                  data-ocid="keuangan.keterangan.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="nota-nominal">Nominal (Rp)</Label>
                <Input
                  id="nota-nominal"
                  type="number"
                  min={1}
                  value={form.nominal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      nominal: event.target.value,
                    }))
                  }
                  placeholder="0"
                  data-ocid="keuangan.nominal.input"
                />
              </div>
            </div>

            {formError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="keuangan.form.error_state"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {formError}
              </p>
            ) : null}

            <div className="flex justify-end gap-2">
              {form.id !== null ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setForm(formKosong());
                    setFormError(null);
                  }}
                  data-ocid="keuangan.cancel_button"
                >
                  Batal
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={simpan}
                disabled={
                  !bisaSimpan || addNota.isPending || updateNota.isPending
                }
                data-ocid="keuangan.submit_button"
              >
                {addNota.isPending || updateNota.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {form.id === null ? "Simpan Nota" : "Perbarui Nota"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="keuangan.list.card"
        >
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-base font-bold tracking-tight">
                Daftar Nota
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    value={cari}
                    onChange={(event) => setCari(event.target.value)}
                    placeholder="Cari keterangan"
                    className="w-52 pl-9"
                    aria-label="Cari keterangan nota"
                    data-ocid="keuangan.search_input"
                  />
                </div>
                <Select value={jenisFilter} onValueChange={setJenisFilter}>
                  <SelectTrigger
                    className="w-40"
                    aria-label="Filter jenis nota"
                    data-ocid="keuangan.filter.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA}>Semua Jenis</SelectItem>
                    <SelectItem value={JenisNota.masuk}>Uang Masuk</SelectItem>
                    <SelectItem value={JenisNota.keluar}>
                      Uang Keluar
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dariTanggal}
                  onChange={(event) => setDariTanggal(event.target.value)}
                  className="w-40"
                  aria-label="Dari tanggal"
                  data-ocid="keuangan.dari_tanggal.input"
                />
                <Input
                  type="date"
                  value={sampaiTanggal}
                  onChange={(event) => setSampaiTanggal(event.target.value)}
                  className="w-40"
                  aria-label="Sampai tanggal"
                  data-ocid="keuangan.sampai_tanggal.input"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={eksporDaftar}
                  disabled={notaTampil.length === 0}
                  data-ocid="keuangan.ekspor_button"
                >
                  <Download className="size-4" aria-hidden="true" />
                  Ekspor Excel
                </Button>
              </div>
            </div>

            {notaQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="keuangan.loading_state"
              >
                {Array.from(
                  { length: 4 },
                  (_, i) => `keuangan-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-12 w-full" />
                ))}
              </div>
            ) : notaTampil.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="keuangan.empty_state"
              >
                <Wallet
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada nota
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Catat nota pertama menggunakan formulir di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="keuangan.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Nominal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notaTampil.map((nota, index) => (
                      <TableRow
                        key={nota.id.toString()}
                        data-ocid={`keuangan.row.${index + 1}`}
                      >
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTanggal(nota.tanggal)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {nota.keterangan}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {nota.kategori}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              nota.jenis === JenisNota.masuk
                                ? "inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success"
                                : "inline-flex items-center rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                            }
                          >
                            {STATUS_LABEL[nota.jenis] ?? nota.jenis}
                          </span>
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-right font-semibold">
                          {formatRupiah(nota.nominal)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => mulaiUbah(nota)}
                              aria-label={`Ubah nota ${nota.keterangan}`}
                              data-ocid={`keuangan.edit_button.${index + 1}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNota.mutate(nota.id)}
                              aria-label={`Hapus nota ${nota.keterangan}`}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`keuangan.delete_button.${index + 1}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
