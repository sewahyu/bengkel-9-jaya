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
  useAddPeminjamanLab,
  useDeletePeminjamanLab,
  useListPeminjamanLab,
  useUpdatePeminjamanLab,
} from "@/hooks/use-backend";
import { LAB_OPTIONS, LAB_STYLE, STATUS_LABEL } from "@/lib/constants";
import { formatTanggal, todayIso } from "@/lib/format";
import { Lab, StatusPeminjamanLab } from "@/types";
import type { PeminjamanLab } from "@/types";
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

const SEMUA = "semua";

const STATUS_OPTIONS: { value: StatusPeminjamanLab; label: string }[] = [
  { value: StatusPeminjamanLab.menunggu, label: "Menunggu" },
  { value: StatusPeminjamanLab.disetujui, label: "Disetujui" },
  { value: StatusPeminjamanLab.ditolak, label: "Ditolak" },
  { value: StatusPeminjamanLab.selesai, label: "Selesai" },
];

interface FormState {
  id: bigint | null;
  lab: Lab;
  namaPeminjam: string;
  kelas: string;
  kontak: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  keperluan: string;
  status: StatusPeminjamanLab;
}

function formKosong(): FormState {
  return {
    id: null,
    lab: Lab.chasis,
    namaPeminjam: "",
    kelas: "",
    kontak: "",
    tanggal: todayIso(),
    jamMulai: "07:00",
    jamSelesai: "09:00",
    keperluan: "",
    status: StatusPeminjamanLab.menunggu,
  };
}

