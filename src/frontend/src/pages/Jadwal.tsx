import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListJadwal } from "@/hooks/use-backend";
import { HARI_OPTIONS } from "@/lib/constants";
import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { JadwalUpj } from "@/types";
import { CalendarDays, Info, Search, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

const HARI_ORDER = HARI_OPTIONS.map((option) => option.value);

function sortHari(a: string, b: string): number {
  const ai = HARI_ORDER.indexOf(a);
  const bi = HARI_ORDER.indexOf(b);
  if (ai === -1 && bi === -1) return a.localeCompare(b);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}

export function Jadwal() {
  const { data: jadwal, isLoading } = useListJadwal();
  const [cari, setCari] = useState("");

  const kelompok = useMemo(() => {
    const query = cari.trim().toLowerCase();
    const filtered = (jadwal ?? []).filter((item) => {
      if (!query) return true;
      return (
        item.namaSiswa.toLowerCase().includes(query) ||
        item.hari.toLowerCase().includes(query) ||
        item.kelas.toLowerCase().includes(query) ||
        item.tugas.toLowerCase().includes(query)
      );
    });

    const map = new Map<string, JadwalUpj[]>();
    for (const item of filtered) {
      const list = map.get(item.hari) ?? [];
      list.push(item);
      map.set(item.hari, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => sortHari(a, b));
  }, [jadwal, cari]);

  const totalEntri = (jadwal ?? []).length;

  return (
    <div data-ocid="jadwal.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <CalendarDays className="size-4" aria-hidden="true" />
            Piket Bengkel
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Jadwal UPJ
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Jadwal piket Unit Pengelolaan Bengkel per siswa, dikelompokkan per
            hari. Halaman ini bersifat tampilan saja.
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
                onChange={(event) => setCari(event.target.value)}
                placeholder="Cari nama siswa, hari, atau kelas"
                aria-label="Cari jadwal piket"
                className="pl-9"
                data-ocid="jadwal.search_input"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="rule-numeral font-semibold text-foreground">
                {totalEntri}
              </span>{" "}
              entri piket terdaftar
            </p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
            <Info
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Jadwal hanya dapat diubah oleh admin melalui panel admin. Hubungi
              petugas UPJ bila terdapat perubahan.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => `jadwal-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-48 w-full rounded-lg" />
                ),
              )}
            </div>
          ) : kelompok.length === 0 ? (
            <Card
              className="border-border shadow-subtle"
              data-ocid="jadwal.empty_state"
            >
              <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <CalendarDays className="size-6" aria-hidden="true" />
                </span>
                <p className="font-display text-lg font-semibold">
                  {cari ? "Jadwal tidak ditemukan" : "Belum ada jadwal piket"}
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {cari
                    ? "Coba kata kunci lain atau kosongkan pencarian."
                    : "Jadwal akan tampil setelah admin menambahkan entri piket UPJ."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {kelompok.map(([hari, items], groupIndex) => (
                <Card
                  key={hari}
                  data-ocid={`jadwal.group.${groupIndex + 1}`}
                  className="overflow-hidden border-border shadow-subtle"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border bg-primary px-5 py-3">
                    <h2 className="font-display text-base font-bold tracking-tight text-primary-foreground">
                      {hari}
                    </h2>
                    <span className="rule-numeral text-xs font-semibold text-primary-foreground/70">
                      {items.length} siswa
                    </span>
                  </div>
                  <CardContent className="p-0">
                    <ul>
                      {items.map((item, index) => (
                        <li
                          key={item.id.toString()}
                          data-ocid={`jadwal.item.${groupIndex + 1}.${index + 1}`}
                          className="flex items-start gap-3 border-b border-border px-5 py-4 last:border-b-0 odd:bg-card even:bg-muted/40"
                        >
                          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <UserRound className="size-4" aria-hidden="true" />
                          </span>
                          <div className="flex min-w-0 flex-col gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium text-foreground">
                                {item.namaSiswa}
                              </span>
                              <Badge
                                variant="secondary"
                                className="rounded-sm text-[11px] font-semibold uppercase tracking-wider"
                              >
                                {item.kelas}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.tugas}
                            </p>
                            {item.tanggal ? (
                              <p className="font-mono text-xs text-muted-foreground">
                                {formatTanggal(item.tanggal)}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
