import {
  COOKIE_ACCESS_TOKEN_KEY,
  COOKIE_REFRESH_TOKEN_KEY,
} from "~/plugins/01.authCookie";

const baseURL = `${import.meta.env.VITE_API_HOST}:${
  import.meta.env.VITE_API_PORT
}${import.meta.env.VITE_API_BASE_URL}` as string;

let refreshingPromise: Promise<void> | null = null;

const allowedEndpoints = ["/auth/login", "/auth/refresh-token", "/auth/register", "/auth/verify-email"];

async function refreshTokens() {
  if (!refreshingPromise) {
    const refreshToken = useCookie(COOKIE_REFRESH_TOKEN_KEY).value;
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const refreshUrl = `${baseURL}/auth/refresh-token`;

    refreshingPromise = $fetch(refreshUrl, {
      method: "POST",
      body: { refreshToken },
    })
      .then((res: any) => {
        const newAccess = res?.data?.accessToken;
        const newRefresh = res?.data?.refreshToken;
        if (!newAccess || !newRefresh) {
          throw new Error("Invalid refresh response");
        }
        const { setAccessToken, setRefreshToken } = useNuxtApp()
          .$authCookie as any;
        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
      })
      .catch((err) => {
        const { clearAll } = useNuxtApp().$authCookie as any;
        clearAll?.();
        throw err;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }

  return refreshingPromise;
}

export const $api = $fetch.create({
  baseURL: baseURL,
  onRequest({ options }) {
    const accessToken = useCookie(COOKIE_ACCESS_TOKEN_KEY).value;
    if (accessToken) {
      options.headers.set("Authorization", `Bearer ${accessToken}`);
    } else {
      options.headers.delete("Authorization");
    }
  },
  async onResponseError(ctx) {
    const status = ctx.response?.status;
    if (status === 401 && !allowedEndpoints.includes(ctx.request.toString().replace(baseURL, ''))) {
      try {
        await refreshTokens();
        // Retry original request with updated tokens; keep typings by returning the promise
        await $api(ctx.request, ctx.options);
      } catch (_e) {
        // Let caller handle unauthorized after failed refresh
        // throw ctx.error;
      }
    }
    // throw ctx.error;
  },
  // onResponse(){}
});
