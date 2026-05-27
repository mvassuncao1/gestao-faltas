import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

type User = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') ?? '');
  const user = ref<User | null>(JSON.parse(localStorage.getItem('auth_user') ?? 'null'));
  const isLoggedIn = computed(() => !!token.value);

  function setAuth(data: { accessToken: string; user: User }) {
    token.value = data.accessToken;
    user.value = data.user;
    localStorage.setItem('auth_token', token.value);
    localStorage.setItem('auth_user', JSON.stringify(user.value));
  }

  async function refreshAuth() {
    try {
      const body = await (await import('../services/api')).refreshRequest();
      setAuth({ accessToken: body.accessToken, user: body.user });
      return true;
    } catch (e) {
      logout();
      return false;
    }
  }

  async function logoutRemote() {
    try {
      await (await import('../services/api')).logoutRequest();
    } catch (e) {
      // ignore
    }
    logout();
  }

  function logout() {
    token.value = '';
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  return { token, user, isLoggedIn, setAuth, logout };
});
