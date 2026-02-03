<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Cards array එකට අදාළ Icons මම එකතු කළා. 
// ඔයාගේ project එකේ FontAwesome නැත්නම් install කරගන්න වෙයි, 
// නැත්නම් කලින් Navbar එකේ තිබ්බ විදියට මේ classes වැඩ කරයි.
const cards = ref([
  { id: 1, title: 'Water Projects', subtitle: 'Add & Manage Projects', route: '/manage-water-projects', icon: 'fas fa-project-diagram', color: '#007bff' },
  { id: 2, title: 'Add Billing Fees', subtitle: 'Add Tariffs & Slabs', route: '/add-billing-fees', icon: 'fas fa-file-invoice-dollar', color: '#28a745' },
  { id: 3, title: 'Edit Billing Fees', subtitle: 'Edit Tariffs & Slabs', route: '/edit-billing-fees', icon: 'fas fa-pen-to-square', color: '#28a745' },
  { id: 4, title: 'Register Customer', subtitle: 'New Connections', route: '/add-customer', icon: 'fas fa-user-plus', color: '#17a2b8' },
  { id: 5, title: 'Water Accounts', subtitle: 'Manage Accounts', route: '/manage-water-accounts', icon: 'fas fa-faucet', color: '#6610f2' },
  { id: 6, title: 'Meter Readings', subtitle: 'Add Manual Reading', route: '/add-meter-reading', icon: 'fas fa-tachometer-alt', color: '#fd7e14' },
  { id: 7, title: 'Bill Payment', subtitle: 'Add PIV Payments', route: '/bill-payment', icon: 'fas fa-credit-card', color: '#e83e8c' },
  { id: 8, title: 'Print Bill', subtitle: 'Generate & Print', route: '/print-bill', icon: 'fas fa-print', color: '#6c757d' },
  { id: 9, title: 'Reports', subtitle: 'Generate Insights', route: '/water-bill-report-generation', icon: 'fas fa-chart-line', color: '#20c997' },
  { id: 10, title: 'Customer History', subtitle: 'View Past Data', route: '/view-customer-history', icon: 'fas fa-history', color: '#ffc107' }
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
        <p class="sub-text">Welcome back! Select a module to proceed.</p>
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
/* Google Font එකක් import කරගන්න (Optional) */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.dashboard-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  /* පසුබිම ලස්සන වෙන්න පොඩි pattern එකක් */
  background-color: #f8f9fa; 
  border-radius: 20px;
  min-height: 80vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 20px;
}

.dashboard-header h2 {
  font-size: 1.8rem;
  color: #343a40;
  margin: 0;
  font-weight: 600;
}

.sub-text {
  color: #6c757d;
  margin-top: 5px;
  font-size: 0.9rem;
}

.back-link {
  color: #6c757d;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-link:hover {
  color: #550202; /* ඔයාගේ Theme color එක */
}

.grid-layout {
  display: grid;
  /* Cards වල size එක responsive විදියට හැදුවා */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
}

.card {
  background: rgba(255, 255, 255, 0.9); /* Glass Effect Base */
  border: 1px solid rgba(230, 230, 230, 0.8);
  border-radius: 16px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  height: 130px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  /* Industrial Styling: Soft Shadow */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  
  /* Smooth Transitions */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* Glassmorphism Hover Effect */
.card:hover {
  transform: translateY(-8px); /* උඩට එසවීම */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1); /* Shadow එක වැඩි කිරීම */
  border-color: var(--hover-color); /* අදාළ පාටින් border එක එනවා */
}

/* Hover වෙනකොට පසුබිම පොඩ්ඩක් පාට වෙනවා */
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
  opacity: 0.03; /* බොහොම සියුම් පාටක් */
}

.icon-wrapper {
  font-size: 2rem;
  margin-bottom: 15px;
  z-index: 1;
  transition: transform 0.3s;
}

.card:hover .icon-wrapper {
  transform: scale(1.1);
}

.card-content {
  z-index: 1;
  width: 100%;
}

.card h3 {
  font-size: 1.1rem;
  margin: 0;
  color: #343a40;
  font-weight: 600;
}

.card p {
  font-size: 0.8rem;
  color: #868e96;
  margin: 5px 0 0 0;
}

.go-arrow {
  position: absolute;
  bottom: 20px;
  right: 20px;
  color: #adb5bd;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.card:hover .go-arrow {
  opacity: 1;
  transform: translateX(0);
  color: var(--hover-color);
}
</style>