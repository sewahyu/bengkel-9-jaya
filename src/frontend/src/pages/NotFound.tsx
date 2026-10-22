import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function NotFound() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-24 md:px-6"
      data-ocid="not_found.page"
    >
      <Card
        className="w-full max-w-md border-border shadow-subtle"
        data-ocid="not_found.card"
      >
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Compass className="size-6" aria-hidden="true" />
          </span>
          <p className="rule-numeral text-4xl font-bold text-accent">404</p>
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-bold tracking-tight">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Rute yang Anda tuju tidak tersedia. Kembali ke beranda untuk
              melanjutkan.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link to="/" data-ocid="not_found.home_button">
              Kembali ke Beranda
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
