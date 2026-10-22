import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetSparepart, useListMutasiStok } from "@/hooks/use-backend";
import { formatAngka, formatWaktu, statusKetersediaan } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Package,
  PackageX,
} from "lucide-react";

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

export function SparepartDetail() {
  const { id } = useParams({ from: "/sparepart/$id" });
  const sparepartId = BigInt(id);
  const { data: item, isLoading } = useGetSparepart(sparepartId);
  const { data: mutasi, isLoading: mutasiLoading } =
    useListMutasiStok(sparepartId);

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6"
        data-ocid="sparepart_detail.loading_state"
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-56 w-full rounded-lg" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 md:px-6">
        <Card
          className="border-border shadow-subtle"
          data-ocid="sparepart_detail.not_found_state"
        >
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <PackageX className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-semibold">
              Sparepart tidak ditemukan
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Data sparepart yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Button asChild variant="outline">
              <Link to="/sparepart" data-ocid="sparepart_detail.back_button">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke daftar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusKetersediaan(item.jumlahStok, item.ambangMinimum);

  const info: { label: string; value: string }[] = [
    { label: "Kode", value: item.kode },
    { label: "Kategori", value: item.kategori },
    { label: "Satuan", value: item.satuan },
    { label: "Ambang minimum", value: formatAngka(item.ambangMinimum) },
  ];

  return (
    <div data-ocid="sparepart_detail.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/sparepart" data-ocid="sparepart_detail.back_button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Daftar Sparepart
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                <Package className="size-4" aria-hidden="true" />
                Detail Sparepart
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {item.nama}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">
                {item.kode}
              </p>
            </div>
            <Badge
              className={cn(
                "rounded-sm border-transparent text-[11px] font-semibold uppercase tracking-wider",
                STATUS_BADGE[status],
              )}
            >
              {STATUS_TEXT[status]}
            </Badge>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
            <Card className="border-border shadow-subtle">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Stok Saat Ini
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 p-6">
                <span className="rule-numeral text-5xl font-bold text-foreground">
                  {formatAngka(item.jumlahStok)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {item.satuan} tersedia
                </span>
                <span className="mt-3 text-xs text-muted-foreground">
                  Ambang minimum {formatAngka(item.ambangMinimum)} {item.satuan}
                </span>
              </CardContent>
            </Card>

            <Card className="border-border shadow-subtle">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Informasi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <dl>
                  {info.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 last:border-b-0"
                    >
                      <dt className="text-sm text-muted-foreground">
                        {row.label}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 overflow-hidden border-border shadow-subtle">
            <CardHeader className="border-b border-border">
              <CardTitle className="font-display text-base">
                Riwayat Mutasi Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {mutasiLoading ? (
                <div className="flex flex-col gap-3 p-5">
                  {Array.from(
                    { length: 3 },
                    (_, i) => `mutasi-skeleton-${i}`,
                  ).map((id) => (
                    <Skeleton key={id} className="h-10 w-full" />
                  ))}
                </div>
              ) : (mutasi ?? []).length === 0 ? (
                <p
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                  data-ocid="sparepart_detail.mutasi.empty_state"
                >
                  Belum ada riwayat mutasi stok untuk sparepart ini.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[30rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/60 text-left">
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Waktu
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Jenis
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Jumlah
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(mutasi ?? []).map((row, index) => {
                        const masuk = row.jenis === "masuk";
                        return (
                          <tr
                            key={row.id.toString()}
                            data-ocid={`sparepart_detail.mutasi.row.${index + 1}`}
                            className="border-b border-border last:border-b-0 odd:bg-card even:bg-muted/40"
                          >
                            <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted-foreground">
                              {formatWaktu(row.waktu)}
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
                                  masuk ? "text-success" : "text-destructive",
                                )}
                              >
                                {masuk ? (
                                  <ArrowDownLeft
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <ArrowUpRight
                                    className="size-3.5"
                                    aria-hidden="true"
                                  />
                                )}
                                {masuk ? "Masuk" : "Keluar"}
                              </span>
                            </td>
                            <td className="rule-numeral px-5 py-3 text-right font-semibold">
                              {masuk ? "+" : "−"}
                              {formatAngka(row.jumlah)}
                            </td>
                            <td className="px-5 py-3 text-muted-foreground">
                              {row.keterangan || "—"}
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
    </div>
  );
}
