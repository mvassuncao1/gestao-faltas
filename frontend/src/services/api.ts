const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function loginRequest(email: string, password: string) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Falha ao fazer login.');
  }

  return response.json();
}

export async function refreshRequest() {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Falha ao atualizar token.');
  }

  return response.json();
}

export async function logoutRequest() {
  const response = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Falha ao sair.');
  }

  return response.json();
}

export async function authFetch(input: RequestInfo, init: RequestInit = {}) {
  init = { ...(init || {}), credentials: 'include' };

  const getToken = () => localStorage.getItem('auth_token') ?? '';
  const setToken = (t: string) => localStorage.setItem('auth_token', t);
  const setUser = (u: any) => localStorage.setItem('auth_user', JSON.stringify(u));

  const headers = new Headers(init.headers as HeadersInit || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  init.headers = headers;

  let res = await fetch(input, init);
  if (res.status === 401) {
    try {
      const body = await refreshRequest();
      if (body?.accessToken) {
        setToken(body.accessToken);
        setUser(body.user);
        headers.set('Authorization', `Bearer ${body.accessToken}`);
        init.headers = headers;
        res = await fetch(input, init);
      }
    } catch (e) {
      // refresh failed
    }
  }

  return res;
}
