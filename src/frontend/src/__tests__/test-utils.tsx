import type { Session, backendInterface } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

/**
 * A typed local stand-in for the generated backend actor. Every method the
 * frontend consumes is present, so a page that calls one the mock forgot fails
 * loudly instead of silently returning undefined.
 */
export type MockActor = backendInterface;

export type MockActorOverrides = {
  [K in keyof MockActor]?: MockActor[K];
};

/**
 * Builds a fully-typed actor mock. Unspecified methods resolve to empty/neutral
 * values so a page under test only has to declare the calls it actually asserts.
 */
export function createMockActor(overrides: MockActorOverrides = {}): MockActor {
  const base: MockActor = {
    addAlat: vi.fn(async () => {
      throw new Error("addAlat not stubbed");
    }),
    addBerita: vi.fn(async () => null),
    addJadwal: vi.fn(async () => {
      throw new Error("addJadwal not stubbed");
    }),
    addNota: vi.fn(async () => {
      throw new Error("addNota not stubbed");
    }),
    addPeminjamanLab: vi.fn(async () => null),
    addSparepart: vi.fn(async () => {
      throw new Error("addSparepart not stubbed");
    }),
    addTrainer: vi.fn(async () => {
      throw new Error("addTrainer not stubbed");
    }),
    ajukanPeminjamanAlat: vi.fn(async () => null),
    ajukanPeminjamanLab: vi.fn(async () => null),
    catatMutasiStok: vi.fn(async () => null),
    catatPeminjamanAlat: vi.fn(async () => null),
    catatPeminjamanTrainer: vi.fn(async () => null),
    catatPengembalian: vi.fn(async () => null),
    deleteAlat: vi.fn(async () => true),
    deleteBerita: vi.fn(async () => true),
    deleteJadwal: vi.fn(async () => true),
    deleteNota: vi.fn(async () => true),
    deletePeminjamanLab: vi.fn(async () => true),
    deleteSparepart: vi.fn(async () => true),
    deleteTrainer: vi.fn(async () => true),
    execute: vi.fn(async () => ({ hasMore: false, rows: [] })),
    getAlat: vi.fn(async () => null),
    getApiDoc: vi.fn(async () => ""),
    getBerita: vi.fn(async () => null),
    getFeedUrl: vi.fn(async () => ""),
    getJadwal: vi.fn(async () => null),
    getNota: vi.fn(async () => null),
    getPeminjaman: vi.fn(async () => null),
    getPeminjamanLab: vi.fn(async () => null),
    getSession: vi.fn(async () => null),
    getSparepart: vi.fn(async () => null),
    getTrainer: vi.fn(async () => null),
    isCallerAdmin: vi.fn(async () => false),
    listAlat: vi.fn(async () => []),
    listBerita: vi.fn(async () => []),
    listJadwal: vi.fn(async () => []),
    listMutasiStok: vi.fn(async () => []),
    listNota: vi.fn(async () => []),
    listPeminjaman: vi.fn(async () => []),
    listPeminjamanLab: vi.fn(async () => []),
    listSparepart: vi.fn(async () => []),
    listStokMenipis: vi.fn(async () => []),
    listTrainer: vi.fn(async () => []),
    login: vi.fn(async () => ({
      __kind__: "ok" as const,
      ok: { username: "admin", loginAt: 0n },
    })),
    logout: vi.fn(async () => undefined),
    ringkasanAlatPerKategori: vi.fn(async () => []),
    ringkasanKeuangan: vi.fn(async () => ({
      totalMasuk: 0n,
      totalKeluar: 0n,
      saldo: 0n,
    })),
    ringkasanTrainerPerKategori: vi.fn(async () => []),
    schema: vi.fn(async () => ""),
    setFeedUrl: vi.fn(async () => undefined),
    setujuiPeminjaman: vi.fn(async () => null),
    tolakPeminjaman: vi.fn(async () => null),
    updateAlat: vi.fn(async () => null),
    updateBerita: vi.fn(async () => null),
    updateJadwal: vi.fn(async () => null),
    updateNota: vi.fn(async () => null),
    updatePeminjamanLab: vi.fn(async () => null),
    updateSparepart: vi.fn(async () => null),
    updateTrainer: vi.fn(async () => null),
  };
  return { ...base, ...overrides };
}

export interface AuthStateOverrides {
  /** A live session makes `useAuth().isAuthenticated` true. */
  session?: Session | null;
  /** The value `isCallerAdmin` resolves to. */
  isAdmin?: boolean;
  /** Overrides the actor's `login` method. */
  login?: MockActor["login"];
  /** Overrides the actor's `logout` method. */
  logout?: MockActor["logout"];
}

/**
 * Installs module mocks for `@caffeineai/core-infrastructure` so pages render
 * against a local actor and a controllable session state, with no network.
 *
 * The accepted auth flow reads the session from the backend (`getSession`) and the
 * role from `isCallerAdmin`, so the auth overrides are applied to the actor
 * itself rather than to a separate identity provider.
 */
export function mockCoreInfrastructure(
  actor: MockActor,
  auth: AuthStateOverrides = {},
): void {
  const session = auth.session ?? null;
  const isAdmin = auth.isAdmin ?? false;
  const mockedActor: MockActor = {
    ...actor,
    getSession: vi.fn(async () => session),
    isCallerAdmin: vi.fn(async () => isAdmin),
    ...(auth.login === undefined ? {} : { login: auth.login }),
    ...(auth.logout === undefined ? {} : { logout: auth.logout }),
  };
  vi.doMock("@caffeineai/core-infrastructure", () => ({
    useActor: () => ({ actor: mockedActor, isFetching: false }),
  }));
}

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
): ReturnType<typeof render> {
  const queryClient = createTestQueryClient();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  return render(ui, { wrapper: Wrapper });
}

/**
 * Renders a page inside a real TanStack Router so `Link`, `useSearch`,
 * `useParams`, and `useRouterState` all resolve. The route tree mirrors the
 * paths declared in `App.tsx`; each route renders the supplied element, so a
 * test can mount one page at a chosen URL without booting the whole app.
 */
export function renderWithRouter(
  ui: ReactElement,
  initialPath = "/",
): ReturnType<typeof render> {
  const queryClient = createTestQueryClient();
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const paths = [
    "/",
    "/tata-tertib",
    "/jadwal",
    "/sparepart",
    "/sparepart/$id",
    "/trainer",
    "/trainer/$id",
    "/alat",
    "/alat/$id",
    "/pinjam-alat",
    "/peminjaman-lab",
    "/admin/login",
    "/admin",
    "/admin/peminjaman",
    "/admin/peminjaman-lab",
    "/admin/berita",
    "/admin/keuangan",
    "/admin/trainer",
    "/admin/alat",
    "/admin/sparepart",
    "/admin/jadwal",
  ];
  const routes = paths.map((path) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path,
      component: () => ui,
    }),
  );
  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
