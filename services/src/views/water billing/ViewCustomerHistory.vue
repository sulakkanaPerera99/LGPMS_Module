<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'

const route = useRoute()

const searchQuery = ref('')
const isHistoryVisible = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const historyData = ref([])

// Fetch history function
const fetchHistory = async (term) => {
  if (!term) return;

  isLoading.value = true;
  isHistoryVisible.value = false;
  errorMessage.value = '';
  historyData.value = [];

  try {
    // The backend now accepts NIC, Bill No, or ID in this same endpoint
    const response = await axios.get(`/payment-history/${term}`);
    
    if (response.data.success) {
      historyData.value = response.data.data;
      isHistoryVisible.value = true;
    } else {
      errorMessage.value = "Failed to load history data.";
    }
  } catch (error) {
    console.error("API Error:", error);
    // Show the specific error message from backend (e.g. "No customer found...")
    errorMessage.value = error.response?.data?.message || "An error occurred while fetching data.";
  } finally {
    isLoading.value = false;
  }
}

// Search handler
const searchHistory = () => {
  if (searchQuery.value.trim()) {
    fetchHistory(searchQuery.value.trim());
  }
}

onMounted(() => {
  if (route.params.accountId) {
    searchQuery.value = route.params.accountId;
    fetchHistory(route.params.accountId);
  }
})

const formatDate = (dateString) => {
  if (!dateString) return 'Pending';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA'); 
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>View Customer History</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="card search-card">
      <div class="search-box">
        <label for="historySearch">Search Customer</label>
        <div class="input-group">
          <input 
            id="historySearch" 
            v-model="searchQuery" 
            type="text" 
            placeholder="Enter NIC, Bill Number, or Account ID" 
            @keyup.enter="searchHistory"
          />
          <button @click="searchHistory" class="search-btn" :disabled="isLoading">
            {{ isLoading ? 'Searching...' : 'Search' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="errorMessage" class="alert alert-danger mt-3">
      {{ errorMessage }}
    </div>

    <div v-if="isLoading" class="loading-state">
      <p>Searching records...</p>
    </div>

    <div v-if="isHistoryVisible && !isLoading" class="card table-card mt-3">
      <h4>Payment History</h4>
      
      <div v-if="historyData.length > 0" class="customer-badge">
         Showing history for: <strong>{{ historyData[0].full_name }}</strong>
      </div>

      <div v-if="historyData.length === 0" class="no-records">
        No payment records found for this customer.
      </div>

      <div v-else class="table-responsive">
        <table class="history-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Payment Date</th>
              <th>Amount Paid (LKR)</th>
              <th>Balance Due (LKR)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in historyData" :key="record.id">
              <td>{{ record.bill_number }}</td>
              <td>
                <span :class="{'badge-pending': !record.paid_date}">
                  {{ formatDate(record.paid_date) }}
                </span>
              </td>
              <td>{{ record.paid_amount ? Number(record.paid_amount).toFixed(2) : '0.00' }}</td>
              <td :class="{ 'text-green': record.remaining_due <= 0, 'text-red': record.remaining_due > 0 }">
                {{ Number(record.remaining_due).toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>

.customer-badge {
    background-color: #e8f8f5;
    color: #2c3e50;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 12px;
    border-left: 4px solid #42b883;
}

.btn-select {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
}
.btn-select:hover {
    background-color: #2980b9;
}
.badge-account {
    background-color: #e8f8f5;
    color: #16a085;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: bold;
    margin-left: 10px;
}
.btn-secondary {
    background-color: #95a5a6;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.customer-badge {

    background-color: #e8f8f5;

    color: #2c3e50;

    padding: 10px;

    border-radius: 4px;

    margin-bottom: 15px;

    font-size: 12px;

    border-left: 4px solid #42b883;

}



.page-container {

  padding: 20px;

  max-width: 1000px;

  margin: 0 auto;

  font-family: sans-serif;

}



.page-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 20px;

  border-bottom: 1px solid #e0e0e0;

  padding-bottom: 10px;

}



.back-link {

  color: #42b883;

  text-decoration: none;

  font-weight: bold;

  font-size: 10px;

}



.card {

  background: #ffffff;

  border: 1px solid #e0e0e0;

  border-radius: 8px;

  padding: 20px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  margin-bottom: 20px;

}



h4 {

  margin-top: 0;

  color: #2c3e50;

  border-bottom: 2px solid #42b883;

  display: inline-block;

  padding-bottom: 5px;

  margin-bottom: 20px;

  font-size: 14px;

}



.search-box {

  display: flex;

  flex-direction: column;

  gap: 5px;

  max-width: 300px;

}



.input-group {

  display: flex;

  gap: 10px;

}



label {

  font-weight: 600;

  color: #2c3e50;

  font-size: 7px;

}



input {

  padding: 8px;

  border: 1px solid #ccc;

  border-radius: 4px;

  font-size: 7px;

  flex: 1;

}



input:focus {

  outline: none;

  border-color: #42b883;

}



.search-btn {

  background-color: #42b883;

  color: white;

  border: none;

  padding: 8px 15px;

  border-radius: 4px;

  cursor: pointer;

  font-weight: bold;

  font-size: 7px;

}



.search-btn:hover:not(:disabled) {

  background-color: #3aa876;

}



.search-btn:disabled {

  background-color: #a0dcc0;

  cursor: not-allowed;

}



.table-responsive {

  overflow-x: auto;

}



.history-table {

  width: 100%;

  border-collapse: collapse;

  font-size: 7px;

}



.history-table th,

.history-table td {

  text-align: left;

  padding: 10px;

  border-bottom: 1px solid #eee;

  color: #2c3e50;

}



.history-table th {

  background-color: #f8f9fa;

  font-weight: 600;

}



.history-table tr:hover {

  background-color: #f9f9f9;

}



.text-green {

  color: #27ae60 !important;

  font-weight: bold;

}



.text-red {

  color: #e74c3c !important;

  font-weight: bold;

}



.loading-state, .no-records {

  text-align: center;

  padding: 20px;

  color: #666;

  font-size: 12px;

}



.alert-danger {

  color: #721c24;

  background-color: #f8d7da;

  border-color: #f5c6cb;

  padding: 10px;

  border-radius: 4px;

  font-size: 12px;

}



.badge-pending {

  background-color: #f39c12;

  color: white;

  padding: 2px 6px;

  border-radius: 4px;

  font-size: 6px;

}

</style>