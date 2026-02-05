// each customer payment history page

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const accountId = route.params.id
const isLoading = ref(true)
const selectedCustomer = ref({})
const customerHistory = ref([])

onMounted(async () => {
  if (accountId) {
    await fetchCustomerHistory(accountId);
  } else {
    alert("Invalid Account ID");
    router.back();
  }
});

const fetchCustomerHistory = async (id) => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/customer-payment-history/${id}`);
    if (response.data.success) {
      selectedCustomer.value = response.data.data.customer;
      customerHistory.value = response.data.data.history;
    }
  } catch (error) {
    console.error("Error fetching specific history:", error);
    alert("Failed to load payment details.");
  } finally {
    isLoading.value = false;
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not Paid';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA'); 
}

const goBack = () => {
  router.back();
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>Payment History Details</h2>
      <button @click="goBack" class="back-link-btn">← Back to List</button>
    </header>

    <div v-if="isLoading" class="loading-state">Loading History Data...</div>

    <div v-else>
      <div class="card summary-card">
        <h4>Customer Information</h4>
        <div class="customer-info-grid">
           <div class="info-item">
             <span class="label">Name:</span>
             <span class="value">{{ selectedCustomer.fullName }}</span>
           </div>
           <div class="info-item">
             <span class="label">NIC:</span>
             <span class="value">{{ selectedCustomer.nic }}</span>
           </div>
           <div class="info-item">
             <span class="label">Bill No:</span>
             <span class="value new-bill">{{ selectedCustomer.newBillNumber }}</span>
           </div>
           <div class="info-item">
             <span class="label">Address:</span>
             <span class="value">{{ selectedCustomer.mailingAddress || 'N/A' }}</span>
           </div>
        </div>
      </div>

      <div class="card">
        <h4>Payment Records</h4>
        <div class="table-responsive">
          <table class="accounts-table">
            <thead>
              <tr>
                <th>Paid Date</th>
                <th>Total Amount (LKR)</th>
                <th>Paid Amount (LKR)</th>
                <th>Previous Dues (LKR)</th>
                <th>Current Balance (LKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hist in customerHistory" :key="hist.id">
                <td>{{ formatDate(hist.paidDate) }}</td>
                <td>{{ Number(hist.totalAmount).toFixed(2) }}</td>
                <td class="text-green">{{ Number(hist.paidAmount).toFixed(2) }}</td>
                <td class="text-red">{{ Number(hist.previousDues).toFixed(2) }}</td>
                <td class="text-red">{{ Number(hist.currentBalance).toFixed(2) }}</td>
              </tr>
              <tr v-if="customerHistory.length === 0">
                <td colspan="4" style="text-align:center; padding: 20px;">No payment records found for this customer.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 1200px;
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

h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 24px;
}

h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  display: inline-block;
  padding-bottom: 5px;
  font-size: 16px;
}

.back-link-btn {
  background: none;
  border: none;
  color: #42b883;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
}

.back-link-btn:hover {
  text-decoration: underline;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.summary-card {
  background-color: #fcfcfc;
}

/* Customer Info Grid */
.customer-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 15px;
  color: #2c3e50;
  font-weight: 500;
}

.new-bill {
  font-weight: bold;
  color: #2c3e50;
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 800px;
}

.accounts-table th, .accounts-table td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
  vertical-align: top;
}

.accounts-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.accounts-table tr:hover {
  background-color: #f9f9f9;
}

.text-green { color: #27ae60; font-weight: bold; }
.text-red { color: #c0392b; font-weight: bold; }

.loading-state {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #42b883;
  font-weight: bold;
}
</style>