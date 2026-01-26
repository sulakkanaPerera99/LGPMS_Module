<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const cards = ref([
  { id: 1, title: 'Request new application', route: '/request-new-sl-application' },
  { id: 2, title: 'Check Dues', route: '/check-dues' },
  { id: 3, title: 'Check Status', route: '/check-sl-cert-status' },
  { id: 4, title: 'Generate Certificate', route: '/generate-sl-certificate' },
  { id: 5, title: 'All Certificates', route: '/all-sl-certificates' },
  { id: 6, title: 'Report Generation', route: '/sl-report-generation' }
])

const navigateTo = (route) => {
  if (route) {
    router.push(route)
  }
}
</script>

<template>
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h2>Officer Dashboard</h2>
      <router-link to="/" class="back-link">Back to Home</router-link>
    </header>
    
    <div class="grid-layout">
      <div v-for="card in cards" :key="card.id" class="card" @click="navigateTo(card.route)">
        <h3>{{ card.title }}</h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-family: sans-serif;
}

.back-link {
  color: #42b883;
  text-decoration: none;
  font-weight: bold;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 25px;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 90px;
  width: 150px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: grab;
  color: #2c3e50;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
  border-color: #42b883;
  border-width: 2px;
}

.card h3 {
  font-size: 0.6rem;
  margin: 0 0 15px 0;
  font-weight: 400;
}

.card-action {
  align-self: flex-end;
  font-weight: bold;
  color: #42b883;
  font-size: 0.9rem;
}
</style>
