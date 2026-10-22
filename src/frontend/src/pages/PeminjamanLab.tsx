import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAjukanPeminjamanLab,
  useListPeminjamanLab,
} from "@/hooks/use-backend";
import { LAB_OPTIONS, LAB_STYLE, STATUS_LABEL } from "@/lib/constants";
import { formatTanggal, todayIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lab, PeminjamanLab as PeminjamanLabRecord } from "@/types";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  FlaskConical,
  Info,
  Send,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

interface FormState {
  lab: Lab;
  namaPeminjam: string;
  kelas: string;
  kontak: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  keperluan: string;
}

const FORM_AWAL: FormState = {
  lab: LAB_OPTIONS[0].value,
  namaPeminjam: "",
  kelas: "",
  kontak: "",
  tanggal: "",
  jamMulai: "",
  jamSelesai: "",
  keperluan: "",
};

type FilterLab = "semua" | Lab;

const FILTER_OPTIONS: { value: FilterLab; label: string }[] = [
  { value: "semua", label: "Semua Lab" },
  ...LAB_OPTIONS.map((option) => ({
    value: option.value as FilterLab,
    label: option.label,
  })),
];

function gayaLab(lab: string) {
  return LAB_STYLE[lab] ?? LAB_STYLE[LAB_OPTIONS[0].value];
}

