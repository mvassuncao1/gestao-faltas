<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { loginRequest } from '../services/api';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;

  try {
    const result = await loginRequest(email.value, password.value);
    authStore.setAuth({ accessToken: result.accessToken, user: result.user });
    await router.push('/dashboard');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Erro inesperado ao tentar entrar.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="page-shell">
    <div class="card">
      <h1>Entrar</h1>
      <p>Use o usuário administrativo para testes: admin@loja.com / Admin123</p>

      <form @submit.prevent="submit">
        <label>
          E-mail
          <input v-model="email" type="email" placeholder="seu@dominio.com" required />
        </label>

        <label>
          Senha
          <input v-model="password" type="password" placeholder="********" required minlength="6" />
        </label>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <p class="error" v-if="error">{{ error }}</p>
      </form>
    </div>
  </section>
</template>

<style scoped>
.page-shell {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 2rem;
}

.card {
  width: min(420px, 100%);
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 18px 50px rgba(16, 24, 40, 0.12);
}

h1 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
}

p {
  margin: 0 0 1.5rem;
  color: #475569;
}

label {
  display: grid;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

input {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  font-size: 1rem;
  outline: none;
}

button {
  width: 100%;
  border: none;
  border-radius: 0.9rem;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  padding: 0.95rem 1rem;
  cursor: pointer;
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #b91c1c;
}
</style>
