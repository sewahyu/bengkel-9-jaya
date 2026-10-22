import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { APP_NAME, JURUSAN_NAME } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  KeyRound,
  Loader2,
  LogIn,
} from "lucide-react";
import { useState } from "react";

export function AdminLogin() {
  const { isAuthenticated, isAdmin, isInitializing, loginError, login } =
    useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) return;
    login(username.trim(), password);
  };

  return (
    <div
      className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center"
      data-ocid="admin.login.page"
    >
      <div className="flex flex-col gap-6">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <KeyRound className="size-3.5 text-accent" aria-hidden="true" />
          Akses Terbatas
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Masuk Panel Admin
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Panel pengelolaan {APP_NAME} untuk petugas UPJ Jurusan{" "}
            {JURUSAN_NAME}. Masukkan akun admin untuk mengelola data bengkel.
          </p>
        </div>
      </div>

      <Card
        className="border-border shadow-subtle"
        data-ocid="admin.login.card"
      >
        <CardContent className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <p className="font-display text-base font-bold tracking-tight">
                Akun Admin
              </p>
              <p className="text-xs text-muted-foreground">
                Satu akun bawaan untuk petugas UPJ
              </p>
            </div>
          </div>

          {isAuthenticated ? (
            <div
              className="flex flex-col gap-3"
              data-ocid="admin.login.status_panel"
            >
              <p className="text-sm font-semibold text-success">
                {isAdmin ? "Masuk sebagai admin" : "Sudah masuk"}
              </p>
              <Button
                asChild
                className="w-full"
                data-ocid="admin.login.dashboard_button"
              >
                <Link to="/admin">
                  Buka Panel Admin
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
              data-ocid="admin.login.form"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  disabled={isInitializing}
                  data-ocid="admin.login.username_input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isInitializing}
                  data-ocid="admin.login.password_input"
                />
              </div>

              {loginError ? (
                <p
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                  data-ocid="admin.login.error_state"
                >
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {loginError.message}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={isInitializing || !username.trim() || !password}
                className="w-full"
                data-ocid="admin.login.submit_button"
              >
                {isInitializing ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <LogIn className="size-4" aria-hidden="true" />
                )}
                Masuk
              </Button>
            </form>
          )}

          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/" data-ocid="admin.login.back_link">
              Kembali ke Beranda
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
