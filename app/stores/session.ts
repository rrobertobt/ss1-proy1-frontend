import { defineStore } from "pinia";
import { COOKIE_USER_KEY } from "~/plugins/01.authCookie";
import { $api } from "~/utils/plain-fetch";
import { FetchError } from "ofetch";

export interface LoginResponse {
  success: boolean;
  message: string;
  data: Data;
  timestamp: Date;
}

export interface Data {
  accessToken: string;
  refreshToken: string;
  user: User;
  requires2fa: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  is2faEnabled: boolean;
}

export const useSessionStore = defineStore("session", () => {
  const session = ref<User | null>(null);
  // const toast = useToastService()
  const loading = ref(false);
  const userCookie = useCookie<User | null>(COOKIE_USER_KEY);

  const login = async (credentials: { login: string; password: string }) => {
    const { login, password } = credentials;
    loading.value = true;
    try {
      const { setAccessToken, setRefreshToken } = useNuxtApp().$authCookie;
      const response = await $api<LoginResponse>("/auth/login", {
        method: "POST",
        body: { login, password },
      });

      // New API shape
      const accessToken = response?.data?.accessToken;
      const refreshToken = response?.data?.refreshToken;
      const user = response?.data?.user;

      if (accessToken && refreshToken) {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
      }

      // Normalize and set session from login response (no /me endpoint now)
      session.value = user;
      userCookie.value = user;

      // toast.add({
      //   severity: 'success',
      //   summary: 'Sesión',
      //   detail: 'Sesión iniciada correctamente',
      //   life: 3000
      // })
      const role = response?.data?.user?.userType;

      switch (role) {
        case "Cliente":
          navigateTo("/me");
          break;
        case "Administrador":
          navigateTo("/admin");
          break;
      }

      return response;
    } catch (err) {
      // toast.add({
      //   severity: 'error',
      //   summary: 'Sesión',
      //   detail: error.data?.message ?? error.name,
      //   life: 3000
      // })
      const error = err as FetchError;
      console.error("Login error:", error);
      return {
        error: error?.data,
      };
    } finally {
      loading.value = false;
    }
  };

  const recoverSession = async () => {
    loading.value = true;
    try {
      const { getAccessToken, getRefreshToken, getToken } =
        useNuxtApp().$authCookie;
      const access = getAccessToken?.() ?? getToken?.();
      const refresh = getRefreshToken?.();
      if (!access && !refresh) return;

      // No /me endpoint anymore: rehydrate from cookie if present.
      if (userCookie.value) {
        session.value = userCookie.value;
        return session.value;
      }

      // If we have only refresh, a request will auto-refresh when needed via interceptor.
      // Without a /me endpoint we cannot fetch user here.
      return null;
    } catch (error) {
      // toast.add({
      //   severity: "error",
      //   summary: "Sesión",
      //   detail:
      //     "No se pudo recuperar la sesión. Intenta iniciar sesión nuevamente",
      //   life: 3000,
      // });

      return {
        error: error?.data?.message ?? error?.message ?? error?.name,
      };
    } finally {
      loading.value = false;
    }
  };

  const fetchUserData = async () => {
    // No /me endpoint: simply return current session (rehydrated on login/recover)
    return session.value;
  };

  const logout = () => {
    navigateTo("/login");
    session.value = null;
    const { clearAll, removeToken } = useNuxtApp().$authCookie;
    // Prefer clearing both tokens; fallback to old API if present
    if (clearAll) clearAll();
    else removeToken?.();
    userCookie.value = null;
    // toast.add({
    //   severity: "success",
    //   summary: "Sesión",
    //   detail: "Sesión cerrada correctamente",
    //   life: 3000,
    // });
  };

  return {
    session,
    loading,
    login,
    logout,
    recoverSession,
    fetchUserData,
  };
});
