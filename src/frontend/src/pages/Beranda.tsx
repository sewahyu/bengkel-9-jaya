import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetFeedUrl,
  useListAlat,
  useListBerita,
  useListPeminjamanLab,
  useListSparepart,
  useListTrainer,
} from "@/hooks/use-backend";
import {
  APP_NAME,
  GALERI_BERANDA,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  JURUSAN_NAME,
  LAB_STYLE,
  SEKOLAH_NAME,
  STRUKTUR_FOTO,
  STRUKTUR_ORGANISASI,
  TATA_TERTIB,
} from "@/lib/constants";
import {
  buatSelKalender,
  formatAngka,
  formatTanggal,
  namaBulan,
  potongTeks,
  statusKetersediaan,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Berita, PeminjamanLab } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Instagram,
  Network,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STATUS_BADGE: Record<string, string> = {
  tersedia: "bg-success/15 text-success",
  menipis: "bg-warning/20 text-warning",
  habis: "bg-destructive/15 text-destructive",
};

const STATUS_TEXT: Record<string, string> = {
  tersedia: "Tersedia",
  menipis: "Menipis",
  habis: "Habis",
};

const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const LAB_FALLBACK = {
  chip: "bg-muted text-muted-foreground",
  dot: "bg-muted-foreground",
  text: "text-muted-foreground",
};

function gayaLab(lab: string) {
  return LAB_STYLE[lab] ?? LAB_FALLBACK;
}

