import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useAddBerita,
  useDeleteBerita,
  useGetFeedUrl,
  useListBerita,
  useSetFeedUrl,
  useUpdateBerita,
} from "@/hooks/use-backend";
import { INSTAGRAM_HANDLE } from "@/lib/constants";
import { formatTanggal, potongTeks, todayIso } from "@/lib/format";
import { SumberBerita } from "@/types";
import type { Berita } from "@/types";
import {
  AlertCircle,
  Check,
  Image as ImageIcon,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Rss,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "./AdminShell";

interface FormState {
  id: bigint | null;
  judul: string;
  ringkasan: string;
  gambarUrl: string;
  tautan: string;
  tanggal: string;
}

function formKosong(): FormState {
  return {
    id: null,
    judul: "",
    ringkasan: "",
    gambarUrl: "",
    tautan: "",
    tanggal: todayIso(),
  };
}

function SumberBadge({ sumber }: { sumber: SumberBerita }) {
  const instagram = sumber === SumberBerita.instagram;
  return (
    <span
      className={
        instagram
          ? "inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent"
          : "inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground"
      }
    >
      {instagram ? "Instagram" : "Manual"}
    </span>
  );
}

export function AdminBerita() {
  const [feedDraft, setFeedDraft] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedTersimpan, setFeedTersimpan] = useState(false);

  const [form, setForm] = useState<FormState>(formKosong);
  const [formError, setFormError] = useState<string | null>(null);

  const feedQuery = useGetFeedUrl();
  const beritaQuery = useListBerita();
  const setFeedUrl = useSetFeedUrl();
  const addBerita = useAddBerita();
  const updateBerita = useUpdateBerita();
  const deleteBerita = useDeleteBerita();

  const daftarBerita = beritaQuery.data ?? [];
  const feedTampil = feedDraft ?? feedQuery.data ?? "";

  const bisaSimpan =
    form.judul.trim() !== "" &&
    form.ringkasan.trim() !== "" &&
    form.tanggal !== "";

  function simpanFeed() {
    setFeedError(null);
    setFeedTersimpan(false);
    setFeedUrl.mutate(feedTampil.trim(), {
      onSuccess: () => {
        setFeedDraft(null);
        setFeedTersimpan(true);
      },
      onError: (error) => setFeedError(error.message),
    });
  }

  function simpanBerita() {
    if (!bisaSimpan) return;
    const payload = {
      judul: form.judul.trim(),
      ringkasan: form.ringkasan.trim(),
      gambarUrl: form.gambarUrl.trim(),
      tautan: form.tautan.trim(),
      tanggal: form.tanggal,
    };
    const id = form.id;
    setFormError(null);
    if (id === null) {
      addBerita.mutate(payload, {
        onSuccess: () => setForm(formKosong()),
        onError: (error) => setFormError(error.message),
      });
    } else {
      updateBerita.mutate(
        { id, ...payload },
        {
          onSuccess: () => setForm(formKosong()),
          onError: (error) => setFormError(error.message),
        },
      );
    }
  }

  function mulaiUbah(berita: Berita) {
    setForm({
      id: berita.id,
      judul: berita.judul,
      ringkasan: berita.ringkasan,
      gambarUrl: berita.gambarUrl,
      tautan: berita.tautan,
      tanggal: berita.tanggal,
    });
    setFormError(null);
  }

  return (
    <AdminShell
      title="Berita"
      description={`Kelola berita manual dan URL feed Instagram ${INSTAGRAM_HANDLE} untuk beranda.`}
    >
      <div className="flex flex-col gap-8">
        <Card
          className="border-border shadow-subtle"
          data-ocid="berita.feed.card"
        >
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Rss className="size-4 text-accent" aria-hidden="true" />
              <h2 className="font-display text-base font-bold tracking-tight">
                URL Feed Instagram
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Tempel URL feed publik (misalnya dari rss.app) untuk menampilkan
              unggahan Instagram {INSTAGRAM_HANDLE} di beranda. Berita manual
              tetap dipakai sebagai cadangan bila feed kosong.
            </p>

            <div className="flex flex-col gap-2">
              <Label htmlFor="berita-feed-url">URL Feed</Label>
              <Input
                id="berita-feed-url"
                value={feedTampil}
                onChange={(event) => {
                  setFeedDraft(event.target.value);
                  setFeedTersimpan(false);
                }}
                placeholder="https://rss.app/feeds/xxxxxxxx.xml"
                data-ocid="berita.feed_url.input"
              />
            </div>

            {feedError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="berita.feed.error_state"
              >
                <AlertCircle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                {feedError}
              </p>
            ) : null}

            {feedTersimpan ? (
              <p
                className="flex items-center gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success"
                data-ocid="berita.feed.success_state"
              >
                <Check className="size-4 shrink-0" aria-hidden="true" />
                URL feed berhasil disimpan.
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={simpanFeed}
                disabled={setFeedUrl.isPending}
                data-ocid="berita.feed.submit_button"
              >
                {setFeedUrl.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Rss className="size-4" aria-hidden="true" />
                )}
                Simpan URL Feed
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="berita.form.card"
        >
          <CardContent className="flex flex-col gap-5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              {form.id === null ? (
                <Plus className="size-4 text-accent" aria-hidden="true" />
              ) : (
                <Pencil className="size-4 text-accent" aria-hidden="true" />
              )}
              <h2 className="font-display text-base font-bold tracking-tight">
                {form.id === null ? "Tambah Berita" : "Ubah Berita"}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="berita-judul">Judul</Label>
                <Input
                  id="berita-judul"
                  value={form.judul}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, judul: event.target.value }))
                  }
                  placeholder="Contoh: Bengkel 9 Jaya Juara LKS TSM"
                  data-ocid="berita.judul.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="berita-tanggal">Tanggal</Label>
                <Input
                  id="berita-tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      tanggal: event.target.value,
                    }))
                  }
                  data-ocid="berita.tanggal.input"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="berita-ringkasan">Ringkasan</Label>
                <Textarea
                  id="berita-ringkasan"
                  value={form.ringkasan}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      ringkasan: event.target.value,
                    }))
                  }
                  placeholder="Ringkasan singkat isi berita"
                  rows={3}
                  data-ocid="berita.ringkasan.textarea"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="berita-gambar">URL Gambar</Label>
                <Input
                  id="berita-gambar"
                  value={form.gambarUrl}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      gambarUrl: event.target.value,
                    }))
                  }
                  placeholder="https://.../gambar.jpg"
                  data-ocid="berita.gambar.input"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="berita-tautan">Tautan</Label>
                <Input
                  id="berita-tautan"
                  value={form.tautan}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tautan: event.target.value }))
                  }
                  placeholder="https://www.instagram.com/p/..."
                  data-ocid="berita.tautan.input"
                />
              </div>
            </div>

            {formError ? (
              <p
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                data-ocid="berita.form.error_state"
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
                  data-ocid="berita.cancel_button"
                >
                  Batal
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={simpanBerita}
                disabled={
                  !bisaSimpan || addBerita.isPending || updateBerita.isPending
                }
                data-ocid="berita.submit_button"
              >
                {addBerita.isPending || updateBerita.isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Plus className="size-4" aria-hidden="true" />
                )}
                {form.id === null ? "Tambah Berita" : "Perbarui Berita"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-border shadow-subtle"
          data-ocid="berita.list.card"
        >
          <CardContent className="flex flex-col gap-4 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <Newspaper className="size-4 text-accent" aria-hidden="true" />
              <h2 className="font-display text-base font-bold tracking-tight">
                Daftar Berita
              </h2>
            </div>

            {beritaQuery.isLoading ? (
              <div
                className="flex flex-col gap-2"
                data-ocid="berita.loading_state"
              >
                {Array.from(
                  { length: 4 },
                  (_, i) => `berita-skeleton-${i}`,
                ).map((id) => (
                  <Skeleton key={id} className="h-12 w-full" />
                ))}
              </div>
            ) : daftarBerita.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border py-12 text-center"
                data-ocid="berita.empty_state"
              >
                <Newspaper
                  className="size-8 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="font-display text-sm font-semibold">
                  Belum ada berita
                </p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Tambahkan berita pertama menggunakan formulir di atas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="berita.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gambar</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Ringkasan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Sumber</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daftarBerita.map((berita, index) => (
                      <TableRow
                        key={berita.id.toString()}
                        data-ocid={`berita.row.${index + 1}`}
                      >
                        <TableCell>
                          {berita.gambarUrl ? (
                            <img
                              src={berita.gambarUrl}
                              alt=""
                              className="size-10 rounded-md border border-border object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="flex size-10 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                              <ImageIcon
                                className="size-4"
                                aria-hidden="true"
                              />
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs font-medium">
                          {berita.judul}
                        </TableCell>
                        <TableCell className="max-w-sm text-muted-foreground">
                          {potongTeks(berita.ringkasan, 70)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatTanggal(berita.tanggal)}
                        </TableCell>
                        <TableCell>
                          <SumberBadge sumber={berita.sumber} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => mulaiUbah(berita)}
                              aria-label={`Ubah berita ${berita.judul}`}
                              data-ocid={`berita.edit_button.${index + 1}`}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteBerita.mutate(berita.id)}
                              aria-label={`Hapus berita ${berita.judul}`}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`berita.delete_button.${index + 1}`}
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
