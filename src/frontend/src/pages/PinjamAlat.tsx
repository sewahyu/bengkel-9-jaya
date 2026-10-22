import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useAjukanPeminjamanAlat, useListAlat } from "@/hooks/use-backend";
import { formatAngka, formatTanggal, todayIso } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Info,
  Send,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

interface FormState {
  alatId: string;
  namaPeminjam: string;
  kelas: string;
  jumlah: string;
  tanggalPinjam: string;
  keperluan: string;
  kontak: string;
}

interface Konfirmasi {
  namaAlat: string;
  namaPeminjam: string;
  kelas: string;
  jumlah: string;
  tanggalPinjam: string;
  keperluan: string;
  kontak: string;
}

const FORM_KOSONG: FormState = {
  alatId: "",
  namaPeminjam: "",
  kelas: "",
  jumlah: "1",
  tanggalPinjam: todayIso(),
  keperluan: "",
  kontak: "",
};

export function PinjamAlat() {
  const { data: alat, isLoading } = useListAlat();
  const ajukan = useAjukanPeminjamanAlat();

  const [form, setForm] = useState<FormState>(FORM_KOSONG);
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi | null>(null);

  const daftar = useMemo(
    () => (alat ?? []).filter((item) => Number(item.jumlahTersedia) > 0),
    [alat],
  );

  const terpilih = useMemo(
    () => daftar.find((item) => item.id.toString() === form.alatId) ?? null,
    [daftar, form.alatId],
  );

  const jumlahAngka = Number.parseInt(form.jumlah, 10);
  const jumlahValid =
    Number.isFinite(jumlahAngka) &&
    jumlahAngka >= 1 &&
    !!terpilih &&
    jumlahAngka <= Number(terpilih.jumlahTersedia);

  const wajibLengkap =
    form.alatId !== "" &&
    form.namaPeminjam.trim() !== "" &&
    form.kelas.trim() !== "" &&
    form.tanggalPinjam !== "" &&
    form.keperluan.trim() !== "" &&
    form.kontak.trim() !== "";

  const bisaKirim = wajibLengkap && jumlahValid && !ajukan.isPending;

  const ubah = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const kirim = () => {
    if (!terpilih || !bisaKirim) return;
    const data: Konfirmasi = {
      namaAlat: terpilih.nama,
      namaPeminjam: form.namaPeminjam.trim(),
      kelas: form.kelas.trim(),
      jumlah: formatAngka(jumlahAngka),
      tanggalPinjam: form.tanggalPinjam,
      keperluan: form.keperluan.trim(),
      kontak: form.kontak.trim(),
    };
    ajukan.mutate(
      {
        targetId: terpilih.id,
        namaPeminjam: data.namaPeminjam,
        kelas: data.kelas,
        jumlah: BigInt(jumlahAngka),
        tanggalPinjam: data.tanggalPinjam,
        keperluan: data.keperluan,
        kontak: data.kontak,
      },
      {
        onSuccess: () => {
          setKonfirmasi(data);
          setForm(FORM_KOSONG);
        },
      },
    );
  };

  return (
    <div data-ocid="pinjam_alat.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <Wrench className="size-4" aria-hidden="true" />
            Layanan Mandiri
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Pinjam Alat Bengkel
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Pilih alat yang tersedia, isi data peminjam, lalu kirim permintaan.
            Petugas UPJ akan meninjau permintaan Anda sebelum alat diserahkan.
            Layanan ini khusus inventaris Alat dan tidak memerlukan login.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          {konfirmasi ? (
            <KonfirmasiCard
              data={konfirmasi}
              onBaru={() => setKonfirmasi(null)}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <Card className="border-border shadow-subtle">
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ClipboardList
                      className="size-4 text-accent"
                      aria-hidden="true"
                    />
                    Formulir Permintaan Alat
                  </CardTitle>
                  <CardDescription>
                    Kolom bertanda bintang wajib diisi.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form
                    className="flex flex-col gap-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      kirim();
                    }}
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pinjam-alat">
                        Alat <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={form.alatId}
                        onValueChange={(value) => ubah({ alatId: value })}
                      >
                        <SelectTrigger
                          id="pinjam-alat"
                          className="w-full"
                          aria-label="Pilih alat"
                          data-ocid="pinjam_alat.alat_select"
                        >
                          <SelectValue placeholder="Pilih alat" />
                        </SelectTrigger>
                        <SelectContent>
                          {daftar.map((item) => (
                            <SelectItem
                              key={item.id.toString()}
                              value={item.id.toString()}
                            >
                              {item.nama} — {item.kategori} (
                              {formatAngka(item.jumlahTersedia)} tersedia)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {terpilih ? (
                        <p className="text-xs text-muted-foreground">
                          Tersedia{" "}
                          <span className="rule-numeral font-semibold text-accent">
                            {formatAngka(terpilih.jumlahTersedia)}
                          </span>{" "}
                          dari {formatAngka(terpilih.jumlahTotal)} unit.
                        </p>
                      ) : null}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="pinjam-nama">
                          Nama Peminjam{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pinjam-nama"
                          value={form.namaPeminjam}
                          onChange={(event) =>
                            ubah({ namaPeminjam: event.target.value })
                          }
                          placeholder="Nama lengkap"
                          autoComplete="name"
                          data-ocid="pinjam_alat.nama_input"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="pinjam-kelas">
                          Kelas / Unit{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pinjam-kelas"
                          value={form.kelas}
                          onChange={(event) =>
                            ubah({ kelas: event.target.value })
                          }
                          placeholder="Contoh: XI TSM 1"
                          data-ocid="pinjam_alat.kelas_input"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="pinjam-jumlah">
                          Jumlah <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pinjam-jumlah"
                          type="number"
                          min={1}
                          max={
                            terpilih
                              ? Number(terpilih.jumlahTersedia)
                              : undefined
                          }
                          value={form.jumlah}
                          onChange={(event) =>
                            ubah({ jumlah: event.target.value })
                          }
                          data-ocid="pinjam_alat.jumlah_input"
                        />
                        {terpilih && form.jumlah !== "" && !jumlahValid ? (
                          <p
                            className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                            data-ocid="pinjam_alat.jumlah_error"
                          >
                            <TriangleAlert
                              className="size-3.5 shrink-0"
                              aria-hidden="true"
                            />
                            Jumlah harus antara 1 dan{" "}
                            {formatAngka(terpilih.jumlahTersedia)} unit.
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="pinjam-tanggal">
                          Tanggal Pinjam{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="pinjam-tanggal"
                          type="date"
                          value={form.tanggalPinjam}
                          onChange={(event) =>
                            ubah({ tanggalPinjam: event.target.value })
                          }
                          data-ocid="pinjam_alat.tanggal_input"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pinjam-kontak">
                        Kontak / HP <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="pinjam-kontak"
                        value={form.kontak}
                        onChange={(event) =>
                          ubah({ kontak: event.target.value })
                        }
                        placeholder="Nomor HP atau WhatsApp"
                        inputMode="tel"
                        autoComplete="tel"
                        data-ocid="pinjam_alat.kontak_input"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="pinjam-keperluan">
                        Keperluan <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="pinjam-keperluan"
                        value={form.keperluan}
                        onChange={(event) =>
                          ubah({ keperluan: event.target.value })
                        }
                        placeholder="Jelaskan keperluan peminjaman alat"
                        rows={3}
                        data-ocid="pinjam_alat.keperluan_textarea"
                      />
                    </div>

                    {ajukan.isError ? (
                      <p
                        className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                        data-ocid="pinjam_alat.error_state"
                      >
                        <TriangleAlert
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        Permintaan gagal dikirim. Periksa kembali data Anda lalu
                        coba lagi.
                      </p>
                    ) : null}

                    <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        {bisaKirim
                          ? "Data sudah lengkap dan siap dikirim."
                          : "Lengkapi seluruh kolom wajib dan jumlah yang valid."}
                      </p>
                      <Button
                        type="submit"
                        disabled={!bisaKirim}
                        data-ocid="pinjam_alat.submit_button"
                      >
                        <Send className="size-4" aria-hidden="true" />
                        {ajukan.isPending ? "Mengirim…" : "Kirim Permintaan"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <aside className="flex flex-col gap-4">
                <Card className="border-border shadow-subtle">
                  <CardHeader className="border-b border-border">
                    <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Alat Tersedia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div
                        className="flex flex-col gap-3 p-4"
                        data-ocid="pinjam_alat.loading_state"
                      >
                        {Array.from(
                          { length: 4 },
                          (_, i) => `pinjam-alat-skeleton-${i}`,
                        ).map((id) => (
                          <Skeleton
                            key={id}
                            className="h-12 w-full rounded-md"
                          />
                        ))}
                      </div>
                    ) : daftar.length === 0 ? (
                      <div
                        className="flex flex-col items-center gap-2 px-4 py-10 text-center"
                        data-ocid="pinjam_alat.empty_state"
                      >
                        <Wrench
                          className="size-6 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium">
                          Belum ada alat tersedia
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Semua alat sedang dipinjam. Silakan coba lagi nanti.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-border">
                        {daftar.map((item, index) => (
                          <li
                            key={item.id.toString()}
                            className="flex items-center justify-between gap-3 px-4 py-3"
                            data-ocid={`pinjam_alat.item.${index + 1}`}
                          >
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate text-sm font-medium text-foreground">
                                {item.nama}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.kategori}
                              </span>
                            </div>
                            <Badge className="shrink-0 rounded-sm border-transparent bg-success/15 text-[11px] font-semibold uppercase tracking-wider text-success">
                              {formatAngka(item.jumlahTersedia)} tersedia
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
                  <Info
                    className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Permintaan berstatus{" "}
                    <span className="font-medium text-foreground">
                      Menunggu persetujuan admin
                    </span>{" "}
                    hingga petugas UPJ menyetujuinya. Stok alat baru berkurang
                    setelah permintaan disetujui.
                  </p>
                </div>

                <Button asChild variant="outline">
                  <Link
                    to="/alat"
                    search={{}}
                    data-ocid="pinjam_alat.lihat_daftar_link"
                  >
                    Lihat daftar lengkap alat
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              </aside>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function KonfirmasiCard({
  data,
  onBaru,
}: {
  data: Konfirmasi;
  onBaru: () => void;
}) {
  const baris: { label: string; value: string }[] = [
    { label: "Alat", value: data.namaAlat },
    { label: "Nama Peminjam", value: data.namaPeminjam },
    { label: "Kelas / Unit", value: data.kelas },
    { label: "Jumlah", value: `${data.jumlah} unit` },
    { label: "Tanggal Pinjam", value: formatTanggal(data.tanggalPinjam) },
    { label: "Kontak / HP", value: data.kontak },
    { label: "Keperluan", value: data.keperluan },
  ];

  return (
    <Card
      className="mx-auto max-w-2xl border-border shadow-subtle"
      data-ocid="pinjam_alat.success_state"
    >
      <CardContent className="flex flex-col gap-6 p-6 md:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Permintaan Terkirim
          </h2>
          <Badge className="rounded-sm border-transparent bg-warning/20 text-[11px] font-semibold uppercase tracking-wider text-warning">
            Menunggu persetujuan admin
          </Badge>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Permintaan peminjaman alat Anda telah dicatat. Petugas UPJ akan
            meninjau dan menghubungi Anda melalui kontak yang diberikan.
          </p>
        </div>

        <dl className="divide-y divide-border rounded-lg border border-border">
          {baris.map((item) => (
            <div
              key={item.label}
              className="flex items-start justify-between gap-4 px-4 py-3"
            >
              <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {item.label}
              </dt>
              <dd className="max-w-[60%] text-right text-sm font-medium text-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={onBaru}
            data-ocid="pinjam_alat.ajukan_lagi_button"
          >
            Ajukan permintaan lain
          </Button>
          <Button asChild variant="outline">
            <Link to="/alat" search={{}} data-ocid="pinjam_alat.kembali_link">
              Kembali ke daftar alat
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
