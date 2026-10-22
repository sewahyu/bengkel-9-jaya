import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListAlat } from "@/hooks/use-backend";
import { KATEGORI_ALAT } from "@/lib/constants";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Search, Wrench, X } from "lucide-react";
import { useMemo } from "react";

const SEMUA = "semua";

export function Alat() {
  const { data: alat, isLoading } = useListAlat();
  const search = useSearch({ from: "/alat" });
  const navigate = useNavigate();

  const cari = search.cari ?? "";
  const kategori = search.kategori ?? SEMUA;

  const hasil = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return (alat ?? []).filter((item) => {
      const cocokKategori = kategori === SEMUA || item.kategori === kategori;
      const cocokCari =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        item.kategori.toLowerCase().includes(query) ||
        item.keterangan.toLowerCase().includes(query);
      return cocokKategori && cocokCari;
    });
  }, [alat, cari, kategori]);

  const adaFilter = cari !== "" || kategori !== SEMUA;

  return (
    <div data-ocid="alat.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <Wrench className="size-4" aria-hidden="true" />
            Inventaris
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Daftar Alat
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Inventaris alat bengkel yang terpisah dari Trainer. Pengunjung umum
            dapat melihat daftar ini tanpa login dan mengajukan peminjaman
            mandiri.
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative w-full sm:max-w-sm">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={cari}
                onChange={(event) =>
                  void navigate({
                    to: "/alat",
                    search: (prev) => ({
                      ...prev,
                      cari: event.target.value || undefined,
                    }),
                  })
                }
                placeholder="Cari nama atau keterangan alat"
                aria-label="Cari alat"
                className="pl-9"
                data-ocid="alat.search_input"
              />
            </div>

            <fieldset
              className="flex flex-wrap items-center gap-2"
              aria-label="Filter kategori alat"
              data-ocid="alat.kategori_filter"
            >
              <legend className="sr-only">Filter kategori alat</legend>
              <button
                type="button"
                onClick={() =>
                  void navigate({
                    to: "/alat",
                    search: (prev) => ({ ...prev, kategori: undefined }),
                  })
                }
                aria-pressed={kategori === SEMUA}
                data-ocid="alat.kategori.tab.semua"
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-smooth",
                  kategori === SEMUA
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground",
                )}
              >
                Semua
              </button>
              {KATEGORI_ALAT.map((option) => {
                const aktif = kategori === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      void navigate({
                        to: "/alat",
                        search: (prev) => ({
                          ...prev,
                          kategori: aktif ? undefined : option.value,
                        }),
                      })
                    }
                    aria-pressed={aktif}
                    data-ocid={`alat.kategori.tab.${option.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-smooth",
                      aktif
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </fieldset>

            {adaFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void navigate({ to: "/alat", search: {} })}
                data-ocid="alat.reset_button"
              >
                <X className="size-4" aria-hidden="true" />
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <p className="mb-5 text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="rule-numeral font-semibold text-foreground">
              {hasil.length}
            </span>{" "}
            dari {alat?.length ?? 0} alat
          </p>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => `alat-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-44 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : hasil.length === 0 ? (
            <Card
              className="border-border shadow-subtle"
              data-ocid="alat.empty_state"
            >
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Wrench className="size-6" aria-hidden="true" />
                </span>
                <p className="font-display text-lg font-semibold">
                  {adaFilter ? "Alat tidak ditemukan" : "Belum ada data alat"}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {adaFilter
                    ? "Coba ubah kata kunci atau filter kategori."
                    : "Data akan tampil setelah admin menambahkan alat."}
                </p>
                {adaFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void navigate({ to: "/alat", search: {} })}
                    data-ocid="alat.empty_reset_button"
                  >
                    Reset filter
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hasil.map((item, index) => {
                const dipinjam = item.jumlahTotal - item.jumlahTersedia;
                const habis = item.jumlahTersedia <= 0n;
                return (
                  <Link
                    key={item.id.toString()}
                    to="/alat/$id"
                    params={{ id: item.id.toString() }}
                    data-ocid={`alat.item.${index + 1}`}
                    className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <h2 className="truncate font-display text-base font-bold tracking-tight text-foreground">
                          {item.nama}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {item.kategori}
                        </p>
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0 rounded-sm border-transparent text-[11px] font-semibold uppercase tracking-wider",
                          habis
                            ? "bg-destructive/15 text-destructive"
                            : "bg-success/15 text-success",
                        )}
                      >
                        {habis ? "Habis" : "Tersedia"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Total
                        </span>
                        <span className="rule-numeral text-xl font-bold text-foreground">
                          {formatAngka(item.jumlahTotal)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Tersedia
                        </span>
                        <span className="rule-numeral text-xl font-bold text-success">
                          {formatAngka(item.jumlahTersedia)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Dipinjam
                        </span>
                        <span className="rule-numeral text-xl font-bold text-accent">
                          {formatAngka(dipinjam)}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-smooth group-hover:opacity-100">
                      Lihat detail
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Ingin meminjam alat? Ajukan peminjaman mandiri tanpa login.
            </p>
            <Button asChild data-ocid="alat.pinjam_button">
              <Link to="/pinjam-alat">
                Ajukan Peminjaman Alat
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
