import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListTrainer } from "@/hooks/use-backend";
import { KATEGORI_TRAINER } from "@/lib/constants";
import { formatAngka, statusKetersediaan } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Search, Wrench, X } from "lucide-react";
import { useMemo } from "react";

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

const SEMUA = "semua";

export function Trainer() {
  const { data: trainer, isLoading } = useListTrainer();
  const search = useSearch({ from: "/trainer" });
  const navigate = useNavigate();

  const cari = search.cari ?? "";
  const kategori = search.kategori ?? SEMUA;

  const hasil = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return (trainer ?? []).filter((item) => {
      const cocokKategori = kategori === SEMUA || item.kategori === kategori;
      const cocokCari =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        item.kategori.toLowerCase().includes(query) ||
        item.keterangan.toLowerCase().includes(query);
      return cocokKategori && cocokCari;
    });
  }, [trainer, cari, kategori]);

  const adaFilter = cari !== "" || kategori !== SEMUA;

  return (
    <div data-ocid="trainer.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <Wrench className="size-4" aria-hidden="true" />
            Inventaris
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Daftar Trainer
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Unit trainer bengkel beserta jumlah total dan jumlah unit yang
            tersedia. Peminjaman unit trainer dicatat oleh petugas UPJ.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
                    to: "/trainer",
                    search: (prev) => ({
                      ...prev,
                      cari: event.target.value || undefined,
                    }),
                  })
                }
                placeholder="Cari nama atau kategori unit trainer"
                aria-label="Cari unit trainer"
                className="pl-9"
                data-ocid="trainer.search_input"
              />
            </div>

            {adaFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void navigate({ to: "/trainer", search: {} })}
                data-ocid="trainer.reset_button"
              >
                <X className="size-4" aria-hidden="true" />
                Reset
              </Button>
            ) : null}
          </div>

          <fieldset
            className="mt-4 flex flex-wrap items-center gap-2"
            aria-label="Filter kategori unit trainer"
          >
            <legend className="sr-only">Filter kategori unit trainer</legend>
            <Button
              type="button"
              size="sm"
              variant={kategori === SEMUA ? "default" : "outline"}
              onClick={() =>
                void navigate({
                  to: "/trainer",
                  search: (prev) => ({ ...prev, kategori: undefined }),
                })
              }
              data-ocid="trainer.kategori.semua"
            >
              Semua
            </Button>
            {KATEGORI_TRAINER.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={kategori === option.value ? "default" : "outline"}
                onClick={() =>
                  void navigate({
                    to: "/trainer",
                    search: (prev) => ({ ...prev, kategori: option.value }),
                  })
                }
                data-ocid={`trainer.kategori.${option.value
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "_")}`}
              >
                {option.label}
              </Button>
            ))}
          </fieldset>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <p className="mb-5 text-sm text-muted-foreground">
            Menampilkan{" "}
            <span className="rule-numeral font-semibold text-foreground">
              {hasil.length}
            </span>{" "}
            dari {trainer?.length ?? 0} unit trainer
          </p>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => `trainer-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-44 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : hasil.length === 0 ? (
            <Card
              className="border-border shadow-subtle"
              data-ocid="trainer.empty_state"
            >
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Wrench className="size-6" aria-hidden="true" />
                </span>
                <p className="font-display text-lg font-semibold">
                  {adaFilter
                    ? "Unit trainer tidak ditemukan"
                    : "Belum ada data unit trainer"}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {adaFilter
                    ? "Coba ubah kata kunci atau filter kategori."
                    : "Data akan tampil setelah admin menambahkan unit trainer."}
                </p>
                {adaFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void navigate({ to: "/trainer", search: {} })
                    }
                    data-ocid="trainer.empty_reset_button"
                  >
                    Reset filter
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hasil.map((item, index) => {
                const status = statusKetersediaan(item.jumlahTersedia, 0);
                return (
                  <Link
                    key={item.id.toString()}
                    to="/trainer/$id"
                    params={{ id: item.id.toString() }}
                    data-ocid={`trainer.item.${index + 1}`}
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
                          STATUS_BADGE[status],
                        )}
                      >
                        {STATUS_TEXT[status]}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Total
                        </span>
                        <span className="rule-numeral text-xl font-bold text-foreground">
                          {formatAngka(item.jumlahTotal)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Tersedia
                        </span>
                        <span className="rule-numeral text-xl font-bold text-accent">
                          {formatAngka(item.jumlahTersedia)}
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
        </div>
      </section>
    </div>
  );
}
