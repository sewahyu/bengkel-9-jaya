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
  useAddAlat,
  useDeleteAlat,
  useListAlat,
  useUpdateAlat,
} from "@/hooks/use-backend";
import { KATEGORI_ALAT } from "@/lib/constants";
import { formatAngka, statusKetersediaan } from "@/lib/format";
import type { Alat } from "@/types";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

interface FormState {
  id: bigint | null;
  nama: string;
  kategori: string;
  jumlahTotal: string;
  keterangan: string;
}

function formKosong(): FormState {
  return {
    id: null,
    nama: "",
    kategori: KATEGORI_ALAT[0]?.value ?? "",
    jumlahTotal: "1",
    keterangan: "",
  };
}

function StatusAlat({ tersedia, total }: { tersedia: bigint; total: bigint }) {
  const status = statusKetersediaan(tersedia, 0);
  const gaya =
    status === "habis"
      ? "bg-destructive/15 text-destructive"
      : status === "menipis"
        ? "bg-warning/15 text-warning"
        : "bg-success/15 text-success";
  const label =
    status === "habis"
      ? "Habis"
      : status === "menipis"
        ? "Menipis"
        : "Tersedia";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gaya}`}
    >
      {label} · {formatAngka(tersedia)}/{formatAngka(total)}
    </span>
  );
}

export function AdminAlat() {
  const [form, setForm] = useState<FormState>(formKosong);
  const [formError, setFormError] = useState<string | null>(null);

  const alatQuery = useListAlat();
  const addAlat = useAddAlat();
  const updateAlat = useUpdateAlat();
  const deleteAlat = useDeleteAlat();

  const daftarAlat = alatQuery.data ?? [];
  const totalAngka = Number(form.jumlahTotal);
  const totalValid = Number.isInteger(totalAngka) && totalAngka > 0;
  const bisaSimpan =
    form.nama.trim() !== "" && form.kategori !== "" && totalValid;

  function simpan() {
    if (!bisaSimpan) return;
    const payload = {
      nama: form.nama.trim(),
      kategori: form.kategori,
      jumlahTotal: BigInt(totalAngka),
      keterangan: form.keterangan.trim(),
    };
    const id = form.id;
    setFormError(null);
    if (id === null) {
      addAlat.mutate(payload, {
        onSuccess: () => setForm(formKosong()),
        onError: (error) => setFormError(error.message),
      });
    } else {
      updateAlat.mutate(
        { id, ...payload },
        {
          onSuccess: () => setForm(formKosong()),
          onError: (error) => setFormError(error.message),
        },
      );
    }
  }

  function mulaiUbah(alat: Alat) {
    setForm({
      id: alat.id,
      nama: alat.nama,
      kategori: alat.kategori,
      jumlahTotal: alat.jumlahTotal.toString(),
      keterangan: alat.keterangan,
    });
    setFormError(null);
  }

  return (
    <AdminShell
      title="Data Alat"
      description="Kelola inventaris Alat bengkel yang terpisah dari Trainer, lengkap dengan kategori, keterangan, dan ketersediaannya."
    >
      <div className="flex flex-col gap-8">
        <Card
          className="border-border shadow-subtle"
          data-ocid="alat.form.card"
        >
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              {form.id === null ? (
                <Plus className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Pencil className="size-4 text-accent" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-bold tracking-tight">
                {form.id === null ? "Tambah Alat" : "Ubah Alat"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="alat-nama">Nama Alat</Label>
                <Input
                  id="alat-nama"
                  value={form.nama}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, nama: event.target.value }))
                  }
                  placeholder="Contoh: Kunci Ring Pas Set 8-24 mm"
                  data-ocid="alat.nama.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="alat-kategori">Kategori</Label>
                <Select
                  value={form.kategori}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, kategori: value }))
                  }
                >
                  <SelectTrigger
                    id="alat-kategori"
                    data-ocid="alat.kategori.select"
                  >
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_ALAT.map((kategori) => (
                      <SelectItem key={kategori.value} value={kategori.value}>
                        {kategori.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="alat-total">Jumlah Total</Label>
                <Input
                  id="alat-total"
                  type="number"
                  min={1}
                  value={form.jumlahTotal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      jumlahTotal: event.target.value,
                    }))
                  }
                  data-ocid="alat.total.input"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="alat-keterangan">Keterangan</Label>
                <Textarea
                  id="alat-keterangan"
                  value={form.keterangan}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      keterangan: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Set lengkap dalam kotak merah"
                  rows={2}
                  data-ocid="alat.keterangan.textarea"
                />
              </div>
            </div>
            {formError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="alat.form.error_state"
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
                  data-ocid="alat.cancel_button"
                >
                  Batal
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={simpan}
                disabled={
                  !bisaSimpan || addAlat.isPending || updateAlat.isPending
                }
                data-ocid="alat.submit_button"
              >
                {addAlat.isPending || updateAlat.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {form.id === null ? "Tambah Alat" : "Perbarui Alat"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="alat.list.card"
        >
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <h2 className="font-display text-base font-bold tracking-tight">
              Daftar Alat
            </h2>

            {alatQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="alat.loading_state"
              >
                {Array.from({ length: 4 }, (_, i) => `alat-skeleton-${i}`).map(
                  (id) => (
                    <Skeleton key={id} className="h-12 w-full" />
                  ),
                )}
              </div>
            ) : daftarAlat.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="alat.empty_state"
              >
                <Wrench
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada Alat
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Tambahkan Alat pertama menggunakan formulir di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="alat.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Alat</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Ketersediaan</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarAlat.map((alat, index) => (
                      <TableRow
                        key={alat.id.toString()}
                        data-ocid={`alat.row.${index + 1}`}
                      >
                        <TableCell className="font-medium">
                          {alat.nama}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {alat.kategori}
                        </TableCell>
                        <TableCell>
                          <StatusAlat
                            tersedia={alat.jumlahTersedia}
                            total={alat.jumlahTotal}
                          />
                        </TableCell>
                        <TableCell className="max-w-xs text-muted-foreground">
                          {alat.keterangan || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => mulaiUbah(alat)}
                              aria-label={`Ubah ${alat.nama}`}
                              data-ocid={`alat.edit_button.${index + 1}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAlat.mutate(alat.id)}
                              aria-label={`Hapus ${alat.nama}`}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`alat.delete_button.${index + 1}`}
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
