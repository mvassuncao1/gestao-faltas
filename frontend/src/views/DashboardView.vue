<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

async function logout() {
  await auth.logout();
  router.push('/login');
}
</script>

<template>
  <section class="page-shell">
    <div class="card">
      <h1>Bem-vindo, {{ auth.user?.name }}</h1>
      <p>Você está autenticado como <strong>{{ auth.user?.email }}</strong>.</p>
      <div class="info-block">
        <p><strong>Perfil:</strong> {{ auth.user?.role }}</p>
      </div>
      <button @click="logout">Sair</button>
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
  width: min(520px, 100%);
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
  margin: 0 0 1rem;
  color: #475569;
}

.info-block {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 1rem;
  background: #f8fafc;
}

button {
  border: none;
  border-radius: 0.9rem;
  background: #2563eb;
  color: white;
  font-size: 1rem;
  padding: 0.95rem 1rem;
  cursor: pointer;
}
</style>