function labelStatus(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function PeminjamanLab() {
  const [form, setForm] = useState<FormState>(FORM_AWAL);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [sukses, setSukses] = useState<FormState | null>(null);
  const [filter, setFilter] = useState<FilterLab>("semua");

  const ajukan = useAjukanPeminjamanLab();
  const { data: daftar, isLoading } = useListPeminjamanLab(
    filter === "semua" ? null : filter,
  );

  const terkelompok = useMemo(() => {
    const map = new Map<string, PeminjamanLabRecord[]>();
    for (const item of daftar ?? []) {
      const list = map.get(item.lab) ?? [];
      list.push(item);
      map.set(item.lab, list);
    }
    return LAB_OPTIONS.map((option) => ({
      lab: option.value,
      items: (map.get(option.value) ?? []).sort((a, b) =>
        a.tanggal === b.tanggal
          ? a.jamMulai.localeCompare(b.jamMulai)
          : a.tanggal.localeCompare(b.tanggal),
      ),
    })).filter((group) => group.items.length > 0);
  }, [daftar]);

  const totalTampil = (daftar ?? []).length;

  function ubah<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validasi(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.lab) next.lab = "Pilih laboratorium.";
    if (!form.namaPeminjam.trim())
      next.namaPeminjam = "Nama peminjam wajib diisi.";
    if (!form.kelas.trim()) next.kelas = "Kelas atau unit wajib diisi.";
    if (!form.kontak.trim()) next.kontak = "Kontak wajib diisi.";
    if (!form.tanggal) next.tanggal = "Tanggal peminjaman wajib diisi.";
    if (!form.jamMulai) next.jamMulai = "Jam mulai wajib diisi.";
    if (!form.jamSelesai) next.jamSelesai = "Jam selesai wajib diisi.";
    if (form.jamMulai && form.jamSelesai && form.jamSelesai <= form.jamMulai) {
      next.jamSelesai = "Jam selesai harus setelah jam mulai.";
    }
    if (!form.keperluan.trim()) next.keperluan = "Keperluan wajib diisi.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function kirim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validasi()) return;
    const data = { ...form };
    ajukan.mutate(data, {
      onSuccess: () => {
        setSukses(data);
        setForm(FORM_AWAL);
        setErrors({});
      },
    });
  }

  return (
    <div data-ocid="peminjaman_lab.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <FlaskConical className="size-4" aria-hidden="true" />
            Laboratorium TSM
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Peminjaman Lab
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Ajukan peminjaman Lab 1 Chasis, Lab 2 Mesin, atau Lab 3 Kelistrikan
            tanpa perlu masuk. Isi data di bawah, lalu lihat jadwal yang sudah
            terisi agar tidak bertabrakan.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:px-6 md:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          {/* Formulir pengajuan */}
          <div className="flex flex-col gap-6">
            {sukses ? (
              <Card
                className="border-success/40 shadow-subtle"
                data-ocid="peminjaman_lab.success_state"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-success/15 text-success">
                      <CheckCircle2 className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold tracking-tight">
                        Pengajuan terkirim
                      </h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Status:{" "}
                        <span className="font-semibold text-foreground">
                          Menunggu persetujuan admin
                        </span>
                      </p>
                    </div>
                  </div>
                  <dl className="grid gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm sm:grid-cols-2">
                    <div className="flex flex-col">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Laboratorium
                      </dt>
                      <dd className="font-medium">{sukses.lab}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Nama peminjam
                      </dt>
                      <dd className="font-medium">{sukses.namaPeminjam}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Kelas / Unit
                      </dt>
                      <dd className="font-medium">{sukses.kelas}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Kontak
                      </dt>
                      <dd className="font-medium">{sukses.kontak}</dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Tanggal
                      </dt>
                      <dd className="font-medium">
                        {formatTanggal(sukses.tanggal)}
                      </dd>
                    </div>
                    <div className="flex flex-col">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Waktu
                      </dt>
                      <dd className="font-medium">
                        {sukses.jamMulai}–{sukses.jamSelesai}
                      </dd>
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        Keperluan
                      </dt>
                      <dd className="font-medium">{sukses.keperluan}</dd>
                    </div>
                  </dl>
                  <Button
                    type="button"
                    variant="outline"
                    className="self-start"
                    onClick={() => setSukses(null)}
                    data-ocid="peminjaman_lab.secondary_button"
                  >
                    Ajukan peminjaman lain
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border shadow-subtle">
                <div className="flex items-center gap-3 border-b border-border bg-primary px-5 py-3">
                  <Send
                    className="size-4 text-primary-foreground"
                    aria-hidden="true"
                  />
                  <h2 className="font-display text-base font-bold tracking-tight text-primary-foreground">
                    Formulir Peminjaman
                  </h2>
                </div>
                <CardContent className="p-5 md:p-6">
                  <form
                    onSubmit={kirim}
                    noValidate
                    className="flex flex-col gap-5"
                    data-ocid="peminjaman_lab.form"
                  >
                    <fieldset className="flex flex-col gap-2">
                      <legend className="mb-1 text-sm font-medium">
                        Pilih laboratorium
                      </legend>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {LAB_OPTIONS.map((option) => {
                          const style = gayaLab(option.value);
                          const aktif = form.lab === option.value;
                          return (
                            <label
                              key={option.value}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-smooth",
                                aktif
                                  ? cn("border-transparent", style.chip)
                                  : "border-input bg-card text-muted-foreground hover:border-foreground/30",
                              )}
                            >
                              <input
                                type="radio"
                                name="lab"
                                value={option.value}
                                checked={aktif}
                                onChange={() => ubah("lab", option.value)}
                                className="sr-only"
                                data-ocid={`peminjaman_lab.radio.${LAB_OPTIONS.indexOf(option) + 1}`}
                              />
                              <span
                                className={cn(
                                  "size-2.5 shrink-0 rounded-full",
                                  style.dot,
                                )}
                                aria-hidden="true"
                              />
                              {option.label}
                            </label>
                          );
                        })}
                      </div>
                      {errors.lab ? (
                        <p
                          className="text-xs font-medium text-destructive"
                          data-ocid="peminjaman_lab.error_state"
                        >
                          {errors.lab}
                        </p>
                      ) : null}
                    </fieldset>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pl-nama">Nama peminjam</Label>
                        <Input
                          id="pl-nama"
                          value={form.namaPeminjam}
                          onChange={(e) => ubah("namaPeminjam", e.target.value)}
                          placeholder="Nama lengkap"
                          aria-invalid={Boolean(errors.namaPeminjam)}
                          data-ocid="peminjaman_lab.input"
                        />
                        {errors.namaPeminjam ? (
                          <p className="text-xs font-medium text-destructive">
                            {errors.namaPeminjam}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pl-kelas">Kelas / Unit</Label>
                        <Input
                          id="pl-kelas"
                          value={form.kelas}
                          onChange={(e) => ubah("kelas", e.target.value)}
                          placeholder="Contoh: XI TSM 1"
                          aria-invalid={Boolean(errors.kelas)}
                          data-ocid="peminjaman_lab.input"
                        />
                        {errors.kelas ? (
                          <p className="text-xs font-medium text-destructive">
                            {errors.kelas}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pl-kontak">Kontak</Label>
                      <Input
                        id="pl-kontak"
                        value={form.kontak}
                        onChange={(e) => ubah("kontak", e.target.value)}
                        placeholder="Nomor HP atau email"
                        aria-invalid={Boolean(errors.kontak)}
                        data-ocid="peminjaman_lab.input"
                      />
                      {errors.kontak ? (
                        <p className="text-xs font-medium text-destructive">
                          {errors.kontak}
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pl-tanggal">Tanggal</Label>
                        <Input
                          id="pl-tanggal"
                          type="date"
                          min={todayIso()}
                          value={form.tanggal}
                          onChange={(e) => ubah("tanggal", e.target.value)}
                          aria-invalid={Boolean(errors.tanggal)}
                          data-ocid="peminjaman_lab.input"
                        />
                        {errors.tanggal ? (
                          <p className="text-xs font-medium text-destructive">
                            {errors.tanggal}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pl-mulai">Jam mulai</Label>
                        <Input
                          id="pl-mulai"
                          type="time"
                          value={form.jamMulai}
                          onChange={(e) => ubah("jamMulai", e.target.value)}
                          aria-invalid={Boolean(errors.jamMulai)}
                          data-ocid="peminjaman_lab.input"
                        />
                        {errors.jamMulai ? (
                          <p className="text-xs font-medium text-destructive">
                            {errors.jamMulai}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="pl-selesai">Jam selesai</Label>
                        <Input
                          id="pl-selesai"
                          type="time"
                          value={form.jamSelesai}
                          onChange={(e) => ubah("jamSelesai", e.target.value)}
                          aria-invalid={Boolean(errors.jamSelesai)}
                          data-ocid="peminjaman_lab.input"
                        />
                        {errors.jamSelesai ? (
                          <p className="text-xs font-medium text-destructive">
                            {errors.jamSelesai}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pl-keperluan">Keperluan</Label>
                      <Textarea
                        id="pl-keperluan"
                        value={form.keperluan}
                        onChange={(e) => ubah("keperluan", e.target.value)}
                        placeholder="Jelaskan kegiatan praktik yang akan dilakukan"
                        rows={3}
                        aria-invalid={Boolean(errors.keperluan)}
                        data-ocid="peminjaman_lab.textarea"
                      />
                      {errors.keperluan ? (
                        <p className="text-xs font-medium text-destructive">
                          {errors.keperluan}
                        </p>
                      ) : null}
                    </div>

                    {ajukan.isError ? (
                      <p
                        className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
                        data-ocid="peminjaman_lab.error_state"
                      >
                        Pengajuan gagal dikirim. Periksa kembali data lalu coba
                        lagi.
                      </p>
                    ) : null}

                    <Button
                      type="submit"
                      disabled={ajukan.isPending}
                      className="self-start"
                      data-ocid="peminjaman_lab.submit_button"
                    >
                      <Send className="size-4" aria-hidden="true" />
                      {ajukan.isPending ? "Mengirim…" : "Kirim pengajuan"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Jadwal terisi */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold tracking-tight">
                  Jadwal Lab Terisi
                </h2>
                <span className="rule-numeral text-sm text-muted-foreground">
                  {totalTampil} pengajuan
                </span>
              </div>
              <fieldset
                className="flex flex-wrap gap-2"
                aria-label="Filter laboratorium"
              >
                {FILTER_OPTIONS.map((option) => {
                  const aktif = filter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFilter(option.value)}
                      aria-pressed={aktif}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-smooth",
                        aktif
                          ? "border-transparent bg-primary text-primary-foreground"
                          : "border-input bg-card text-muted-foreground hover:border-foreground/30",
                      )}
                      data-ocid={`peminjaman_lab.filter.tab.${FILTER_OPTIONS.indexOf(option) + 1}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </fieldset>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
              <Info
                className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Daftar ini hanya untuk melihat slot yang sudah diajukan. Setiap
                pengajuan tetap menunggu persetujuan admin sebelum dipakai.
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from(
                  { length: 3 },
                  (_, i) => `peminjaman-lab-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-40 w-full rounded-lg" />
                ))}
              </div>
            ) : terkelompok.length === 0 ? (
              <Card
                className="border-border shadow-subtle"
                data-ocid="peminjaman_lab.empty_state"
              >
                <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <CalendarDays className="size-6" aria-hidden="true" />
                  </span>
                  <p className="font-display text-lg font-semibold">
                    Belum ada pengajuan
                  </p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {filter === "semua"
                      ? "Jadwal akan tampil setelah ada pengajuan peminjaman lab."
                      : "Belum ada pengajuan untuk lab ini. Pilih lab lain atau ajukan sekarang."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-5">
                {terkelompok.map((group, groupIndex) => {
                  const style = gayaLab(group.lab);
                  return (
                    <Card
                      key={group.lab}
                      className="overflow-hidden border-border shadow-subtle"
                      data-ocid={`peminjaman_lab.group.${groupIndex + 1}`}
                    >
                      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/60 px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("size-2.5 rounded-full", style.dot)}
                            aria-hidden="true"
                          />
                          <h3
                            className={cn(
                              "font-display text-sm font-bold tracking-tight",
                              style.text,
                            )}
                          >
                            {group.lab}
                          </h3>
                        </div>
                        <span className="rule-numeral text-xs font-semibold text-muted-foreground">
                          {group.items.length} slot
                        </span>
                      </div>
                      <CardContent className="p-0">
                        <ul>
                          {group.items.map((item, index) => (
                            <li
                              key={item.id.toString()}
                              className="flex flex-col gap-2 border-b border-border px-5 py-4 last:border-b-0 odd:bg-card even:bg-muted/40"
                              data-ocid={`peminjaman_lab.item.${groupIndex + 1}.${index + 1}`}
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="flex items-center gap-2 font-medium text-foreground">
                                  <UserRound
                                    className="size-4 text-muted-foreground"
                                    aria-hidden="true"
                                  />
                                  {item.namaPeminjam}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="rounded-sm text-[11px] font-semibold uppercase tracking-wider"
                                >
                                  {labelStatus(item.status)}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                  {formatTanggal(item.tanggal)}
                                </span>
                                <span className="flex items-center gap-1.5 font-mono text-xs">
                                  <Clock
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                  {item.jamMulai}–{item.jamSelesai}
                                </span>
                                <span className="text-xs">{item.kelas}</span>
                              </div>
                              {item.keperluan ? (
                                <p className="text-sm text-muted-foreground">
                                  {item.keperluan}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
