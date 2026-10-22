import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME, JURUSAN_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, LogOut, Menu } from "lucide-react";
import { useState } from "react";

function BrandMark() {
  return (
    <Link
      to="/"
      className="group flex items-center gap-3"
      data-ocid="nav.brand_link"
      aria-label={`${APP_NAME} — beranda`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background shadow-subtle ring-1 ring-border transition-smooth group-hover:ring-accent">
        <img
          src="/assets/images/smkn9-malang-logo.png"
          alt="Lambang SMK Negeri 9 Malang"
          width={194}
          height={300}
          className="h-8 w-auto object-contain"
        />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="font-display text-base font-bold tracking-tight text-foreground">
          {APP_NAME}
        </span>
        <span className="truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {JURUSAN_NAME}
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isAdmin, isInitializing, logout } = useAuth();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85"
      data-ocid="nav.header"
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <BrandMark />

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Navigasi utama"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              data-ocid={`nav.link.${item.to === "/" ? "beranda" : item.to.slice(1)}`}
              className={cn(
                "relative whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-medium transition-smooth xl:px-3 xl:text-sm",
                isActive(item.to)
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
              {isActive(item.to) ? (
                <span
                  className="absolute inset-x-2.5 -bottom-px h-0.5 origin-left animate-underline-in rounded-full bg-accent xl:inset-x-3"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin" data-ocid="nav.admin_link">
                    <LayoutDashboard className="size-4" aria-hidden="true" />
                    Panel Admin
                  </Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={logout}
                data-ocid="nav.logout_button"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </Button>
            </>
          ) : isInitializing ? (
            <Button type="button" size="sm" disabled data-ocid="nav.login_link">
              <LogIn className="size-4" aria-hidden="true" />
              Login Admin
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/admin" data-ocid="nav.login_link">
                <LogIn className="size-4" aria-hidden="true" />
                Login Admin
              </Link>
            </Button>
          )}
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Buka menu navigasi"
              data-ocid="nav.mobile_menu_button"
            >
              <Menu className="size-5" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-card">
            <SheetHeader className="text-left">
              <SheetTitle className="font-display">Menu</SheetTitle>
            </SheetHeader>
            <nav
              className="flex flex-col gap-1 px-4 pb-6"
              aria-label="Navigasi mobile"
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  data-ocid={`nav.mobile_link.${item.to === "/" ? "beranda" : item.to.slice(1)}`}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium transition-smooth",
                    isActive(item.to)
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 border-t border-border pt-3">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-1">
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        onClick={() => setMobileOpen(false)}
                        data-ocid="nav.mobile_admin_link"
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-smooth hover:bg-muted"
                      >
                        Panel Admin
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      data-ocid="nav.mobile_logout_button"
                      className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-smooth hover:bg-muted hover:text-foreground"
                    >
                      Keluar
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    data-ocid="nav.mobile_login_link"
                    className="block rounded-md bg-primary px-3 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-smooth hover:bg-accent hover:text-accent-foreground"
                  >
                    Login Admin
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
