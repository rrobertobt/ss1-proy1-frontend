export const COOKIE_ACCESS_TOKEN_KEY = 'bpmn-access-token'
export const COOKIE_REFRESH_TOKEN_KEY = 'bpmn-refresh-token'
export const COOKIE_USER_KEY = 'bpmn-user'

export default defineNuxtPlugin(() => {
  const accessCookie = useCookie(COOKIE_ACCESS_TOKEN_KEY, {
    // path: '/',
    // sameSite: true,
    // maxAge: 60 * 60 * 24 * 7 /* 7 days */
  })
  const refreshCookie = useCookie(COOKIE_REFRESH_TOKEN_KEY, {
    // path: '/',
    // sameSite: true,
    // maxAge: 60 * 60 * 24 * 30 /* 30 days */
  })
  return {
    provide: {
      authCookie: {
        // Backward-compat API (maps to access token)
        getToken: () => accessCookie.value || null,
        setToken: (token?: string | null) => { accessCookie.value = token },
        removeToken: () => { accessCookie.value = null },

        // New API for access/refresh tokens
        getAccessToken: () => accessCookie.value || null,
        setAccessToken: (token?: string | null) => { accessCookie.value = token },
        removeAccessToken: () => { accessCookie.value = null },

        getRefreshToken: () => refreshCookie.value || null,
        setRefreshToken: (token?: string | null) => { refreshCookie.value = token },
        removeRefreshToken: () => { refreshCookie.value = null },

        clearAll: () => {
          accessCookie.value = null
          refreshCookie.value = null
        },
      }
    }
  }
})

