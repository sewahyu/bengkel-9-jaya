import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAlat } from "@/hooks/use-backend";
import { formatAngka } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Wrench, WrenchIcon } from "lucide-react";

export function AlatDetail() {
  const { id } = useParams({ from: "/alat/$id" });
  const alatId = BigInt(id);
  const { data: item, isLoading } = useGetAlat(alatId);

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6"
        data-ocid="alat_detail.loading_state"
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
          data-ocid="alat_detail.not_found_state"
        >
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <WrenchIcon className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-semibold">
              Alat tidak ditemukan
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Data alat yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <Button asChild variant="outline">
              <Link to="/alat" data-ocid="alat_detail.back_button">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke daftar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dipinjam = item.jumlahTotal - item.jumlahTersedia;
  const habis = item.jumlahTersedia <= 0n;

  const statistik: { label: string; value: string; tone: string }[] = [
    {
      label: "Total",
      value: formatAngka(item.jumlahTotal),
      tone: "text-foreground",
    },
    {
      label: "Tersedia",
      value: formatAngka(item.jumlahTersedia),
      tone: "text-success",
    },
    {
      label: "Dipinjam",
      value: formatAngka(dipinjam),
      tone: "text-accent",
    },
  ];

  return (
    <div data-ocid="alat_detail.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/alat" data-ocid="alat_detail.back_button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Daftar Alat
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                <Wrench className="size-4" aria-hidden="true" />
                Detail Alat
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {item.nama}
              </h1>
              <p className="text-sm text-muted-foreground">{item.kategori}</p>
            </div>
            <Badge
              className={cn(
                "rounded-sm border-transparent text-[11px] font-semibold uppercase tracking-wider",
                habis
                  ? "bg-destructive/15 text-destructive"
                  : "bg-success/15 text-success",
              )}
            >
              {habis ? "Habis" : "Tersedia"}
            </Badge>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {statistik.map((stat) => (
              <Card key={stat.label} className="border-border shadow-subtle">
                <CardContent className="flex flex-col gap-1 p-6">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </span>
                  <span
                    className={cn("rule-numeral text-4xl font-bold", stat.tone)}
                  >
                    {stat.value}
                  </span>
                  <span className="text-xs text-muted-foreground">unit</span>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 border-border shadow-subtle">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Keterangan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed text-foreground">
                {item.keterangan || "Belum ada keterangan untuk alat ini."}
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-muted/40 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              Ajukan peminjaman mandiri untuk alat ini tanpa perlu login.
            </p>
            <Button asChild data-ocid="alat_detail.pinjam_button">
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
