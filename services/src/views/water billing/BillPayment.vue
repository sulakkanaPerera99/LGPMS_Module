<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 1. Data Storage
const accounts = ref([])
const availableProjectCodes = ref([]) // ✅ Projects ගබඩා කරගන්න Array එක
const currentSabha = ref('')
const isLoading = ref(false)

// 2. Search & Sort State
const searchQuery = ref('')
const sortBy = ref('name_asc')

// 3. Filter State
const isFilterDialogOpen = ref(false)
const activeFilters = reactive({
  projectCode: '', // ✅ Project එක Filter කිරීමට අලුත් property එකක්
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
      // ✅ Accounts සහ Projects දෙකම එකවර Load කරන්න
      await Promise.all([
        fetchAccounts(),
        fetchProjects() // <--- මෙන්න මේ Function Call එක තමයි කලින් අඩු වෙලා තිබුණේ
      ]);
    } else {
      alert("Session Error: Sabha Code not found.");
    }
  } else {
    alert("Session Expired. Please login again.");
  }
});

// 4.5. Watchers
watch(searchQuery, () => fetchAccounts(), { immediate: false });
watch(sortBy, () => fetchAccounts(), { immediate: false });
watch(activeFilters, () => fetchAccounts(), { deep: true, immediate: false });

// --- 🆕 5.1 Fetch Projects Function (අලුතින් එකතු කළ කොටස) ---
const fetchProjects = async () => {
    try {
        // Backend Route: /water-payment-projects/:sabha_code
        const response = await axios.get(`/water-payment-projects/${currentSabha.value}`);
        availableProjectCodes.value = response.data;
        // console.log("Projects Loaded:", availableProjectCodes.value);
    } catch (error) {
        console.error("Error loading projects:", error);
    }
};

// 5. API Call Function (Fetch Accounts)
const fetchAccounts = async () => {
  isLoading.value = true;
  try {
    const params = {};

    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    if (sortBy.value) {
      params.sort = sortBy.value;
    }

    // --- ✅ Project Filter එක API එකට යැවීම ---
    // Backend Controller එකේ 'projectCode' හෝ 'project_code' බලාපොරොත්තු වන නම අනුව මෙය ගැලපෙන්න ඕන.
    // සාමාන්‍යයෙන් query params වල camelCase භාවිතා වේ.
    if (activeFilters.projectCode) {
        params.projectCode = activeFilters.projectCode;
    }

    if (activeFilters.connectionTypes && activeFilters.connectionTypes.length > 0) {
      params.connectionTypes = activeFilters.connectionTypes.join(',');
    }

    if (activeFilters.samurdhi && activeFilters.samurdhi.length > 0) {
      params.samurdhi = activeFilters.samurdhi.join(',');
    }

    if (activeFilters.metered && activeFilters.metered.length > 0) {
      params.metered = activeFilters.metered.join(',');
    }

    if (activeFilters.status && activeFilters.status.length > 0) {
      params.status = activeFilters.status.join(',');
    }

    const response = await axios.get(`/water-payment-customers/${currentSabha.value}`, { params });
    accounts.value = response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    alert("Failed to load customer data.");
  } finally {
    isLoading.value = false;
  }
};

// 6. Filter Logic
const applyFilters = () => {
  isFilterDialogOpen.value = false
  fetchAccounts();
}

const clearFilters = () => {
  activeFilters.projectCode = '' // ✅ Project Filter එකත් Reset කරන්න
  activeFilters.connectionTypes = []
  activeFilters.samurdhi = []
  activeFilters.metered = []
  activeFilters.status = []
  fetchAccounts();
}

