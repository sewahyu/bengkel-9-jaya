import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

interface AdminShellProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Kerangka halaman admin: bilah judul bergaya papan bengkel, navigasi tab
 * antar-halaman pengelolaan, dan area konten.
 */
export function AdminShell({
  title,
  description,
  actions,
  children,
}: AdminShellProps) {
  const { logout } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isActive = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <div className="flex flex-col" data-ocid="admin.page">
      <section
        className="relative overflow-hidden bg-gradient-steel text-primary-foreground"
        data-ocid="admin.header.section"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-blueprint opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-8 md:px-6 md:py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/80">
                <ShieldCheck className="size-3.5" aria-hidden="true" />
                Panel Admin
              </span>
              <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-primary-foreground/70">
                {description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                data-ocid="admin.logout_button"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </Button>
            </div>
          </div>

          <nav
            className="-mb-1 flex flex-wrap gap-1"
            aria-label="Navigasi panel admin"
            data-ocid="admin.nav"
          >
            {ADMIN_NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={`admin.nav.link.${item.to === "/admin" ? "ringkasan" : item.to.replace("/admin/", "")}`}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-smooth",
                  isActive(item.to)
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        {children}
      </div>
    </div>
  );
}
