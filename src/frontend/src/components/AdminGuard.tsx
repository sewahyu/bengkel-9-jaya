import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

function GuardShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-20 md:px-6">
      {children}
    </div>
  );
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isAdmin, isInitializing, isRoleLoading } = useAuth();

  if (isInitializing || (isAuthenticated && isRoleLoading)) {
    return (
      <GuardShell>
        <div
          className="flex w-full max-w-md flex-col gap-4"
          data-ocid="admin.guard.loading_state"
        >
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </GuardShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <GuardShell>
        <Card
          className="w-full max-w-md border-border shadow-subtle"
          data-ocid="admin.guard.login_panel"
        >
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-xl font-bold tracking-tight">
                Area Terbatas
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Halaman ini hanya dapat diakses oleh admin yang sudah masuk.
                Silakan login terlebih dahulu.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/admin/login" data-ocid="admin.guard.login_button">
                Masuk Panel Admin
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/" data-ocid="admin.guard.back_link">
                Kembali ke Beranda
              </Link>
            </Button>
          </CardContent>
        </Card>
      </GuardShell>
    );
  }

  if (!isAdmin) {
    return (
      <GuardShell>
        <Card
          className="w-full max-w-md border-border shadow-subtle"
          data-ocid="admin.guard.denied_panel"
        >
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1">
              <h1 className="font-display text-xl font-bold tracking-tight">
                Akses Ditolak
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Akun Anda belum memiliki peran admin. Hubungi pengelola jurusan
                untuk mendapatkan akses.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/" data-ocid="admin.guard.denied_back_link">
                Kembali ke Beranda
              </Link>
            </Button>
          </CardContent>
        </Card>
      </GuardShell>
    );
  }

  return <>{children}</>;
}
