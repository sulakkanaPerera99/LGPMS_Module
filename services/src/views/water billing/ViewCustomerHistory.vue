<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const isHistoryVisible = ref(false)

const historyData = ref([
  {
    id: 1,
    billNumber: 'WB-1001',
    customerName: 'Kamal Perera',
    paymentDate: '2023-10-05',
    amountPaid: 150.00,
    paymentMethod: 'Cash',
    accountBalance: 0.00
  },
  {
    id: 2,
    billNumber: 'WB-1001',
    customerName: 'Kamal Perera',
    paymentDate: '2023-09-02',
    amountPaid: 1450.00,
    paymentMethod: 'Online',
    accountBalance: 2500.00
  },
  {
    id: 3,
    billNumber: 'WB-1001',
    customerName: 'Kamal Perera',
    paymentDate: '2023-08-04',
    amountPaid: 5000.00,
    paymentMethod: 'Cash',
    accountBalance: -2000.00
  },
  {
    id: 4,
    billNumber: 'WB-1001',
    customerName: 'Kamal Perera',
    paymentDate: '2023-07-05',
    amountPaid: 1300.00,
    paymentMethod: 'Online',
    accountBalance: -1200.00
  }
])

const searchHistory = () => {
  if (searchQuery.value.trim()) {
    // Simulate finding history
    isHistoryVisible.value = true
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>View Customer History</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <!-- Search Section -->
    <div class="card search-card">
      <div class="search-box">
        <label for="historySearch">Bill Number or NIC</label>
        <div class="input-group">
          <input 
            id="historySearch" 
            v-model="searchQuery" 
            type="text" 
            placeholder="Enter Bill Number or NIC" 
            @keyup.enter="searchHistory"
          />
          <button @click="searchHistory" class="search-btn">Search</button>
        </div>
      </div>
    </div>

    <!-- History Table Section -->
    <div v-if="isHistoryVisible" class="card table-card">
      <h4>Payment History</h4>
      <div class="table-responsive">
        <table class="history-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Customer Name</th>
              <th>Payment Date</th>
              <th>Amount Paid</th>
              <th>Payment Method</th>
              <th>Account Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in historyData" :key="record.id">
              <td>{{ record.billNumber }}</td>
              <td>{{ record.customerName }}</td>
              <td>{{ record.paymentDate }}</td>
              <td>{{ record.amountPaid.toFixed(2) }}</td>
              <td>{{ record.paymentMethod }}</td>
              <td :class="{ 'text-green': record.accountBalance > 0, 'text-red': record.accountBalance < 0 }">
                {{ record.accountBalance.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  font-size: 14px; /* Strict Requirement */
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
  font-size: 7px; /* Strict Requirement */
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
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
  font-size: 7px; /* Strict Requirement */
}

.search-btn:hover {
  background-color: #3aa876;
}

.table-responsive {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7px; /* Strict Requirement */
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
</style>
