import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTrainer } from "@/hooks/use-backend";
import { formatAngka, statusKetersediaan } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Info, Wrench, WrenchIcon } from "lucide-react";

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

export function TrainerDetail() {
  const { id } = useParams({ from: "/trainer/$id" });
  const { data: item, isLoading } = useGetTrainer(BigInt(id));

  if (isLoading) {
    return (
      <div
        className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6"
        data-ocid="trainer_detail.loading_state"
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
          data-ocid="trainer_detail.not_found_state"
        >
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <WrenchIcon className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-lg font-semibold">
              Unit trainer tidak ditemukan
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Data unit trainer yang Anda cari tidak tersedia atau telah
              dihapus.
            </p>
            <Button asChild variant="outline">
              <Link to="/trainer" data-ocid="trainer_detail.back_button">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Kembali ke daftar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusKetersediaan(item.jumlahTersedia, 0);
  const dipinjam = Number(item.jumlahTotal) - Number(item.jumlahTersedia);

  return (
    <div data-ocid="trainer_detail.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/trainer" data-ocid="trainer_detail.back_button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Daftar Trainer
            </Link>
          </Button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
                <Wrench className="size-4" aria-hidden="true" />
                Detail Trainer
              </span>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {item.nama}
              </h1>
              <p className="text-sm text-muted-foreground">{item.kategori}</p>
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
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border shadow-subtle">
              <CardContent className="flex flex-col gap-1 p-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Jumlah Total
                </span>
                <span className="rule-numeral text-4xl font-bold text-foreground">
                  {formatAngka(item.jumlahTotal)}
                </span>
                <span className="text-xs text-muted-foreground">
                  unit trainer
                </span>
              </CardContent>
            </Card>
            <Card className="border-border shadow-subtle">
              <CardContent className="flex flex-col gap-1 p-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Tersedia
                </span>
                <span className="rule-numeral text-4xl font-bold text-accent">
                  {formatAngka(item.jumlahTersedia)}
                </span>
                <span className="text-xs text-muted-foreground">
                  siap dipinjam
                </span>
              </CardContent>
            </Card>
            <Card className="border-border shadow-subtle">
              <CardContent className="flex flex-col gap-1 p-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Dipinjam
                </span>
                <span className="rule-numeral text-4xl font-bold text-foreground">
                  {formatAngka(dipinjam)}
                </span>
                <span className="text-xs text-muted-foreground">
                  sedang digunakan
                </span>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 border-border shadow-subtle">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Keterangan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed text-foreground/90 md:text-base">
                {item.keterangan ||
                  "Belum ada keterangan untuk unit trainer ini."}
              </p>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-start">
            <Info
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Peminjaman unit trainer hanya dapat dicatat oleh petugas UPJ yang
              sudah masuk. Silakan hubungi petugas bengkel untuk mengajukan
              peminjaman unit ini.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
