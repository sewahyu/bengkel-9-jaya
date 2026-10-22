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
  useAddSparepart,
  useCatatMutasiStok,
  useDeleteSparepart,
  useListMutasiStok,
  useListSparepart,
  useUpdateSparepart,
} from "@/hooks/use-backend";
import { KATEGORI_SPAREPART, STATUS_LABEL } from "@/lib/constants";
import { formatAngka, formatWaktu, statusKetersediaan } from "@/lib/format";
import { JenisMutasiStok } from "@/types";
import type { Sparepart } from "@/types";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

interface FormState {
  id: bigint | null;
  nama: string;
  kode: string;
  kategori: string;
  jumlahStok: string;
  satuan: string;
  ambangMinimum: string;
}

function formKosong(): FormState {
  return {
    id: null,
    nama: "",
    kode: "",
    kategori: KATEGORI_SPAREPART[0]?.value ?? "",
    jumlahStok: "0",
    satuan: "pcs",
    ambangMinimum: "2",
  };
}

function StatusStok({ item }: { item: Sparepart }) {
  const status = statusKetersediaan(item.jumlahStok, item.ambangMinimum);
  const gaya =
    status === "habis"
      ? "bg-destructive/15 text-destructive"
      : status === "menipis"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gaya}`}
    >
      {STATUS_LABEL[status] ?? status} · {formatAngka(item.jumlahStok)}{" "}
      {item.satuan}
    </span>
  );
}

export function AdminSparepart() {
  const [form, setForm] = useState<FormState>(formKosong);
  const [formError, setFormError] = useState<string | null>(null);

  const [mutasiId, setMutasiId] = useState("");
  const [mutasiJenis, setMutasiJenis] = useState<JenisMutasiStok>(
    JenisMutasiStok.masuk,
  );
  const [mutasiJumlah, setMutasiJumlah] = useState("1");
  const [mutasiKeterangan, setMutasiKeterangan] = useState("");
  const [mutasiError, setMutasiError] = useState<string | null>(null);

  const sparepartQuery = useListSparepart();
  const addSparepart = useAddSparepart();
  const updateSparepart = useUpdateSparepart();
  const deleteSparepart = useDeleteSparepart();
  const catatMutasi = useCatatMutasiStok();

  const daftarSparepart = sparepartQuery.data ?? [];
  const mutasiQuery = useListMutasiStok(
    mutasiId === "" ? null : BigInt(mutasiId),
  );
  const daftarMutasi = mutasiQuery.data ?? [];

  const stokAngka = Number(form.jumlahStok);
  const ambangAngka = Number(form.ambangMinimum);
  const stokValid = Number.isInteger(stokAngka) && stokAngka >= 0;
  const ambangValid = Number.isInteger(ambangAngka) && ambangAngka >= 0;
  const bisaSimpan =
    form.nama.trim() !== "" &&
    form.kode.trim() !== "" &&
    form.kategori !== "" &&
    form.satuan.trim() !== "" &&
    stokValid &&
    ambangValid;

  const mutasiJumlahAngka = Number(mutasiJumlah);
  const mutasiValid =
    mutasiId !== "" &&
    Number.isInteger(mutasiJumlahAngka) &&
    mutasiJumlahAngka > 0 &&
    mutasiKeterangan.trim() !== "";

  function simpan() {
    if (!bisaSimpan) return;
    const payload = {
      nama: form.nama.trim(),
      kode: form.kode.trim(),
      kategori: form.kategori,
      jumlahStok: BigInt(stokAngka),
      satuan: form.satuan.trim(),
      ambangMinimum: BigInt(ambangAngka),
    };
    const id = form.id;
    setFormError(null);
    if (id === null) {
      addSparepart.mutate(payload, {
        onSuccess: () => setForm(formKosong()),
        onError: (error) => setFormError(error.message),
      });
    } else {
      updateSparepart.mutate(
        { id, ...payload },
        {
          onSuccess: () => setForm(formKosong()),
          onError: (error) => setFormError(error.message),
        },
      );
    }
  }

  function mulaiUbah(item: Sparepart) {
    setForm({
      id: item.id,
      nama: item.nama,
      kode: item.kode,
      kategori: item.kategori,
      jumlahStok: item.jumlahStok.toString(),
      satuan: item.satuan,
      ambangMinimum: item.ambangMinimum.toString(),
    });
    setFormError(null);
  }

  function simpanMutasi() {
    if (!mutasiValid) return;
    const payload = {
      sparepartId: BigInt(mutasiId),
      jenis: mutasiJenis,
      jumlah: BigInt(mutasiJumlahAngka),
      keterangan: mutasiKeterangan.trim(),
    };
    setMutasiError(null);
    catatMutasi.mutate(payload, {
      onSuccess: () => {
        setMutasiJumlah("1");
        setMutasiKeterangan("");
      },
      onError: (error) => setMutasiError(error.message),
    });
  }

  return (
    <AdminShell
      title="Data Sparepart"
      description="Kelola stok sparepart, catat mutasi masuk dan keluar, serta pantau riwayat pergerakan stok."
    >
      <div className="flex flex-col gap-8">
        <Card
          className="border-border shadow-subtle"
          data-ocid="sparepart.form.card"
        >
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              {form.id === null ? (
                <Plus className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Pencil className="size-4 text-accent" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-bold tracking-tight">
                {form.id === null ? "Tambah Sparepart" : "Ubah Sparepart"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="sparepart-nama">Nama Sparepart</Label>
                <Input
                  id="sparepart-nama"
                  value={form.nama}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, nama: event.target.value }))
                  }
                  placeholder="Contoh: Busi NGK CPR9EA-9"
                  data-ocid="sparepart.nama.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sparepart-kode">Kode</Label>
                <Input
                  id="sparepart-kode"
                  value={form.kode}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, kode: event.target.value }))
                  }
                  placeholder="Contoh: SP-BUS-001"
                  data-ocid="sparepart.kode.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sparepart-kategori">Kategori</Label>
                <Select
                  value={form.kategori}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, kategori: value }))
                  }
                >
                  <SelectTrigger
                    id="sparepart-kategori"
                    data-ocid="sparepart.kategori.select"
                  >
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_SPAREPART.map((kategori) => (
                      <SelectItem key={kategori.value} value={kategori.value}>
                        {kategori.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sparepart-stok">Jumlah Stok</Label>
                <Input
                  id="sparepart-stok"
                  type="number"
                  min={0}
                  value={form.jumlahStok}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      jumlahStok: event.target.value,
                    }))
                  }
                  data-ocid="sparepart.stok.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sparepart-satuan">Satuan</Label>
                <Input
                  id="sparepart-satuan"
                  value={form.satuan}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, satuan: event.target.value }))
                  }
                  placeholder="pcs / liter / set"
                  data-ocid="sparepart.satuan.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sparepart-ambang">Ambang Minimum</Label>
                <Input
                  id="sparepart-ambang"
                  type="number"
                  min={0}
                  value={form.ambangMinimum}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      ambangMinimum: event.target.value,
                    }))
                  }
                  data-ocid="sparepart.ambang.input"
                />
              </div>
            </div>

            {formError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="sparepart.form.error_state"
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
                  data-ocid="sparepart.cancel_button"
                >
                  Batal
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={simpan}
                disabled={
                  !bisaSimpan ||
                  addSparepart.isPending ||
                  updateSparepart.isPending
                }
                data-ocid="sparepart.submit_button"
              >
                {addSparepart.isPending || updateSparepart.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {form.id === null ? "Tambah Sparepart" : "Perbarui Sparepart"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="sparepart.list.card"
        >
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <h2 className="font-display text-base font-bold tracking-tight">
              Daftar Sparepart
            </h2>

            {sparepartQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="sparepart.loading_state"
              >
                {Array.from(
                  { length: 4 },
                  (_, i) => `sparepart-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-12 w-full" />
                ))}
              </div>
            ) : daftarSparepart.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="sparepart.empty_state"
              >
                <Package
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada sparepart
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Tambahkan sparepart pertama menggunakan formulir di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="sparepart.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status Stok</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarSparepart.map((item, index) => (
                      <TableRow
                        key={item.id.toString()}
                        data-ocid={`sparepart.row.${index + 1}`}
                      >
                        <TableCell className="font-medium">
                          {item.nama}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {item.kode}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.kategori}
                        </TableCell>
                        <TableCell>
                          <StatusStok item={item} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => mulaiUbah(item)}
                              aria-label={`Ubah ${item.nama}`}
                              data-ocid={`sparepart.edit_button.${index + 1}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSparepart.mutate(item.id)}
                              aria-label={`Hapus ${item.nama}`}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`sparepart.delete_button.${index + 1}`}
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

        <Card className="border-border shadow-subtle" data-ocid="mutasi.card">
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <History className="size-4 text-accent" aria-hidden="true" />
              <h2 className="font-display text-base font-bold tracking-tight">
                Mutasi Stok
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="mutasi-sparepart">Sparepart</Label>
                <Select value={mutasiId} onValueChange={setMutasiId}>
                  <SelectTrigger
                    id="mutasi-sparepart"
                    data-ocid="mutasi.sparepart.select"
                  >
                    <SelectValue placeholder="Pilih sparepart" />
                  </SelectTrigger>
                  <SelectContent>
                    {daftarSparepart.map((item) => (
                      <SelectItem
                        key={item.id.toString()}
                        value={item.id.toString()}
                      >
                        {item.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mutasi-jenis">Jenis Mutasi</Label>
                <Select
                  value={mutasiJenis}
                  onValueChange={(value) =>
                    setMutasiJenis(value as JenisMutasiStok)
                  }
                >
                  <SelectTrigger
                    id="mutasi-jenis"
                    data-ocid="mutasi.jenis.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={JenisMutasiStok.masuk}>
                      Stok Masuk
                    </SelectItem>
                    <SelectItem value={JenisMutasiStok.keluar}>
                      Stok Keluar
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mutasi-jumlah">Jumlah</Label>
                <Input
                  id="mutasi-jumlah"
                  type="number"
                  min={1}
                  value={mutasiJumlah}
                  onChange={(event) => setMutasiJumlah(event.target.value)}
                  data-ocid="mutasi.jumlah.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mutasi-keterangan">Keterangan</Label>
                <Input
                  id="mutasi-keterangan"
                  value={mutasiKeterangan}
                  onChange={(event) => setMutasiKeterangan(event.target.value)}
                  placeholder="Contoh: Restock dari gudang"
                  data-ocid="mutasi.keterangan.input"
                />
              </div>
            </div>

            {mutasiError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="mutasi.error_state"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {mutasiError}
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={simpanMutasi}
                disabled={!mutasiValid || catatMutasi.isPending}
                data-ocid="mutasi.submit_button"
              >
                {catatMutasi.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : mutasiJenis === JenisMutasiStok.masuk ? (
                  <ArrowDownToLine className="size-4" aria-hidden="true" />
                ) : (
                  <ArrowUpFromLine className="size-4" aria-hidden="true" />
                )}
                Catat Mutasi
              </Button>
            </div>

            {mutasiId === "" ? (
              <p className="text-xs text-muted-foreground">
                Pilih sparepart untuk melihat riwayat mutasinya.
              </p>
            ) : mutasiQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="mutasi.loading_state"
              >
                {Array.from(
                  { length: 3 },
                  (_, i) => `mutasi-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-10 w-full" />
                ))}
              </div>
            ) : daftarMutasi.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-10 text-center"
                data-ocid="mutasi.empty_state"
              >
                <History
                  className="size-7 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="text-xs text-muted-foreground">
                  Belum ada mutasi untuk sparepart ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="mutasi.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Jenis</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarMutasi.map((mutasi, index) => (
                      <TableRow
                        key={mutasi.id.toString()}
                        data-ocid={`mutasi.row.${index + 1}`}
                      >
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatWaktu(mutasi.waktu)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              mutasi.jenis === JenisMutasiStok.masuk
                                ? "inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success"
                                : "inline-flex items-center rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                            }
                          >
                            {STATUS_LABEL[mutasi.jenis] ?? mutasi.jenis}
                          </span>
                        </TableCell>
                        <TableCell className="tabular text-right">
                          {formatAngka(mutasi.jumlah)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mutasi.keterangan || "—"}
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
