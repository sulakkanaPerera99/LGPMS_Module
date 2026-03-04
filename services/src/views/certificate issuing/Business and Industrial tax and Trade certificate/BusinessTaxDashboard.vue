<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// අලුත් Design එකට ගැලපෙන icons, subtitles සහ colors එකතු කළා
const cards = ref([
  { id: 1, title: 'Request New Application', subtitle: 'Submit New BT Application', route: '/request-new-bt-application', icon: 'fas fa-file-signature', color: '#007bff' },
  { id: 2, title: 'Pending Applications', subtitle: 'Review Waiting List', route: '/Pending-bt-applications', icon: 'fas fa-clock', color: '#ffc107' },
  { id: 3, title: 'Check Status', subtitle: 'Track Application Progress', route: '/check-bt-cert-status', icon: 'fas fa-search-location', color: '#17a2b8' },
  { id: 4, title: 'Generate Certificate', subtitle: 'Issue New Certificates', route: '/generate-bt-certificate', icon: 'fas fa-certificate', color: '#28a745' },
  { id: 5, title: 'All Certificates', subtitle: 'View Issued History', route: '/all-bt-certificates', icon: 'fas fa-folder-open', color: '#6610f2' },
  { id: 6, title: 'Report Generation', subtitle: 'Analytical Insights', route: '/bt-report-generation', icon: 'fas fa-chart-pie', color: '#e83e8c' }
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
      <div class="header-content">
        <h2>Officer Dashboard</h2>
        <p class="sub-text">Manage Business and Industrial Tax Certificates efficiently.</p>
      </div>
      <router-link to="/" class="back-link">
        <i class="fas fa-arrow-left"></i> Back to Home
      </router-link>
    </header>
    
    <div class="grid-layout">
      <div 
        v-for="card in cards" 
        :key="card.id" 
        class="card" 
        @click="navigateTo(card.route)"
        :style="{ '--hover-color': card.color }"
      >
        <div class="icon-wrapper" :style="{ color: card.color }">
          <i :class="card.icon"></i>
        </div>
        <div class="card-content">
          <h3>{{ card.title }}</h3>
          <p>{{ card.subtitle }}</p>
        </div>
        <div class="go-arrow">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.dashboard-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  background-color: #f8f9fa; 
  border-radius: 20px;
  min-height: 80vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 20px;
}

.dashboard-header h2 {
  font-size: 2.2rem;
  color: #343a40;
  margin: 0;
  font-weight: 600;
}

.sub-text {
  color: #6c757d;
  margin-top: 5px;
  font-size: 1rem;
}

.back-link {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #ddd;
}

.back-link:hover {
  color: #007bff;
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border: 1px solid #e6e6e6;
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  height: 110px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1); 
  border-color: var(--hover-color);
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--hover-color);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 0;
}

.card:hover::before {
  opacity: 0.03;
}

.icon-wrapper {
  font-size: 2.2rem;
  margin-right: 25px;
  z-index: 1;
  transition: transform 0.3s;
  width: 50px;
  text-align: center;
}

.card:hover .icon-wrapper {
  transform: scale(1.15);
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  z-index: 1;
}

.card h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #343a40;
  font-weight: 600;
}

.card p {
  font-size: 0.85rem;
  color: #6c757d;
  margin: 4px 0 0 0;
}

.go-arrow {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%) translateX(-10px);
  color: #adb5bd;
  opacity: 0;
  transition: all 0.3s;
}

.card:hover .go-arrow {
  opacity: 1;
  transform: translateY(-50%) translateX(0);
  color: var(--hover-color);
}
</style>