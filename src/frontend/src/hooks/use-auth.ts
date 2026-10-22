import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError?: Error;
  isAdmin: boolean;
  isRoleLoading: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
}

/**
 * Autentikasi akun bawaan (username/password) melalui backend.
 * Sesi diverifikasi lewat `getSession` dan peran lewat `isCallerAdmin`,
 * sehingga status tetap benar setelah halaman dimuat ulang.
 */
export function useAuth(): AuthState {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSession();
    },
    enabled: !!actor && !isFetching,
  });

  const adminQuery = useQuery<boolean>({
    queryKey: ["is-admin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });

  const loginMutation = useMutation({
    mutationFn: async (input: { username: string; password: string }) => {
      if (!actor) throw new Error("Backend belum siap");
      const result = await actor.login(input.username, input.password);
      if (result.__kind__ === "invalidCredentials") {
        throw new Error("Username atau password salah.");
      }
      return result.ok;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      void queryClient.invalidateQueries({ queryKey: ["is-admin"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.logout();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["session"] });
      void queryClient.invalidateQueries({ queryKey: ["is-admin"] });
    },
  });

  const isAuthenticated = !!sessionQuery.data;

  return {
    isAuthenticated,
    isInitializing: sessionQuery.isLoading,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error ?? undefined,
    isAdmin: isAuthenticated && (adminQuery.data ?? false),
    isRoleLoading: isAuthenticated && adminQuery.isLoading,
    login: (username: string, password: string) =>
      loginMutation.mutate({ username, password }),
    logout: () => logoutMutation.mutate(),
  };
}
