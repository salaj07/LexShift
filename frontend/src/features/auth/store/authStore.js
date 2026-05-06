/**
 * @file src/features/auth/store/authStore.js
 * @description Zustand global auth state store.
 *
 * Session strategy:
 *  - On login/OTP verify → backend sets httpOnly JWT cookie (7d) + we store user in Zustand + sessionStorage
 *  - On app load → restoreSession() calls GET /auth/me to verify the cookie is still valid
 *  - On logout → POST /auth/logout clears the cookie server-side + we clear Zustand + sessionStorage
 *  - sessionStorage persists across page refreshes within the same tab
 *  - The /me call handles new tabs, cookie expiry, and cross-device sync
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getMe, logoutUser } from '../api/authApi';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // Called after login / OTP verify — stores user data
      setUser: (userData) => set({ user: userData, isAuthenticated: true }),

      // Called on app mount — verifies the httpOnly cookie with the backend.
      // If the cookie is valid, updates Zustand with fresh user data.
      // If expired/missing, clears any stale local state.
      restoreSession: async () => {
        try {
          const res = await getMe();
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          // Cookie missing or expired — clear stale state
          set({ user: null, isAuthenticated: false });
        }
      },

      // Clears the httpOnly cookie server-side + wipes local state
      logout: async () => {
        try {
          await logoutUser();
        } catch {
          // Even if the request fails, clear local state
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'lexshift-auth', // sessionStorage key
      storage: {
        getItem: (key) => {
          const val = sessionStorage.getItem(key);
          return val ? JSON.parse(val) : null;
        },
        setItem: (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
        removeItem: (key) => sessionStorage.removeItem(key),
      },
    }
  )
);

export default useAuthStore;

