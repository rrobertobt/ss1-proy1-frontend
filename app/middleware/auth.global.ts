import { storeToRefs } from "pinia";
import { useSessionStore } from "~/stores/session";

export default defineNuxtRouteMiddleware((to) => {
  const store = useSessionStore();
  const { session, role } = storeToRefs(store);

  const protectedPrefixes = ["/admin", "/me"];
  const isProtectedRoute = protectedPrefixes.some((p) => to.path.startsWith(p));

  // Not authenticated trying to access protected routes
  if (!session.value && isProtectedRoute) {
    return navigateTo("/login");
  }

  if (session.value) {
    // Redirect away from login if already authenticated
    if (to.path.startsWith("/login")) {
      return navigateTo(role.value ? `/${role.value}` : "/");
    }

    // Ensure user stays within their role namespace when visiting protected routes
    const expectedPrefix = role.value ? `/${role.value}` : null;
    if (expectedPrefix && isProtectedRoute && !to.path.startsWith(expectedPrefix)) {
      return navigateTo(expectedPrefix);
    }
  }
});
