import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListSparepart } from "@/hooks/use-backend";
import { KATEGORI_SPAREPART } from "@/lib/constants";
import { formatAngka, statusKetersediaan } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Package, Search, X } from "lucide-react";
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

export function Sparepart() {
  const { data: sparepart, isLoading } = useListSparepart();
  const search = useSearch({ from: "/sparepart" });
  const navigate = useNavigate();

  const cari = search.cari ?? "";
  const kategori = search.kategori ?? SEMUA;

  const hasil = useMemo(() => {
    const query = cari.trim().toLowerCase();
    return (sparepart ?? []).filter((item) => {
      const cocokKategori = kategori === SEMUA || item.kategori === kategori;
      const cocokCari =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        item.kode.toLowerCase().includes(query) ||
        item.kategori.toLowerCase().includes(query);
      return cocokKategori && cocokCari;
    });
  }, [sparepart, cari, kategori]);

  const adaFilter = cari !== "" || kategori !== SEMUA;

  return (
    <div data-ocid="sparepart.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <Package className="size-4" aria-hidden="true" />
            Inventaris
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Stok Sparepart
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Daftar sparepart bengkel beserta jumlah stok dan status
            ketersediaannya.
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
                    to: "/sparepart",
                    search: (prev) => ({
                      ...prev,
                      cari: event.target.value || undefined,
                    }),
                  })
                }
                placeholder="Cari nama atau kode sparepart"
                aria-label="Cari sparepart"
                className="pl-9"
                data-ocid="sparepart.search_input"
              />
            </div>

            <Select
              value={kategori}
              onValueChange={(value) =>
                void navigate({
                  to: "/sparepart",
                  search: (prev) => ({
                    ...prev,
                    kategori: value === SEMUA ? undefined : value,
                  }),
                })
              }
            >
              <SelectTrigger
                className="w-full sm:w-56"
                aria-label="Filter kategori sparepart"
                data-ocid="sparepart.kategori_select"
              >
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEMUA}>Semua kategori</SelectItem>
                {KATEGORI_SPAREPART.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {adaFilter ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void navigate({ to: "/sparepart", search: {} })}
                data-ocid="sparepart.reset_button"
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
            dari {sparepart?.length ?? 0} sparepart
          </p>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(
                { length: 6 },
                (_, i) => `sparepart-skeleton-${i}`,
              ).map((id) => (
                <Skeleton key={id} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : hasil.length === 0 ? (
            <Card
              className="border-border shadow-subtle"
              data-ocid="sparepart.empty_state"
            >
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Package className="size-6" aria-hidden="true" />
                </span>
                <p className="font-display text-lg font-semibold">
                  {adaFilter
                    ? "Sparepart tidak ditemukan"
                    : "Belum ada data sparepart"}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {adaFilter
                    ? "Coba ubah kata kunci atau filter kategori."
                    : "Data akan tampil setelah admin menambahkan sparepart."}
                </p>
                {adaFilter ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void navigate({ to: "/sparepart", search: {} })
                    }
                    data-ocid="sparepart.empty_reset_button"
                  >
                    Reset filter
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {hasil.map((item, index) => {
                const status = statusKetersediaan(
                  item.jumlahStok,
                  item.ambangMinimum,
                );
                return (
                  <Link
                    key={item.id.toString()}
                    to="/sparepart/$id"
                    params={{ id: item.id.toString() }}
                    data-ocid={`sparepart.item.${index + 1}`}
                    className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1">
                        <h2 className="truncate font-display text-base font-bold tracking-tight text-foreground">
                          {item.nama}
                        </h2>
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.kode}
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

                    <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Stok
                        </span>
                        <span className="rule-numeral text-2xl font-bold text-foreground">
                          {formatAngka(item.jumlahStok)}
                          <span className="ml-1 text-sm font-medium text-muted-foreground">
                            {item.satuan}
                          </span>
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-smooth group-hover:opacity-100">
                        Detail
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Kategori: {item.kategori}
                    </p>
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
