import { APP_NAME, JURUSAN_NAME, SEKOLAH_NAME } from "@/lib/constants";
import { Wrench } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window === "undefined" ? "" : window.location.hostname;

  return (
    <footer
      className="mt-auto border-t border-border bg-primary text-primary-foreground"
      data-ocid="footer.section"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr] md:px-6 md:py-12">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <Wrench className="size-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              {APP_NAME}
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-primary-foreground/75">
            Unit Pengelolaan Bengkel Jurusan {JURUSAN_NAME}, {SEKOLAH_NAME}.
            Pencatatan alat, sparepart, jadwal piket, dan keuangan bengkel dalam
            satu logbook digital.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end md:text-right">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">
              Jurusan
            </p>
            <p className="font-display text-base font-semibold">
              {JURUSAN_NAME}
            </p>
            <p className="text-sm text-primary-foreground/75">{SEKOLAH_NAME}</p>
          </div>
          <div
            className="flex w-full max-w-md flex-col gap-2 rounded-lg bg-background px-4 py-3 shadow-subtle"
            data-ocid="footer.logo"
          >
            <img
              src="/assets/images/um-five-logo-banner.jpg"
              alt="Banner lima logo: Universitas Negeri Malang, UM Excellence in Learning Innovation, LP3, UM Mengajar, dan SMK Negeri 9 Malang"
              width={1200}
              height={200}
              loading="lazy"
              className="h-auto w-full object-contain"
            />
            <span className="text-left">
              <span className="block font-display text-sm font-bold text-foreground">
                UM, LP3, UM Mengajar &amp; SMK Negeri 9 Malang
              </span>
              <span className="block text-xs text-muted-foreground">
                Banner resmi mitra
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between md:px-6">
          <p className="font-mono">
            © {year} {JURUSAN_NAME} · {SEKOLAH_NAME}
          </p>
          <p data-ocid="footer.credit">
            Pencipta: Shendy Wahyu Pratama, Universitas Negeri Malang
          </p>
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary-foreground/85 underline decoration-accent decoration-2 underline-offset-2 transition-smooth hover:text-accent"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