function LabChip({ lab }: { lab: Lab }) {
  const gaya = LAB_STYLE[lab]?.chip ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gaya}`}
    >
      {lab}
    </span>
  );
}

function StatusLabBadge({ status }: { status: StatusPeminjamanLab }) {
  const gaya =
    status === StatusPeminjamanLab.disetujui
      ? "bg-success/15 text-success"
      : status === StatusPeminjamanLab.menunggu
        ? "bg-accent/15 text-accent"
        : status === StatusPeminjamanLab.ditolak
          ? "bg-destructive/15 text-destructive"
          : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gaya}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function AdminPeminjamanLab() {
  const [labFilter, setLabFilter] = useState<string>(SEMUA);
  const [form, setForm] = useState<FormState>(formKosong);
  const [formError, setFormError] = useState<string | null>(null);

  const labParam = labFilter === SEMUA ? null : (labFilter as Lab);

  const labQuery = useListPeminjamanLab(labParam);
  const addLab = useAddPeminjamanLab();
  const updateLab = useUpdatePeminjamanLab();
  const deleteLab = useDeletePeminjamanLab();

  const daftarLab = labQuery.data ?? [];

  const bisaSimpan =
    form.namaPeminjam.trim() !== "" &&
    form.kelas.trim() !== "" &&
    form.tanggal !== "" &&
    form.jamMulai !== "" &&
    form.jamSelesai !== "" &&
    form.keperluan.trim() !== "";

  function simpan() {
    if (!bisaSimpan) return;
    const payload = {
      lab: form.lab,
      namaPeminjam: form.namaPeminjam.trim(),
      kelas: form.kelas.trim(),
      kontak: form.kontak.trim(),
      tanggal: form.tanggal,
      jamMulai: form.jamMulai,
      jamSelesai: form.jamSelesai,
      keperluan: form.keperluan.trim(),
      status: form.status,
    };
    const id = form.id;
    setFormError(null);
    if (id === null) {
      addLab.mutate(payload, {
        onSuccess: () => setForm(formKosong()),
        onError: (error) => setFormError(error.message),
      });
    } else {
      updateLab.mutate(
        { id, ...payload },
        {
          onSuccess: () => setForm(formKosong()),
          onError: (error) => setFormError(error.message),
        },
      );
    }
  }

  function mulaiUbah(item: PeminjamanLab) {
    setForm({
      id: item.id,
      lab: item.lab,
      namaPeminjam: item.namaPeminjam,
      kelas: item.kelas,
      kontak: item.kontak ?? "",
      tanggal: item.tanggal,
      jamMulai: item.jamMulai,
      jamSelesai: item.jamSelesai,
      keperluan: item.keperluan,
      status: item.status,
    });
    setFormError(null);
  }

  return (
    <AdminShell
      title="Peminjaman Lab"
      description="Kelola data peminjaman ketiga laboratorium jurusan Teknik Sepeda Motor: tambah, ubah, dan hapus jadwal penggunaan lab."
    >
      <div className="flex flex-col gap-8">
        <Card className="border-border shadow-subtle" data-ocid="lab.form.card">
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              {form.id === null ? (
                <Plus className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Pencil className="size-4 text-accent" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-bold tracking-tight">
                {form.id === null
                  ? "Tambah Peminjaman Lab"
                  : "Ubah Peminjaman Lab"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-lab">Laboratorium</Label>
                <Select
                  value={form.lab}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, lab: value as Lab }))
                  }
                >
                  <SelectTrigger id="lab-lab" data-ocid="lab.lab.select">
                    <SelectValue placeholder="Pilih lab" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAB_OPTIONS.map((lab) => (
                      <SelectItem key={lab.value} value={lab.value}>
                        {lab.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-nama">Nama Peminjam</Label>
                <Input
                  id="lab-nama"
                  value={form.namaPeminjam}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      namaPeminjam: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Dwi Anggraini"
                  data-ocid="lab.nama.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-kelas">Kelas / Instansi</Label>
                <Input
                  id="lab-kelas"
                  value={form.kelas}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, kelas: event.target.value }))
                  }
                  placeholder="Contoh: XI TSM 1"
                  data-ocid="lab.kelas.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-kontak">Kontak</Label>
                <Input
                  id="lab-kontak"
                  value={form.kontak}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, kontak: event.target.value }))
                  }
                  placeholder="Contoh: 0812-3456-7890"
                  data-ocid="lab.kontak.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-tanggal">Tanggal</Label>
                <Input
                  id="lab-tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal: event.target.value,
                    }))
                  }
                  data-ocid="lab.tanggal.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-status">Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      status: value as StatusPeminjamanLab,
                    }))
                  }
                >
                  <SelectTrigger id="lab-status" data-ocid="lab.status.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-jam-mulai">Jam Mulai</Label>
                <Input
                  id="lab-jam-mulai"
                  type="time"
                  value={form.jamMulai}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      jamMulai: event.target.value,
                    }))
                  }
                  data-ocid="lab.jam_mulai.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="lab-jam-selesai">Jam Selesai</Label>
                <Input
                  id="lab-jam-selesai"
                  type="time"
                  value={form.jamSelesai}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      jamSelesai: event.target.value,
                    }))
                  }
                  data-ocid="lab.jam_selesai.input"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="lab-keperluan">Keperluan</Label>
                <Textarea
                  id="lab-keperluan"
                  value={form.keperluan}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      keperluan: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Praktik pembongkaran mesin 4 tak"
                  rows={2}
                  data-ocid="lab.keperluan.textarea"
                />
              </div>
            </div>

            {formError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="lab.form.error_state"
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
                  data-ocid="lab.cancel_button"
                >
                  Batal
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={simpan}
                disabled={
                  !bisaSimpan || addLab.isPending || updateLab.isPending
                }
                data-ocid="lab.submit_button"
              >
                {addLab.isPending || updateLab.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {form.id === null ? "Tambah Peminjaman" : "Perbarui Peminjaman"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-subtle" data-ocid="lab.list.card">
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-2">
                <CalendarClock
                  className="size-4 text-accent"
                  aria-hidden="true"
                />
                <h2 className="font-display text-base font-bold tracking-tight">
                  Daftar Peminjaman Lab
                </h2>
              </div>
              <Select value={labFilter} onValueChange={setLabFilter}>
                <SelectTrigger
                  className="w-48"
                  aria-label="Filter laboratorium"
                  data-ocid="lab.filter.select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEMUA}>Semua Lab</SelectItem>
                  {LAB_OPTIONS.map((lab) => (
                    <SelectItem key={lab.value} value={lab.value}>
                      {lab.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {labQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="lab.loading_state"
              >
                {Array.from({ length: 4 }, (_, i) => `lab-skeleton-${i}`).map(
                  (id) => (
                    <Skeleton key={id} className="h-12 w-full" />
                  ),
                )}
              </div>
            ) : daftarLab.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="lab.empty_state"
              >
                <CalendarClock
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada peminjaman lab
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Tambahkan peminjaman lab pertama menggunakan formulir di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="lab.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lab</TableHead>
                      <TableHead>Peminjam</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead>Keperluan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarLab.map((item, index) => (
                      <TableRow
                        key={item.id.toString()}
                        data-ocid={`lab.row.${index + 1}`}
                      >
                        <TableCell>
                          <LabChip lab={item.lab} />
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.namaPeminjam}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.kelas}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTanggal(item.tanggal)}
                        </TableCell>
                        <TableCell className="tabular whitespace-nowrap text-muted-foreground">
                          {item.jamMulai}–{item.jamSelesai}
                        </TableCell>
                        <TableCell className="max-w-xs text-muted-foreground">
                          {item.keperluan}
                        </TableCell>
                        <TableCell>
                          <StatusLabBadge status={item.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => mulaiUbah(item)}
                              aria-label={`Ubah peminjaman ${item.namaPeminjam}`}
                              data-ocid={`lab.edit_button.${index + 1}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteLab.mutate(item.id)}
                              aria-label={`Hapus peminjaman ${item.namaPeminjam}`}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`lab.delete_button.${index + 1}`}
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
