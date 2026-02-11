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
      <button @click="goBack" class="back-link-btn">← Back</button>
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
                
                <th class="reading-col">Prev<br>Read</th>
                <th class="reading-col">Curr<br>Read</th>
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
/* Layout Containers */
.page-container {
  padding: 15px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Segoe UI', sans-serif;
  color: #333;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}
.header-left h2 { margin: 0; font-size: 20px; color: #2c3e50; }
.sub-header { font-size: 13px; color: #7f8c8d; }

.back-link-btn {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  color: #555;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}
.back-link-btn:hover { background: #e9ecef; color: #333; }

/* Customer Summary Card */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 15px;
  border: 1px solid #eaeaea;
}
.summary-card { padding: 15px; background: #fdfdfd; }
.info-row { display: flex; gap: 30px; flex-wrap: wrap; }
.info-group { display: flex; flex-direction: column; }
.label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 3px; }
.value { font-size: 14px; font-weight: 500; color: #2c3e50; }

/* Table Section */
.table-card { padding: 0; overflow: hidden; } /* Remove padding for edge-to-edge table */
h4 {
  margin: 15px 15px 10px;
  font-size: 15px;
  color: #42b883;
  font-weight: 600;
}

.table-wrapper {
  width: 100%;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

/* Table Headers */
.history-table th {
  background: #f8f9fa;
  color: #555;
  font-weight: 600;
  padding: 10px 8px;
  text-align: right; /* Default align right for numbers */
  border-bottom: 1px solid #eee;
  font-size: 12px;
}
.history-table th.date-col { text-align: left; width: 15%; }
.history-table th.reading-col { width: 10%; background: #f1f8e9; } /* Subtle green tint for readings */
.history-table th.units-col { width: 8%; background: #f1f8e9; font-weight: bold; }
.history-table th.money-col { width: 14%; }

/* Table Cells */
.history-table td {
  padding: 8px;
  border-bottom: 1px solid #f5f5f5;
  text-align: right;
  vertical-align: middle;
}
.history-table td.date-cell { text-align: left; color: #666; font-weight: 500; }
.history-table td.reading-cell { color: #555; }
.history-table td.units-cell { font-weight: bold; color: #2c3e50; }
.money-cell { font-family: 'Consolas', monospace; letter-spacing: -0.5px; }

/* Colors */
.text-green { color: #27ae60; font-weight: bold; }
.text-red { color: #c0392b; }

.empty-state { text-align: center; padding: 20px; color: #999; font-style: italic; }

/* Loading */
.loading-state { text-align: center; padding: 40px; color: #888; }
.spinner { 
    display: inline-block; width: 12px; height: 12px; 
    border: 2px solid #ccc; border-top-color: #42b883; 
    border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive Tweaks for very small screens */
@media (max-width: 600px) {
  .info-row { flex-direction: column; gap: 10px; }
  .history-table th, .history-table td { padding: 6px 4px; font-size: 11px; }
  .history-table th.reading-col { display: none; } /* Hide Previous Reading on mobile if needed */
  .history-table td.reading-cell:nth-child(2) { display: none; }
}
</style>