import { AdminGuard } from "@/components/AdminGuard";
import { Layout } from "@/components/Layout";
import { Alat } from "@/pages/Alat";
import { AlatDetail } from "@/pages/AlatDetail";
import { Beranda } from "@/pages/Beranda";
import { Jadwal } from "@/pages/Jadwal";
import { NotFound } from "@/pages/NotFound";
import { PeminjamanLab } from "@/pages/PeminjamanLab";
import { PinjamAlat } from "@/pages/PinjamAlat";
import { Sparepart } from "@/pages/Sparepart";
import { SparepartDetail } from "@/pages/SparepartDetail";
import { TataTertib } from "@/pages/TataTertib";
import { Trainer } from "@/pages/Trainer";
import { TrainerDetail } from "@/pages/TrainerDetail";
import { AdminAlat } from "@/pages/admin/AdminAlat";
import { AdminBerita } from "@/pages/admin/AdminBerita";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminJadwal } from "@/pages/admin/AdminJadwal";
import { AdminKeuangan } from "@/pages/admin/AdminKeuangan";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { AdminPeminjaman } from "@/pages/admin/AdminPeminjaman";
import { AdminPeminjamanLab } from "@/pages/admin/AdminPeminjamanLab";
import { AdminSparepart } from "@/pages/admin/AdminSparepart";
import { AdminTrainer } from "@/pages/admin/AdminTrainer";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

function AdminArea({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Beranda,
});

const tataTertibRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tata-tertib",
  component: TataTertib,
});

const jadwalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jadwal",
  component: Jadwal,
});

const sparepartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sparepart",
  validateSearch: (
    search: Record<string, unknown>,
  ): { cari?: string; kategori?: string } => ({
    cari: typeof search.cari === "string" ? search.cari : undefined,
    kategori: typeof search.kategori === "string" ? search.kategori : undefined,
  }),
  component: Sparepart,
});

const sparepartDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sparepart/$id",
  component: SparepartDetail,
});

const trainerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trainer",
  validateSearch: (
    search: Record<string, unknown>,
  ): { cari?: string; kategori?: string } => ({
    cari: typeof search.cari === "string" ? search.cari : undefined,
    kategori: typeof search.kategori === "string" ? search.kategori : undefined,
  }),
  component: Trainer,
});

const trainerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trainer/$id",
  component: TrainerDetail,
});

const alatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/alat",
  validateSearch: (
    search: Record<string, unknown>,
  ): { cari?: string; kategori?: string } => ({
    cari: typeof search.cari === "string" ? search.cari : undefined,
    kategori: typeof search.kategori === "string" ? search.kategori : undefined,
  }),
  component: Alat,
});

const alatDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/alat/$id",
  component: AlatDetail,
});

const pinjamAlatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pinjam-alat",
  component: PinjamAlat,
});

const peminjamanLabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/peminjaman-lab",
  component: PeminjamanLab,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => (
    <AdminArea>
      <AdminDashboard />
    </AdminArea>
  ),
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

const adminPeminjamanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/peminjaman",
  component: () => (
    <AdminArea>
      <AdminPeminjaman />
    </AdminArea>
  ),
});

const adminKeuanganRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/keuangan",
  component: () => (
    <AdminArea>
      <AdminKeuangan />
    </AdminArea>
  ),
});

const adminAlatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/alat",
  component: () => (
    <AdminArea>
      <AdminAlat />
    </AdminArea>
  ),
});

const adminTrainerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/trainer",
  component: () => (
    <AdminArea>
      <AdminTrainer />
    </AdminArea>
  ),
});

const adminSparepartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/sparepart",
  component: () => (
    <AdminArea>
      <AdminSparepart />
    </AdminArea>
  ),
});

const adminJadwalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/jadwal",
  component: () => (
    <AdminArea>
      <AdminJadwal />
    </AdminArea>
  ),
});

const adminPeminjamanLabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/peminjaman-lab",
  component: () => (
    <AdminArea>
      <AdminPeminjamanLab />
    </AdminArea>
  ),
});

const adminBeritaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/berita",
  component: () => (
    <AdminArea>
      <AdminBerita />
    </AdminArea>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  tataTertibRoute,
  jadwalRoute,
  sparepartRoute,
  sparepartDetailRoute,
  trainerRoute,
  trainerDetailRoute,
  alatRoute,
  alatDetailRoute,
  pinjamAlatRoute,
  peminjamanLabRoute,
  adminRoute,
  adminLoginRoute,
  adminPeminjamanRoute,
  adminKeuanganRoute,
  adminAlatRoute,
  adminTrainerRoute,
  adminSparepartRoute,
  adminJadwalRoute,
  adminPeminjamanLabRoute,
  adminBeritaRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

// AdminGuard is exported for page tasks to wrap /admin/* routes.
export { AdminGuard };
