// src/store/authStore.js — conserve les modules dans la structure
import { create } from 'zustand';

const TOKEN_KEY     = 'azamed_token';
const USER_KEY      = 'azamed_user';

// Lire depuis localStorage au démarrage
const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser  = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
})();

const useAuthStore = create((set) => ({
  token:           storedToken || null,
  user:            storedUser  || null,
  isAuthenticated: !!storedToken && !!storedUser,

  // ✅ login reçoit user avec structure.modules inclus
  login: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user });
  },

  updateStructure: (structure) => {
    set((state) => {
      const updated = { ...state.user, structure };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return { user: updated };
    });
  },
}));

export default useAuthStore;