function StatCard({
  label,
  value,
  hint,
  icon,
  to,
  ocid,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  to: string;
  ocid: string;
}) {
  return (
    <Link
      to={to}
      data-ocid={ocid}
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-muted text-primary transition-smooth group-hover:bg-accent group-hover:text-accent-foreground">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="rule-numeral text-2xl font-bold text-foreground">
          {value}
        </span>
        <span className="truncate text-xs text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Kalender jadwal lab                                                 */
/* ------------------------------------------------------------------ */

function KalenderLab({ peminjaman }: { peminjaman: PeminjamanLab[] }) {
  const hariIni = useMemo(() => new Date(), []);
  const [tahun, setTahun] = useState(hariIni.getFullYear());
  const [bulan, setBulan] = useState(hariIni.getMonth());
  const [tanggalPilih, setTanggalPilih] = useState<string | null>(null);

  const isoHariIni = useMemo(() => {
    const m = (hariIni.getMonth() + 1).toString().padStart(2, "0");
    const d = hariIni.getDate().toString().padStart(2, "0");
    return `${hariIni.getFullYear()}-${m}-${d}`;
  }, [hariIni]);

  const perTanggal = useMemo(() => {
    const peta = new Map<string, PeminjamanLab[]>();
    for (const item of peminjaman) {
      const kunci = item.tanggal.slice(0, 10);
      const daftar = peta.get(kunci);
      if (daftar) daftar.push(item);
      else peta.set(kunci, [item]);
    }
    return peta;
  }, [peminjaman]);

  const sel = useMemo(() => buatSelKalender(tahun, bulan), [tahun, bulan]);

  const gantiBulan = (delta: number) => {
    const berikut = new Date(tahun, bulan + delta, 1);
    setTahun(berikut.getFullYear());
    setBulan(berikut.getMonth());
    setTanggalPilih(null);
  };

  const keHariIni = () => {
    setTahun(hariIni.getFullYear());
    setBulan(hariIni.getMonth());
    setTanggalPilih(isoHariIni);
  };

  const detail = tanggalPilih ? (perTanggal.get(tanggalPilih) ?? []) : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Card className="overflow-hidden border-border shadow-subtle">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-accent" aria-hidden="true" />
            <CardTitle className="font-display text-base">
              {namaBulan(bulan)} {tahun}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => gantiBulan(-1)}
              aria-label="Bulan sebelumnya"
              data-ocid="beranda.kalender.pagination_prev"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={keHariIni}
              data-ocid="beranda.kalender.today_button"
            >
              Hari Ini
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => gantiBulan(1)}
              aria-label="Bulan berikutnya"
              data-ocid="beranda.kalender.pagination_next"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="calendar-grid border-b border-border bg-muted/60">
            {HARI_SINGKAT.map((hari) => (
              <div
                key={hari}
                className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {hari}
              </div>
            ))}
          </div>
          <div className="calendar-grid">
            {sel.map((selItem) => {
              const daftar = perTanggal.get(selItem.iso) ?? [];
              const terpilih = tanggalPilih === selItem.iso;
              const iniHariIni = selItem.iso === isoHariIni;
              return (
                <button
                  key={selItem.iso}
                  type="button"
                  onClick={() => setTanggalPilih(selItem.iso)}
                  aria-label={`${selItem.hari} ${namaBulan(selItem.bulan)} ${selItem.tahun}, ${daftar.length} peminjaman`}
                  aria-pressed={terpilih}
                  data-ocid={`beranda.kalender.day.${selItem.iso}`}
                  className={cn(
                    "calendar-cell relative flex min-h-[5.5rem] flex-col gap-1 p-1.5 text-left transition-smooth",
                    selItem.dalamBulan
                      ? "bg-calendar-cell"
                      : "bg-calendar-cell-muted",
                    terpilih && "ring-2 ring-inset ring-accent",
                    "hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  )}
                >
                  <span
                    className={cn(
                      "rule-numeral inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                      iniHariIni
                        ? "calendar-today text-accent"
                        : selItem.dalamBulan
                          ? "text-foreground"
                          : "text-muted-foreground/60",
                    )}
                  >
                    {selItem.hari}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    {daftar.slice(0, 2).map((item) => (
                      <span
                        key={item.id.toString()}
                        className={cn("event-chip", gayaLab(item.lab).chip)}
                      >
                        {item.lab}
                      </span>
                    ))}
                    {daftar.length > 2 ? (
                      <span className="event-chip bg-muted text-muted-foreground">
                        +{daftar.length - 2} lagi
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-border bg-card px-4 py-3">
            {Object.entries(LAB_STYLE).map(([lab, gaya]) => (
              <span
                key={lab}
                className="inline-flex items-center gap-2 text-xs text-muted-foreground"
              >
                <span
                  className={cn("size-2.5 rounded-full", gaya.dot)}
                  aria-hidden="true"
                />
                {lab}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card
        className="border-border shadow-subtle"
        data-ocid="beranda.kalender.detail_panel"
      >
        <CardHeader className="border-b border-border bg-card">
          <CardTitle className="font-display text-base">
            {tanggalPilih
              ? `Jadwal ${formatTanggal(tanggalPilih)}`
              : "Detail Peminjaman Lab"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {!tanggalPilih ? (
            <div
              className="flex flex-col items-center gap-2 px-2 py-10 text-center"
              data-ocid="beranda.kalender.detail.empty_state"
            >
              <CalendarDays
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                Pilih tanggal pada kalender untuk melihat jadwal peminjaman lab
                hari itu.
              </p>
            </div>
          ) : detail.length === 0 ? (
            <div
              className="flex flex-col items-center gap-2 px-2 py-10 text-center"
              data-ocid="beranda.kalender.detail.empty_state"
            >
              <CalendarDays
                className="size-8 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="font-display text-sm font-semibold">
                Tidak ada peminjaman
              </p>
              <p className="text-sm text-muted-foreground">
                Belum ada lab yang dipinjam pada tanggal ini.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {detail.map((item, index) => (
                <li
                  key={item.id.toString()}
                  data-ocid={`beranda.kalender.detail.item.${index + 1}`}
                  className="rounded-md border border-border bg-muted/40 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[11px] font-semibold",
                        gayaLab(item.lab).chip,
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          gayaLab(item.lab).dot,
                        )}
                        aria-hidden="true"
                      />
                      {item.lab}
                    </span>
                    <span className="rule-numeral text-xs font-semibold text-foreground">
                      {item.jamMulai}–{item.jamSelesai}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">
                    {item.namaPeminjam}
                    {item.kelas ? (
                      <span className="text-muted-foreground">
                        {" "}
                        · {item.kelas}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {item.keperluan}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Struktur organisasi                                                 */
/* ------------------------------------------------------------------ */

function StrukturOrganisasi() {
  const tingkat = useMemo(() => {
    const peta = new Map<number, typeof STRUKTUR_ORGANISASI>();
    for (const node of STRUKTUR_ORGANISASI) {
      const daftar = peta.get(node.tingkat);
      if (daftar) daftar.push(node);
      else peta.set(node.tingkat, [node]);
    }
    return [...peta.entries()].sort((a, b) => a[0] - b[0]);
  }, []);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div
        className="flex flex-col items-center gap-0"
        data-ocid="beranda.struktur.chart"
      >
        {tingkat.map(([level, nodes], levelIndex) => (
          <div key={level} className="flex w-full flex-col items-center">
            {levelIndex > 0 ? (
              <span
                className="connector-line connector-line-v h-6"
                aria-hidden="true"
              />
            ) : null}
            <div className="flex w-full flex-wrap items-stretch justify-center gap-3">
              {nodes.map((node) => (
                <div
                  key={node.jabatan}
                  className="org-node w-full max-w-[15rem] shadow-node sm:w-auto sm:min-w-[11rem]"
                  data-ocid={`beranda.struktur.node.${node.tingkat}`}
                >
                  <div className="org-node-head">{node.jabatan}</div>
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold leading-snug text-foreground">
                      {node.nama}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <figure className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
        <img
          src={STRUKTUR_FOTO}
          alt="Bagan resmi struktur organisasi Kompetensi Keahlian Teknik Sepeda Motor SMK Negeri 9 Malang"
          width={1024}
          height={1448}
          loading="lazy"
          className="h-auto w-full object-contain"
          data-ocid="beranda.struktur.image"
        />
        <figcaption className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Bagan resmi struktur organisasi Kompetensi Keahlian Teknik Sepeda
          Motor {SEKOLAH_NAME}.
        </figcaption>
      </figure>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Berita terkini                                                      */
/* ------------------------------------------------------------------ */

interface ItemBerita {
  kunci: string;
  judul: string;
  ringkasan: string;
  gambarUrl: string;
  tautan: string;
  tanggal: string;
}

function ambilTeks(blok: string | undefined): string {
  if (!blok) return "";
  return blok
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function ambilGambar(item: Record<string, unknown>): string {
  const langsung = item.image ?? item.image_url ?? item.thumbnail;
  if (typeof langsung === "string" && langsung) return langsung;
  const enclosure = item.enclosure;
  if (enclosure && typeof enclosure === "object") {
    const url =
      (enclosure as { link?: unknown; url?: unknown }).link ??
      (enclosure as { url?: unknown }).url;
    if (typeof url === "string") return url;
  }
  const konten = item.content_html ?? item.content ?? item.description;
  if (typeof konten === "string") {
    const cocok = konten.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (cocok?.[1]) return cocok[1];
  }
  return "";
}

function normalkanFeed(data: unknown): ItemBerita[] {
  let daftar: unknown[] = [];
  if (Array.isArray(data)) {
    daftar = data;
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const kandidat = obj.items ?? obj.entries ?? obj.data ?? obj.posts;
    if (Array.isArray(kandidat)) daftar = kandidat;
  }
  return daftar
    .filter(
      (item): item is Record<string, unknown> =>
        !!item && typeof item === "object",
    )
    .map((item, index) => {
      const judul =
        (typeof item.title === "string" && item.title) ||
        ambilTeks(
          typeof item.description === "string" ? item.description : "",
        ) ||
        "Postingan Instagram";
      const ringkasan = potongTeks(
        ambilTeks(
          typeof item.description === "string"
            ? item.description
            : typeof item.content_html === "string"
              ? item.content_html
              : typeof item.summary === "string"
                ? item.summary
                : "",
        ),
        140,
      );
      const tautan =
        (typeof item.link === "string" && item.link) ||
        (typeof item.url === "string" && item.url) ||
        INSTAGRAM_URL;
      const tanggal =
        (typeof item.date_published === "string" && item.date_published) ||
        (typeof item.pubDate === "string" && item.pubDate) ||
        (typeof item.date === "string" && item.date) ||
        "";
      return {
        kunci: `${tautan}-${index}`,
        judul,
        ringkasan,
        gambarUrl: ambilGambar(item),
        tautan,
        tanggal,
      };
    });
}

function dariBeritaManual(berita: Berita[]): ItemBerita[] {
  return berita.map((item) => ({
    kunci: item.id.toString(),
    judul: item.judul,
    ringkasan: item.ringkasan,
    gambarUrl: item.gambarUrl,
    tautan: item.tautan || INSTAGRAM_URL,
    tanggal: item.tanggal,
  }));
}

function KartuBerita({ item, index }: { item: ItemBerita; index: number }) {
  return (
    <a
      href={item.tautan}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid={`beranda.berita.item.${index + 1}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {item.gambarUrl ? (
          <img
            src={item.gambarUrl}
            alt={item.judul}
            loading="lazy"
            className="news-thumb transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Instagram
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-accent">
          <Instagram className="size-3.5" aria-hidden="true" />
          Instagram
        </span>
        <h3 className="mt-2 line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground">
          {item.judul}
        </h3>
        {item.ringkasan ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {item.ringkasan}
          </p>
        ) : null}
        <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-[11px] text-muted-foreground">
          <span>{item.tanggal ? formatTanggal(item.tanggal) : ""}</span>
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}

function BeritaTerkini() {
  const { data: feedUrl } = useGetFeedUrl();
  const { data: beritaManual, isLoading: beritaLoading } = useListBerita();
  const [itemFeed, setItemFeed] = useState<ItemBerita[]>([]);
  const [memuatFeed, setMemuatFeed] = useState(false);

  const url = (feedUrl ?? "").trim();

  useEffect(() => {
    if (!url) {
      setItemFeed([]);
      setMemuatFeed(false);
      return;
    }
    let aktif = true;
    const controller = new AbortController();
    setMemuatFeed(true);
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Feed gagal dimuat");
        return res.json();
      })
      .then((data) => {
        if (aktif) setItemFeed(normalkanFeed(data));
      })
      .catch(() => {
        if (aktif) setItemFeed([]);
      })
      .finally(() => {
        if (aktif) setMemuatFeed(false);
      });
    return () => {
      aktif = false;
      controller.abort();
    };
  }, [url]);

  const manual = useMemo(
    () => dariBeritaManual(beritaManual ?? []),
    [beritaManual],
  );
  const pakaiFeed = itemFeed.length > 0;
  const item = (pakaiFeed ? itemFeed : manual).slice(0, 3);
  const memuat = memuatFeed || beritaLoading;

  return (
    <section className="bg-muted/40" data-ocid="beranda.berita_section">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <Instagram className="size-4" aria-hidden="true" />
              {INSTAGRAM_HANDLE}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Berita Terkini
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Kabar terbaru kegiatan bengkel {JURUSAN_NAME} langsung dari
              Instagram {INSTAGRAM_HANDLE}.
            </p>
          </div>
          <Button asChild variant="outline">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="beranda.berita.instagram_link"
            >
              <Instagram className="size-4" aria-hidden="true" />
              Ikuti {INSTAGRAM_HANDLE}
            </a>
          </Button>
        </div>

        {memuat && item.length === 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => `berita-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-72 w-full rounded-lg" />
              ),
            )}
          </div>
        ) : item.length === 0 ? (
          <div
            className="mt-8 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center"
            data-ocid="beranda.berita.empty_state"
          >
            <Instagram
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-display text-base font-semibold">
              Belum ada berita
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              Admin belum menempelkan URL feed Instagram atau menambahkan berita
              manual. Kunjungi profil {INSTAGRAM_HANDLE} untuk kabar terbaru.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {item.map((berita, index) => (
              <KartuBerita key={berita.kunci} item={berita} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman Beranda                                                     */
/* ------------------------------------------------------------------ */

export function Beranda() {
  const { data: trainer, isLoading: trainerLoading } = useListTrainer();
  const { data: alat, isLoading: alatLoading } = useListAlat();
  const { data: sparepart, isLoading: sparepartLoading } = useListSparepart();
  const { data: peminjamanLab } = useListPeminjamanLab(null);

  const totalTrainer = (trainer ?? []).reduce(
    (sum, item) => sum + Number(item.jumlahTotal),
    0,
  );
  const totalTrainerTersedia = (trainer ?? []).reduce(
    (sum, item) => sum + Number(item.jumlahTersedia),
    0,
  );
  const totalAlat = (alat ?? []).reduce(
    (sum, item) => sum + Number(item.jumlahTotal),
    0,
  );
  const totalAlatTersedia = (alat ?? []).reduce(
    (sum, item) => sum + Number(item.jumlahTersedia),
    0,
  );
  const stokMenipis = (sparepart ?? []).filter(
    (item) =>
      statusKetersediaan(item.jumlahStok, item.ambangMinimum) !== "tersedia",
  );

  return (
    <div data-ocid="beranda.page">
      {/* Hero — dark steel band */}
      <section
        className="relative overflow-hidden bg-gradient-steel"
        data-ocid="beranda.hero"
      >
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-hero-muted">
                <Wrench className="size-3.5" aria-hidden="true" />
                Unit Pengelolaan Bengkel
              </span>
              <h1 className="mt-5 max-w-2xl text-balance font-display text-4xl font-bold tracking-tight text-hero md:text-6xl">
                {JURUSAN_NAME}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-hero-muted md:text-lg">
                Selamat datang di logbook digital {APP_NAME} — pusat pencatatan
                Unit Trainer, sparepart, jadwal piket UPJ, dan keuangan bengkel{" "}
                {SEKOLAH_NAME}.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link
                    to="/tata-tertib"
                    data-ocid="beranda.tata_tertib_button"
                  >
                    Baca Tata Tertib
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/25 bg-transparent text-hero hover:bg-primary-foreground/10 hover:text-hero"
                >
                  <Link to="/jadwal" data-ocid="beranda.jadwal_button">
                    Lihat Jadwal UPJ
                  </Link>
                </Button>
              </div>
            </div>

            <div
              className="grid gap-3 animate-rise sm:grid-cols-2 lg:grid-cols-1"
              style={{ animationDelay: "120ms" }}
            >
              <StatCard
                label="Jenis Unit Trainer"
                value={trainerLoading ? "—" : formatAngka(trainer?.length ?? 0)}
                hint="Terdaftar di bengkel"
                icon={<Wrench className="size-5" aria-hidden="true" />}
                to="/trainer"
                ocid="beranda.stat_trainer"
              />
              <StatCard
                label="Unit Trainer Tersedia"
                value={trainerLoading ? "—" : formatAngka(totalTrainerTersedia)}
                hint={`dari ${formatAngka(totalTrainer)} unit total`}
                icon={<ShieldCheck className="size-5" aria-hidden="true" />}
                to="/trainer"
                ocid="beranda.stat_trainer_tersedia"
              />
              <StatCard
                label="Jenis Alat"
                value={alatLoading ? "—" : formatAngka(alat?.length ?? 0)}
                hint="Inventaris alat terpisah"
                icon={<Wrench className="size-5" aria-hidden="true" />}
                to="/alat"
                ocid="beranda.stat_alat"
              />
              <StatCard
                label="Alat Tersedia"
                value={alatLoading ? "—" : formatAngka(totalAlatTersedia)}
                hint={`dari ${formatAngka(totalAlat)} alat total`}
                icon={<ShieldCheck className="size-5" aria-hidden="true" />}
                to="/alat"
                ocid="beranda.stat_alat_tersedia"
              />
              <StatCard
                label="Sparepart"
                value={
                  sparepartLoading ? "—" : formatAngka(sparepart?.length ?? 0)
                }
                hint={`${formatAngka(stokMenipis.length)} perlu restock`}
                icon={<Package className="size-5" aria-hidden="true" />}
                to="/sparepart"
                ocid="beranda.stat_sparepart"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Kalender jadwal lab — terlihat semua pengunjung tanpa login */}
      <section
        className="border-b border-border bg-background"
        data-ocid="beranda.kalender_section"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                <CalendarDays className="size-4" aria-hidden="true" />
                Jadwal Lab
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Kalender Penggunaan Lab
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Jadwal pemakaian Lab 1 Chasis, Lab 2 Mesin, dan Lab 3
                Kelistrikan. Klik tanggal untuk melihat detail peminjaman.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link
                to="/peminjaman-lab"
                data-ocid="beranda.kalender.pinjam_link"
              >
                Ajukan Peminjaman Lab
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-8">
            <KalenderLab peminjaman={peminjamanLab ?? []} />
          </div>
        </div>
      </section>

      {/* Struktur organisasi */}
      <section
        className="border-b border-border bg-background"
        data-ocid="beranda.struktur_section"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
              <Network className="size-4" aria-hidden="true" />
              Organisasi
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
              Struktur Organisasi {JURUSAN_NAME}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Susunan pengurus Kompetensi Keahlian Teknik Sepeda Motor{" "}
              {SEKOLAH_NAME}, dari Kepala Sekolah hingga Teknisi &amp; Toolman.
            </p>
          </div>
          <div className="mt-8">
            <StrukturOrganisasi />
          </div>
        </div>
      </section>

      {/* Berita terkini */}
      <BeritaTerkini />

      {/* Tata tertib — prominent on the home page */}
      <section
        className="border-b border-border bg-background"
        data-ocid="beranda.tata_tertib_section"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                <ClipboardList className="size-4" aria-hidden="true" />
                Wajib Dipatuhi
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Tata Tertib Bengkel
              </h2>
              <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                Aturan dasar penggunaan bengkel {JURUSAN_NAME}. Setiap siswa dan
                pengguna wajib memahami dan menaatinya sebelum memulai praktik.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to="/tata-tertib" data-ocid="beranda.tata_tertib_link">
                  Lihat halaman lengkap
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <ol className="flex flex-col" data-ocid="beranda.tata_tertib_list">
              {TATA_TERTIB.map((aturan, index) => (
                <li
                  key={aturan}
                  data-ocid={`beranda.tata_tertib.item.${index + 1}`}
                  className="flex gap-4 border-b border-border py-4 first:pt-0 last:border-b-0"
                >
                  <span className="rule-numeral w-8 shrink-0 pt-0.5 text-right text-lg font-bold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                    {aturan}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Stok ringkas */}
      <section className="bg-muted/40" data-ocid="beranda.stok_section">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Inventaris
              </span>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Stok Sparepart Terkini
              </h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/sparepart" data-ocid="beranda.sparepart_link">
                Semua Sparepart
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <Card className="mt-8 overflow-hidden border-border shadow-subtle">
            <CardHeader className="border-b border-border bg-card">
              <CardTitle className="font-display text-base">
                Ketersediaan Sparepart
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {sparepartLoading ? (
                <div className="flex flex-col gap-3 p-5">
                  {Array.from(
                    { length: 4 },
                    (_, i) => `stok-skeleton-${i}`,
                  ).map((id) => (
                    <Skeleton key={id} className="h-10 w-full" />
                  ))}
                </div>
              ) : (sparepart ?? []).length === 0 ? (
                <div
                  className="flex flex-col items-center gap-2 px-6 py-12 text-center"
                  data-ocid="beranda.sparepart.empty_state"
                >
                  <Package
                    className="size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="font-display text-base font-semibold">
                    Belum ada data sparepart
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Data akan tampil setelah admin menambahkan sparepart.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[32rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/60 text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Nama
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Kategori
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Stok
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sparepart ?? []).slice(0, 5).map((item, index) => {
                        const status = statusKetersediaan(
                          item.jumlahStok,
                          item.ambangMinimum,
                        );
                        return (
                          <tr
                            key={item.id.toString()}
                            data-ocid={`beranda.sparepart.row.${index + 1}`}
                            className="border-b border-border last:border-b-0 odd:bg-card even:bg-muted/40"
                          >
                            <td className="px-5 py-3 font-medium text-foreground">
                              {item.nama}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">
                              {item.kategori}
                            </td>
                            <td className="rule-numeral px-5 py-3 text-right font-semibold">
                              {formatAngka(item.jumlahStok)} {item.satuan}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <Badge
                                className={cn(
                                  "rounded-sm border-transparent text-[11px] font-semibold uppercase tracking-wider",
                                  STATUS_BADGE[status],
                                )}
                              >
                                {STATUS_TEXT[status]}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Band dekoratif — foto bengkel dan kegiatan */}
      <section
        className="relative overflow-hidden"
        data-ocid="beranda.galeri_section"
      >
        <div className="grid sm:grid-cols-2">
          {GALERI_BERANDA.map((gambar, index) => (
            <figure
              key={gambar.src}
              className="relative h-56 overflow-hidden md:h-72"
              data-ocid={`beranda.galeri.item.${index + 1}`}
            >
              <img
                src={gambar.src}
                alt={gambar.alt}
                loading="lazy"
                className="size-full object-cover"
              />
              <div
                className="absolute inset-0 bg-band-overlay"
                aria-hidden="true"
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-sm font-medium text-hero md:text-base">
                {gambar.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
