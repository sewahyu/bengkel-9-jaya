import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useListAlat,
  useListPeminjaman,
  useListSparepart,
  useRingkasanKeuangan,
} from "@/hooks/use-backend";
import { formatAngka, formatRupiah } from "@/lib/format";
import { StatusPeminjaman } from "@/types";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  ClipboardList,
  Package,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminShell } from "./AdminShell";

interface StatCard {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  to: string;
  ocid: string;
}

const TAUTAN_CEPAT = [
  {
    to: "/admin/peminjaman",
    label: "Catat Peminjaman",
    description: "Rekam peminjaman alat dan pengembaliannya.",
    icon: ClipboardList,
    ocid: "admin.dashboard.link.peminjaman",
  },
  {
    to: "/admin/keuangan",
    label: "Nota Keuangan",
    description: "Catat uang masuk dan keluar bengkel.",
    icon: Wallet,
    ocid: "admin.dashboard.link.keuangan",
  },
  {
    to: "/admin/alat",
    label: "Data Alat",
    description: "Kelola daftar alat dan jumlah totalnya.",
    icon: Wrench,
    ocid: "admin.dashboard.link.alat",
  },
  {
    to: "/admin/sparepart",
    label: "Data Sparepart",
    description: "Kelola stok sparepart dan mutasinya.",
    icon: Package,
    ocid: "admin.dashboard.link.sparepart",
  },
  {
    to: "/admin/jadwal",
    label: "Jadwal UPJ",
    description: "Atur jadwal piket unit pengelolaan.",
    icon: CalendarDays,
    ocid: "admin.dashboard.link.jadwal",
  },
] as const;

export function AdminDashboard() {
  const alatQuery = useListAlat();
  const sparepartQuery = useListSparepart();
  const peminjamanQuery = useListPeminjaman(null, null, null);
  const keuanganQuery = useRingkasanKeuangan();

  const jumlahAlat = alatQuery.data?.length ?? 0;
  const jumlahSparepart = sparepartQuery.data?.length ?? 0;
  const peminjamanAktif =
    peminjamanQuery.data?.filter(
      (item) => item.status === StatusPeminjaman.dipinjam,
    ).length ?? 0;
  const saldo = keuanganQuery.data?.saldo ?? 0n;

  const memuat =
    alatQuery.isLoading ||
    sparepartQuery.isLoading ||
    peminjamanQuery.isLoading ||
    keuanganQuery.isLoading;

  const statistik: StatCard[] = [
    {
      label: "Jenis Alat",
      value: formatAngka(jumlahAlat),
      hint: "alat tercatat di bengkel",
      icon: Wrench,
      to: "/admin/alat",
      ocid: "admin.dashboard.stat.alat",
    },
    {
      label: "Jenis Sparepart",
      value: formatAngka(jumlahSparepart),
      hint: "sparepart dalam stok",
      icon: Package,
      to: "/admin/sparepart",
      ocid: "admin.dashboard.stat.sparepart",
    },
    {
      label: "Peminjaman Aktif",
      value: formatAngka(peminjamanAktif),
      hint: "belum dikembalikan",
      icon: ClipboardList,
      to: "/admin/peminjaman",
      ocid: "admin.dashboard.stat.peminjaman",
    },
    {
      label: "Saldo Kas",
      value: formatRupiah(saldo),
      hint: "total masuk dikurangi keluar",
      icon: Wallet,
      to: "/admin/keuangan",
      ocid: "admin.dashboard.stat.saldo",
    },
  ];

  return (
    <AdminShell
      title="Ringkasan Bengkel"
      description="Pantau kondisi alat, sparepart, peminjaman, dan kas UPJ dalam satu tampilan."
    >
      <div className="flex flex-col gap-8">
        <section
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Statistik bengkel"
          data-ocid="admin.dashboard.stats"
        >
          {statistik.map((stat) => (
            <Card
              key={stat.ocid}
              className="border-border shadow-subtle"
              data-ocid={stat.ocid}
            >
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <stat.icon className="size-4" aria-hidden="true" />
                  </span>
                </div>
                {memuat ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="rule-numeral text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="flex flex-col gap-4" aria-label="Tautan cepat">
          <div className="flex items-center gap-2">
            <Boxes className="size-4 text-accent" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold tracking-tight">
              Tautan Cepat
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TAUTAN_CEPAT.map((tautan) => (
              <Link
                key={tautan.to}
                to={tautan.to}
                data-ocid={tautan.ocid}
                className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-subtle transition-smooth hover:border-accent/50 hover:shadow-md"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground transition-smooth group-hover:bg-accent group-hover:text-accent-foreground">
                  <tautan.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center gap-1.5 font-display text-sm font-bold tracking-tight">
                    {tautan.label}
                    <ArrowRight
                      className="size-3.5 text-accent opacity-0 transition-smooth group-hover:translate-x-0.5 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {tautan.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
