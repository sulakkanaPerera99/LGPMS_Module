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
  if (!dateString) return '-';
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
      <div class="header-left">
         <h2>Payment History</h2>
         <span class="sub-header">Account: {{ selectedCustomer.newBillNumber || 'Loading...' }}</span>
      </div>
      <button @click="goBack" class="back-link-btn">Back to List</button>
    </header>

    <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div> Loading History...
    </div>

    <div v-else>
      <div class="card summary-card">
        <div class="info-row">
           <div class="info-group">
             <span class="label">Customer Name</span>
             <span class="value">{{ selectedCustomer.fullName }}</span>
           </div>
           <div class="info-group">
             <span class="label">NIC Number</span>
             <span class="value">{{ selectedCustomer.nic }}</span>
           </div>
           <div class="info-group">
             <span class="label">Address</span>
             <span class="value">{{ selectedCustomer.mailingAddress || '-' }}</span>
           </div>
        </div>
      </div>

      <div class="card table-card">
        <h4>Reading & Payment Records</h4>
        <div class="table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th class="date-col">Paid Date</th>
                <th class="reading-col">Prev Read</th>
                <th class="reading-col">Curr Read</th>
                <th class="units-col">Units</th>
                <th class="money-col">Bill Total</th>
                <th class="money-col">Paid Amt</th>
                <th class="money-col">Prev Due</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="hist in customerHistory" :key="hist.id">
                <td class="date-cell">{{ formatDate(hist.paidDate) }}</td>
                <td class="reading-cell">{{ hist.previousReading }}</td>
                <td class="reading-cell">{{ hist.currentReading }}</td>
                <td class="units-cell">{{ hist.unitsConsumed }}</td>
                <td class="money-cell">{{ Number(hist.totalAmount).toFixed(2) }}</td>
                <td class="money-cell text-green">{{ Number(hist.paidAmount).toFixed(2) }}</td>
                <td class="money-cell text-red">{{ Number(hist.previousDues).toFixed(2) }}</td>
              </tr>
              <tr v-if="customerHistory.length === 0">
                <td colspan="7" class="empty-state">No payment records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main Container */
.page-container {
  padding: 15px !important;
  max-width: 1000px !important;
  margin: 0 auto !important;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
  color: #333 !important;
}

/* Header */
.page-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 20px !important;
  border-bottom: 2px solid #f0f0f0 !important;
  padding-bottom: 10px !important;
}

.header-left h2 { 
  margin: 0 !important; 
  font-size: 22px !important; 
  color: #2c3e50 !important; 
}

.sub-header { 
  font-size: 14px !important; 
  color: #7f8c8d !important; 
}

.back-link-btn {
  background: #f8f9fa !important;
  border: none !important;
  padding: 6px 15px !important;
  color: #27ae60 !important;
  cursor: pointer !important;
  font-size: 14px !important;
  font-weight: bold !important;
}

/* Cards */
.card {
  background: white !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
  margin-bottom: 20px !important;
  border: 1px solid #eaeaea !important;
}

.summary-card { 
  padding: 20px !important; 
}

.info-row { 
  display: flex !important; 
  gap: 40px !important; 
  flex-wrap: wrap !important; 
}

.info-group { 
  display: flex !important; 
  flex-direction: column !important; 
}

.label { 
  font-size: 11px !important; 
  color: #95a5a6 !important; 
  text-transform: uppercase !important; 
  font-weight: bold !important; 
  margin-bottom: 5px !important; 
}

.value { 
  font-size: 15px !important; 
  font-weight: 600 !important; 
  color: #34495e !important; 
}

/* Table Style */
.table-card h4 {
  margin: 15px 20px !important;
  color: #2c3e50 !important;
  font-size: 16px !important;
}

.table-wrapper {
  padding: 0 15px 15px 15px !important;
}

.history-table {
  width: 100% !important;
  border-collapse: collapse !important; 
  font-size: 13px !important;
  border: 1px solid #4d555c !important;
}

.history-table th {
  background: #bcccdc !important;
  color: #2c3e50 !important;
  font-weight: bold !important;
  padding: 12px 10px !important;
  text-align: right !important;
  border: 1px solid #dee2e6 !important;
}

.history-table th.date-col { text-align: left !important; }

.history-table td {
  padding: 12px 10px !important;
  border: 1px solid #dee2e6 !important; 
  text-align: right !important;
  font-weight: 500 !important;
}

.history-table td.date-cell { text-align: left !important; font-weight: bold !important; }

.history-table tbody tr:hover {
  background-color: #f1f8f5 !important;
}

/* Colors & Helpers */
.text-green { color: #27ae60 !important; font-weight: bold !important; }
.text-red { color: #e74c3c !important; font-weight: bold !important; }
.empty-state { text-align: center !important; padding: 30px !important; color: #95a5a6 !important; }

/* Loading State */
.loading-state { text-align: center !important; padding: 50px !important; font-weight: bold !important; }
.spinner { 
  display: inline-block !important; width: 20px !important; height: 20px !important; 
  border: 3px solid #f3f3f3 !important; border-top: 3px solid #42b883 !important; 
  border-radius: 50% !important; animation: spin 1s linear infinite !important;
}

@keyframes spin { to { transform: rotate(360deg) !important; } }
</style>