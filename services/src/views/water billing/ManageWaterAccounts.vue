<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import axios from 'axios'

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

// 4.5. Watchers for automatic API calls
watch(searchQuery, () => fetchAccounts(), { immediate: false });
watch(sortBy, () => fetchAccounts(), { immediate: false });
watch(activeFilters, () => fetchAccounts(), { deep: true, immediate: false });

// 5. API Call Function
const fetchAccounts = async () => {
  isLoading.value = true;
  try {
    // Construct query parameters
    const params = {};

    // Search parameter
    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }

    // Sort parameter
    if (sortBy.value) {
      params.sort = sortBy.value;
    }

    // Filter parameters - convert arrays to comma-separated strings
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

    const response = await axios.get(`/water-customers/${currentSabha.value}`, { params });
    accounts.value = response.data;
    console.log("Accounts Loaded:", accounts.value);
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
}

const clearFilters = () => {
  activeFilters.connectionTypes = []
  activeFilters.samurdhi = []
  activeFilters.metered = []
  activeFilters.status = []
}


</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>Manage Water Accounts</h2>
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
              <th>Old Bill No</th>
              <th>New Bill No</th>
              <th>Full Name</th>
              <th>NIC</th>
              <th>Address (Property)</th>
              <th>Address (Mailing)</th>
              <th>Contact</th>
              <th>Type</th>
              <th>Project</th>
              <th>Samurdhi</th>
              <th>Metered</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acc in accounts" :key="acc.id">
              <td class="old-bill">{{ acc.oldBillNumber || '-' }}</td>
              <td class="new-bill">{{ acc.newBillNumber }}</td>
              
              <td>{{ acc.fullName }}</td>
              <td>{{ acc.nic }}</td>
              <td>{{ acc.propertyAddress }}</td>
              <td>{{ acc.mailingAddress }}</td>
              <td>{{ acc.contactInfo }}</td>
              <td>{{ acc.connectionType }}</td>
              <td>{{ acc.projectCode }}</td>
              <td>
                {{ acc.isSamurdhi ? `Yes (${acc.samurdhiNumber || ''})` : 'No' }}
              </td>
              <td>{{ acc.isMetered ? 'Yes' : 'No' }}</td>
              <td>
               <span :class="{'status-active': acc.status === 1, 'status-inactive': acc.status === 0}">
                  {{ acc.status === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="action-btn">Edit</button>
              </td>
            </tr>
            <tr v-if="accounts.length === 0">
                <td colspan="13" style="text-align:center; padding: 20px;">No customers found.</td>
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
            <label class="checkbox-item">
            <input type="checkbox" value="Active" v-model="activeFilters.status"> Active
            </label>
            <label class="checkbox-item">
            <input type="checkbox" value="Inactive" v-model="activeFilters.status"> Inactive
            </label>
          </div>
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
/* Highlighting the bill numbers slightly */
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
    font-size: 10px;
    color: #42b883;
    font-weight: bold;
}

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
  font-size: 10px;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
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
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 6px 6px 6px 25px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  box-sizing: border-box;
}

.sort-select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  background-color: white;
  cursor: pointer;
}

.filter-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 7px; /* Strict Requirement */
}

.table-responsive {
  overflow-x: auto;
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7px; /* Strict Requirement */
  min-width: 800px;
}

.accounts-table th,
.accounts-table td {
  text-align: left;
  padding: 8px;
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
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 7px;
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
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  display: inline-block;
  padding-bottom: 5px;
  font-size: 14px; /* Consistent with other headings */
}

.filter-section {
  margin-bottom: 12px;
}

.filter-section h5 {
  margin: 0 0 5px 0;
  font-size: 7px; /* Strict Requirement */
  color: #2c3e50;
  text-transform: uppercase;
  font-weight: bold;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 7px; /* Strict Requirement */
  color: #2c3e50;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 10px;
}

.modal-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 7px; /* Strict Requirement */
  font-weight: bold;
}

.modal-btn.primary {
  background-color: #42b883;
  color: white;
  border-color: #42b883;
}

.status-active {
  color: #27ae60; /* Green */
  font-weight: bold;
  background-color: #eafaf1;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-inactive {
  color: #c0392b; /* Red */
  font-weight: bold;
  background-color: #fdedec;
  padding: 2px 6px;
  border-radius: 4px;
}

</style>