const openPaymentModal = (account) => {
  console.log("Pay Bill clicked for:", account);
  router.push({ name: 'WaterBillPayment', params: { accountId: account.id } });
};
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Pay Bill</h3>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="card table-card">
      <div class="controls-row">
        <div class="search-wrapper">
          <span class="search-icon">🔍</span>
          <input type="text" v-model="searchQuery" placeholder="Search by Name, NIC, Old or New Bill No..." class="search-input" />
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
              <th>Bill Number</th>
              <th>Customer Name</th>
              <th>Account balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acc in accounts" :key="acc.id">
              <td>{{ acc.newBillNumber }}</td>
              <td>{{ acc.fullName }}</td>
              <td style="text-align: left; font-weight: bold;">
               {{ acc.accountBalance ? Number(acc.accountBalance).toFixed(2) : '0.00' }}
              </td>
              <td>
                <button class="action-btn" @click="openPaymentModal(acc)">Pay Bill</button>
              </td>
            </tr>
            <tr v-if="accounts.length === 0">
                <td colspan="4" style="text-align:center; padding: 20px;">No customers found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isFilterDialogOpen" class="modal-overlay">
      <div class="modal-content">
        <h4>Filter Accounts</h4>
        
        <div class="filter-section">
            <label for="pCode" style="display:block; margin-bottom:5px; font-weight:bold; font-size:10px; color:#2c3e50;">Water Project</label>
            <select id="pCode" v-model="activeFilters.projectCode" style="width:100%; padding:5px; font-size:10px; border:1px solid #ccc; border-radius:4px;">
              <option value="">All Projects</option>
              <option v-for="project in availableProjectCodes" :key="project.code" :value="project.code">
                {{ project.code }} - {{ project.name }}
              </option>
            </select>
        </div>
        
        <div class="filter-section">
          <h5>Account Status</h5>
        </div>

        <div class="filter-section">
          <h5>Connection Type</h5>
          <div class="checkbox-list">
            <label class="checkbox-item"><input type="checkbox" value="Industrial/Construction" v-model="activeFilters.connectionTypes"> Industrial/Construction</label>
            <label class="checkbox-item"><input type="checkbox" value="Domestic" v-model="activeFilters.connectionTypes"> Domestic</label>
            <label class="checkbox-item"><input type="checkbox" value="Commercial" v-model="activeFilters.connectionTypes"> Commercial</label>
          </div>
        </div>

        <div class="filter-section">
          <h5>Samurdhi Status</h5>
          <div class="checkbox-list">
            <label class="checkbox-item"><input type="checkbox" value="Samurdhi" v-model="activeFilters.samurdhi"> Samurdhi</label>
            <label class="checkbox-item"><input type="checkbox" value="Not Samurdhi" v-model="activeFilters.samurdhi"> Not Samurdhi</label>
          </div>
        </div>

        <div class="filter-section">
          <h5>Metered Status</h5>
          <div class="checkbox-list">
            <label class="checkbox-item"><input type="checkbox" value="Metered" v-model="activeFilters.metered"> Metered</label>
            <label class="checkbox-item"><input type="checkbox" value="Not Metered" v-model="activeFilters.metered"> Not Metered</label>
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
/* Page Styles */
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
  font-size: 14px; /* Increased from 10px */
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
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
  font-size: 14px; /* Increased from 10px */
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 30px; /* Increased padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px; /* Increased from 7px */
  box-sizing: border-box;
}

.sort-select {
  padding: 10px; /* Increased padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px; /* Increased from 7px */
  background-color: white;
  cursor: pointer;
}

.filter-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 10px 16px; /* Increased padding */
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 13px; /* Increased from 7px */
}

.table-responsive {
  overflow-x: auto;
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px; /* Increased from 7px */
  min-width: 600px;
}

.accounts-table th,
.accounts-table td {
  text-align: left;
  padding: 12px; /* Increased padding */
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

.action-btn {
  background: transparent;
  border: 1px solid #42b883;
  color: #42b883;
  padding: 6px 12px; /* Increased padding */
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px; /* Increased from 7px */
}

.action-btn:hover {
  background: #42b883;
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 25px; /* Increased padding */
  border-radius: 8px;
  width: 350px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  display: inline-block;
  padding-bottom: 5px;
  font-size: 16px; /* Increased from 14px */
}

.filter-section {
  margin-bottom: 15px;
}

.filter-section h5 {
  margin: 0 0 8px 0;
  font-size: 13px; /* Increased from 7px */
  color: #2c3e50;
  text-transform: uppercase;
  font-weight: bold;
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
  font-size: 13px; /* Increased from 7px */
  color: #2c3e50;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.modal-btn {
  padding: 8px 16px; /* Increased padding */
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px; /* Increased from 7px */
  font-weight: bold;
}

.modal-btn.primary {
  background-color: #42b883;
  color: white;
  border-color: #42b883;
}

.loading-state {
  text-align: center;
  padding: 20px;
  font-size: 14px; /* Increased from 10px */
  color: #42b883;
}

.status-active {
  color: #27ae60; /* Green */
  font-weight: bold;
  background-color: #eafaf1;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-inactive {
  color: #c0392b; /* Red */
  font-weight: bold;
  background-color: #fdedec;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>