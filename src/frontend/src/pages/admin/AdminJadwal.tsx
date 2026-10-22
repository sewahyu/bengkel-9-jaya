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
  useAddJadwal,
  useDeleteJadwal,
  useListJadwal,
  useUpdateJadwal,
} from "@/hooks/use-backend";
import { HARI_OPTIONS } from "@/lib/constants";
import { formatTanggal, todayIso } from "@/lib/format";
import type { JadwalUpj } from "@/types";
import {
  AlertCircle,
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

interface FormState {
  id: bigint | null;
  hari: string;
  tanggal: string;
  namaSiswa: string;
  kelas: string;
  tugas: string;
}

function formKosong(): FormState {
  return {
    id: null,
    hari: HARI_OPTIONS[0]?.value ?? "Senin",
    tanggal: todayIso(),
    namaSiswa: "",
    kelas: "",
    tugas: "",
  };
}

export function AdminJadwal() {
  const [form, setForm] = useState<FormState>(formKosong);
  const [formError, setFormError] = useState<string | null>(null);

  const jadwalQuery = useListJadwal();
  const addJadwal = useAddJadwal();
  const updateJadwal = useUpdateJadwal();
  const deleteJadwal = useDeleteJadwal();

  const daftarJadwal = jadwalQuery.data ?? [];
  const bisaSimpan =
    form.hari !== "" &&
    form.tanggal !== "" &&
    form.namaSiswa.trim() !== "" &&
    form.kelas.trim() !== "" &&
    form.tugas.trim() !== "";

  function simpan() {
    if (!bisaSimpan) return;
    const payload = {
      hari: form.hari,
      tanggal: form.tanggal,
      namaSiswa: form.namaSiswa.trim(),
      kelas: form.kelas.trim(),
      tugas: form.tugas.trim(),
    };
    const id = form.id;
    setFormError(null);
    if (id === null) {
      addJadwal.mutate(payload, {
        onSuccess: () => setForm(formKosong()),
        onError: (error) => setFormError(error.message),
      });
    } else {
      updateJadwal.mutate(
        { id, ...payload },
        {
          onSuccess: () => setForm(formKosong()),
          onError: (error) => setFormError(error.message),
        },
      );
    }
  }

  function mulaiUbah(item: JadwalUpj) {
    setForm({
      id: item.id,
      hari: item.hari,
      tanggal: item.tanggal,
      namaSiswa: item.namaSiswa,
      kelas: item.kelas,
      tugas: item.tugas,
    });
    setFormError(null);
  }

  return (
    <AdminShell
      title="Jadwal UPJ"
      description="Atur jadwal piket Unit Pengelolaan Jurusan. Tampilan publik hanya membaca jadwal ini."
    >
      <div className="flex flex-col gap-8">
        <Card
          className="border-border shadow-subtle"
          data-ocid="jadwal.form.card"
        >
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              {form.id === null ? (
                <Plus className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Pencil className="size-4 text-accent" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-bold tracking-tight">
                {form.id === null ? "Tambah Jadwal" : "Ubah Jadwal"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="jadwal-hari">Hari</Label>
                <Select
                  value={form.hari}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, hari: value }))
                  }
                >
                  <SelectTrigger
                    id="jadwal-hari"
                    data-ocid="jadwal.hari.select"
                  >
                    <SelectValue placeholder="Pilih hari" />
                  </SelectTrigger>
                  <SelectContent>
                    {HARI_OPTIONS.map((hari) => (
                      <SelectItem key={hari.value} value={hari.value}>
                        {hari.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="jadwal-tanggal">Tanggal</Label>
                <Input
                  id="jadwal-tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal: event.target.value,
                    }))
                  }
                  data-ocid="jadwal.tanggal.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="jadwal-nama">Nama Siswa</Label>
                <Input
                  id="jadwal-nama"
                  value={form.namaSiswa}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      namaSiswa: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Andi Saputra"
                  data-ocid="jadwal.nama.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="jadwal-kelas">Kelas</Label>
                <Input
                  id="jadwal-kelas"
                  value={form.kelas}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, kelas: event.target.value }))
                  }
                  placeholder="Contoh: XI TSM 1"
                  data-ocid="jadwal.kelas.input"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="jadwal-tugas">Tugas</Label>
                <Input
                  id="jadwal-tugas"
                  value={form.tugas}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tugas: event.target.value }))
                  }
                  placeholder="Contoh: Menyapu area bengkel dan merapikan alat"
                  data-ocid="jadwal.tugas.input"
                />
              </div>
            </div>

            {formError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="jadwal.form.error_state"
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
                  data-ocid="jadwal.cancel_button"
                >
                  Batal
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={simpan}
                disabled={
                  !bisaSimpan || addJadwal.isPending || updateJadwal.isPending
                }
                data-ocid="jadwal.submit_button"
              >
                {addJadwal.isPending || updateJadwal.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {form.id === null ? "Tambah Jadwal" : "Perbarui Jadwal"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="jadwal.list.card"
        >
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <h2 className="font-display text-base font-bold tracking-tight">
              Daftar Jadwal
            </h2>

            {jadwalQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="jadwal.loading_state"
              >
                {Array.from(
                  { length: 4 },
                  (_, i) => `jadwal-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-12 w-full" />
                ))}
              </div>
            ) : daftarJadwal.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="jadwal.empty_state"
              >
                <CalendarDays
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada jadwal
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Tambahkan jadwal piket pertama menggunakan formulir di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="jadwal.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hari</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Nama Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Tugas</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarJadwal.map((item, index) => (
                      <TableRow
                        key={item.id.toString()}
                        data-ocid={`jadwal.row.${index + 1}`}
                      >
                        <TableCell className="font-medium">
                          {item.hari}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTanggal(item.tanggal)}
                        </TableCell>
                        <TableCell>{item.namaSiswa}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.kelas}
                        </TableCell>
                        <TableCell className="max-w-xs text-muted-foreground">
                          {item.tugas}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => mulaiUbah(item)}
                              aria-label={`Ubah jadwal ${item.namaSiswa}`}
                              data-ocid={`jadwal.edit_button.${index + 1}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteJadwal.mutate(item.id)}
                              aria-label={`Hapus jadwal ${item.namaSiswa}`}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`jadwal.delete_button.${index + 1}`}
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
