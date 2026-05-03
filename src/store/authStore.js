// src/store/authStore.js
import { create } from 'zustand';

const TOKEN_KEY = 'azamed_token';
const USER_KEY  = 'azamed_user';

const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser  = (() => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
})();

const useAuthStore = create((set) => ({
  token:           storedToken || null,
  user:            storedUser  || null,
  isAuthenticated: !!storedToken && !!storedUser,

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

  // ✅ Met à jour uniquement la structure dans le store
  updateStructure: (structure) => {
    set((state) => {
      const updated = { ...state.user, structure };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return { user: updated };
    });
  },
}));

export default useAuthStore;
