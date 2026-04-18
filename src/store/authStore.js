// src/store/authStore.js
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('azamed_user') || 'null'),
  token: localStorage.getItem('azamed_token') || null,
  isAuthenticated: !!localStorage.getItem('azamed_token'),

  login: (user, token) => {
    localStorage.setItem('azamed_token', token);
    localStorage.setItem('azamed_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('azamed_token');
    localStorage.removeItem('azamed_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  updateUser: (user) => {
    localStorage.setItem('azamed_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
