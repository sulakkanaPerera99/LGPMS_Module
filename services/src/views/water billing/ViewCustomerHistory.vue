<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router' // Router import

const router = useRouter()

// 1. Data Storage
const accounts = ref([])
const currentSabha = ref('')
const isLoading = ref(false)

// 2. Search & Sort State
const searchQuery = ref('')
const sortBy = ref('name_asc')

// 3. Filter State
const isFilterDialogOpen = ref(false)
const activeFilters = reactive({
  connectionTypes: [],
  samurdhi: [],
  metered: [],
  status: []
})

// 4. Fetch Data on Load
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;
    if (currentSabha.value) {
      await fetchAccounts();
    } else {
      alert("Session Error: Sabha Code not found.");
    }
  } else {
    alert("Session Expired. Please login again.");
  }
});

watch(searchQuery, () => fetchAccounts(), { immediate: false });
watch(sortBy, () => fetchAccounts(), { immediate: false });
watch(activeFilters, () => fetchAccounts(), { deep: true, immediate: false });

const fetchAccounts = async () => {
  isLoading.value = true;
  try {
    const params = {};
    if (searchQuery.value && searchQuery.value.trim()) params.search = searchQuery.value.trim();
    if (sortBy.value) params.sort = sortBy.value;
    if (activeFilters.connectionTypes?.length) params.connectionTypes = activeFilters.connectionTypes.join(',');
    if (activeFilters.samurdhi?.length) params.samurdhi = activeFilters.samurdhi.join(',');
    if (activeFilters.metered?.length) params.metered = activeFilters.metered.join(',');
    if (activeFilters.status?.length) params.status = activeFilters.status.join(',');

    const response = await axios.get(`/payment-history/${currentSabha.value}`, { params });
    accounts.value = response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
  } finally {
    isLoading.value = false;
  }
};

const applyFilters = () => { isFilterDialogOpen.value = false }
const clearFilters = () => {
  activeFilters.connectionTypes = []
  activeFilters.samurdhi = []
  activeFilters.metered = []
  activeFilters.status = []
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not Paid';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-CA'); 
}

// ✅ Navigate to New Page instead of opening Modal
const navigateToHistory = (accountId) => {
  router.push({ name: 'PaymentHistoryView', params: { id: accountId } });
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>Customer History</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="card table-card">
      <div class="controls-row">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="Search by Name, NIC or Bill No..." class="search-input" />
        </div>
        <div class="sort-wrapper">
          <select v-model="sortBy" class="sort-select">
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="bill_asc">New Bill No (Asc)</option>
            <option value="bill_desc">New Bill No (Desc)</option>
          </select>
        </div>
        <button class="filter-btn" @click="isFilterDialogOpen = true">Filter</button>
      </div>

      <div class="table-responsive">
        <div v-if="isLoading" class="loading-state">Loading Data...</div>

        <table v-else class="accounts-table">
          <thead>
            <tr>
              <th>Old Bill No</th>
              <th>New Bill No</th>
              <th>Full Name</th>
              <th>NIC</th>
              <th>Contact</th>
              <th>Last Payment Date</th>
              <th>Last Amount (LKR)</th>
              <th>Current Balance (LKR)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acc in accounts" :key="acc.id" @click="navigateToHistory(acc.id)" class="clickable-row">
              <td class="old-bill">{{ acc.oldBillNumber }}</td>
              <td class="new-bill">{{ acc.newBillNumber }}</td>
              <td>{{ acc.fullName }}</td>
              <td>{{ acc.nic }}</td>
              <td>{{ acc.contactInfo }}</td>
              <td>
                <span :class="{'badge-pending': !acc.lastPaidDate}">
                  {{ formatDate(acc.lastPaidDate) }}
                </span>
              </td>
              <td>{{ Number(acc.lastPaidAmount || 0).toFixed(2) }}</td>
              <td :class="{ 'text-green': (acc.currentBalance || 0) <= 0, 'text-red': (acc.currentBalance || 0) > 0 }">
                {{ Number(acc.currentBalance || 0).toFixed(2) }}
              </td>
              <td>
                <span :class="{'status-active': acc.status === 1, 'status-inactive': acc.status === 0}">
                  {{ acc.status === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </tr>
            <tr v-if="accounts.length === 0">
              <td colspan="10" style="text-align:center; padding: 20px;">No customers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isFilterDialogOpen" class="modal-overlay">
      <div class="modal-content">
        <h4>Filter Accounts</h4>
         <div class="filter-section">
          <h5>Account Status</h5>
          <div class="checkbox-list">
            <label class="checkbox-item"><input type="checkbox" value="Active" v-model="activeFilters.status"> Active</label>
            <label class="checkbox-item"><input type="checkbox" value="Inactive" v-model="activeFilters.status"> Inactive</label>
          </div>
        </div>
        <div class="modal-actions">
          <button class="modal-btn" @click="clearFilters">Clear All</button>
          <button class="modal-btn primary" @click="applyFilters">Apply Filters</button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Copied styles, cleaned up to remove history modal specific CSS */
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

.back-link {
    color: #42b883;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px;
}

.card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    gap: 15px;
    flex-wrap: wrap;
}

.search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #888;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 10px 10px 10px 30px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    box-sizing: border-box;
}

.sort-select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    background-color: white;
    cursor: pointer;
}

.filter-btn {
    background-color: #2c3e50;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px;
}

.table-responsive {
    overflow-x: auto;
}

.accounts-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    min-width: 800px;
}

.accounts-table th,
.accounts-table td {
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

.clickable-row {
    cursor: pointer;
    transition: background-color 0.2s;
}

.action-btn {
    background: transparent;
    border: 1px solid #42b883;
    color: #42b883;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.action-btn:hover {
    background: #42b883;
    color: white;
}

.status-active {
    color: #27ae60;
    font-weight: bold;
    background-color: #eafaf1;
    padding: 4px 8px;
    border-radius: 4px;
}

.status-inactive {
    color: #c0392b;
    font-weight: bold;
    background-color: #fdedec;
    padding: 4px 8px;
    border-radius: 4px;
}

.new-bill {
    font-weight: bold;
    color: #2c3e50;
}

.old-bill {
    color: #666;
    font-style: italic;
}

.loading-state {
    text-align: center;
    padding: 20px;
    font-size: 14px;
    color: #42b883;
    font-weight: bold;
}

.text-green {
    color: #27ae60;
    font-weight: bold;
}

.text-red {
    color: #c0392b;
    font-weight: bold;
}

/* Modal Styles (Only for Filter) */
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
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 30%;
}

.modal-content h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #42b883;
    display: inline-block;
    padding-bottom: 5px;
    font-size: 16px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
}

.modal-btn {
    padding: 8px 16px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    border-radius: 4px;
    font-size: 13px;
    font-weight: bold;
}

.modal-btn.primary {
    background: #42b883;
    color: white;
    border-color: #42b883;
}

.checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #2c3e50;
    cursor: pointer;
}

.filter-section {
    margin-bottom: 15px;
}

.filter-section h5 {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #2c3e50;
    text-transform: uppercase;
    font-weight: bold;
}
</style>