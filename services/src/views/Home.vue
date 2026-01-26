<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)

const navigateToDashboard = () => {
  router.push('/officer-dashboard')
}

const openCertificateModal = () => {
  showModal.value = true
}

const navigateToTax = (type) => {
  showModal.value = false
  if (type === 'business') {
    router.push('/tax/business')
  }else if (type === 'street') {
    router.push('/tax/street')
}
}
</script>

<template>
  <div class="home-container">
    <h1>Municipal Service Portal</h1>
    <div class="button-group">
      <button @click="navigateToDashboard" class="main-btn">Water Bill Payment</button>
      <button @click="openCertificateModal" class="main-btn">Certificate Issuing</button>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h4>Select Certificate Type</h4>
        <div class="modal-actions">
          <button @click="navigateToTax('business')" class="modal-btn">Business and Industrial Tax Certificate/Trade Certificate</button>
          <button @click="navigateToTax('street')" class="modal-btn">Street Line Certificate</button>
        </div>
        <button @click="showModal = false" class="close-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 20px;
  margin-top: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.main-btn {
  padding: 15px 30px;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.main-btn:hover {
  background-color: #33a06f;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  color: #333;
  max-width: 350px;
  max-height: 300px;
  width: 70%;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 25px 0;
}

.modal-btn {
  padding: 8px 20px;
  cursor: pointer;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 0.6rem;
  transition: background-color 0.2s;
}

.modal-btn:hover {
  background-color: #2c3e50;
}

.close-btn {
  background: transparent;
  border: 1px solid #ccc;
  padding: 4px 14px;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
}

.close-btn:hover {
  background-color: #f5f5f5;
}
</style>
