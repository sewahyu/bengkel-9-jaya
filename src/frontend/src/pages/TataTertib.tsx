import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JURUSAN_NAME, SEKOLAH_NAME, TATA_TERTIB } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ClipboardList, ShieldAlert } from "lucide-react";

export function TataTertib() {
  return (
    <div data-ocid="tata_tertib.page">
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-4">
            <Link to="/" data-ocid="tata_tertib.back_button">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Beranda
            </Link>
          </Button>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-accent">
            <ClipboardList className="size-4" aria-hidden="true" />
            Pedoman Bengkel
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Tata Tertib
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Aturan penggunaan bengkel {JURUSAN_NAME}, {SEKOLAH_NAME}. Tata
            tertib ini berlaku bagi seluruh siswa, guru, dan pengguna area
            bengkel.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 md:px-6 md:py-14">
          <Card className="border-border shadow-subtle">
            <CardContent className="p-0">
              <ol data-ocid="tata_tertib.list">
                {TATA_TERTIB.map((aturan, index) => (
                  <li
                    key={aturan}
                    data-ocid={`tata_tertib.item.${index + 1}`}
                    className="flex gap-5 border-b border-border px-5 py-5 last:border-b-0 md:px-7 md:py-6"
                  >
                    <span className="rule-numeral w-10 shrink-0 text-right text-2xl font-bold text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="pt-1 text-sm leading-relaxed text-foreground/90 md:text-base">
                      {aturan}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="mt-8 flex items-start gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4">
            <ShieldAlert
              className="mt-0.5 size-5 shrink-0 text-warning"
              aria-hidden="true"
            />
            <p className="text-sm leading-relaxed text-foreground/90">
              Pelanggaran terhadap tata tertib dikenakan sanksi sesuai aturan
              jurusan dan sekolah. Pastikan setiap penggunaan alat dicatat oleh
              petugas UPJ.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
