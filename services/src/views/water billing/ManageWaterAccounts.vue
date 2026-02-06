<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import axios from 'axios'

// 1. Data Storage
const accounts = ref([]) // Stores ALL fetched accounts
const currentSabha = ref('')
const isLoading = ref(false)

// --- NEW: Pagination State ---
const currentPage = ref(1)
const itemsPerPage = 10

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

// Edit Modal State
const isEditDialogOpen = ref(false)
const isSaving = ref(false)
const editForm = reactive({
  id: null,
  fullName: '',
  nic: '',
  contactInfo: '',
  isSamurdhi: false,
  samurdhiNumber: ''
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

// Watchers
watch(searchQuery, () => fetchAccounts(), { immediate: false });
watch(sortBy, () => fetchAccounts(), { immediate: false });
watch(activeFilters, () => fetchAccounts(), { deep: true, immediate: false });

// --- NEW: Reset to Page 1 when data changes ---
watch(accounts, () => {
    currentPage.value = 1;
});

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

    const response = await axios.get(`/water-customers/${currentSabha.value}`, { params });
    accounts.value = response.data;
  } catch (error) {
    console.error("Error fetching accounts:", error);
    alert("Failed to load customer data.");
  } finally {
    isLoading.value = false;
  }
};

// --- NEW: Pagination Logic (Computed Properties) ---
const totalPages = computed(() => {
    return Math.ceil(accounts.value.length / itemsPerPage) || 1;
});

const paginatedAccounts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return accounts.value.slice(start, end);
});

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const applyFilters = () => { isFilterDialogOpen.value = false }
const clearFilters = () => {
  activeFilters.connectionTypes = []
  activeFilters.samurdhi = []
  activeFilters.metered = []
  activeFilters.status = []
}

// Edit Functions (Unchanged)
const openEditModal = (acc) => {
  editForm.id = acc.id
  editForm.fullName = acc.fullName
  editForm.nic = acc.nic
  editForm.contactInfo = acc.contactInfo
  editForm.isSamurdhi = Boolean(acc.isSamurdhi)
  editForm.samurdhiNumber = acc.samurdhiNumber || ''
  isEditDialogOpen.value = true
}

const closeEditModal = () => {
  isEditDialogOpen.value = false
  editForm.id = null
  editForm.fullName = ''
  editForm.nic = ''
  editForm.contactInfo = ''
  editForm.isSamurdhi = false
  editForm.samurdhiNumber = ''
}

const saveCustomer = async () => {
  if (!editForm.id) return
  isSaving.value = true
  try {
    const payload = {
      fullName: editForm.fullName,
      nic: editForm.nic,
      contactInfo: editForm.contactInfo,
      isSamurdhi: editForm.isSamurdhi,
      samurdhiNumber: editForm.samurdhiNumber
    }
    const response = await axios.put(`/update-customer/${editForm.id}`, payload)
    if (response.status === 200) {
      alert(response.data.message || "Customer updated successfully")
      closeEditModal()
      await fetchAccounts() 
    }
  } catch (error) {
    console.error("Error updating customer:", error)
    alert("Failed to update customer. Please check inputs.")
  } finally {
    isSaving.value = false
  }
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
          <input type="text" v-model="searchQuery" placeholder="Search..." class="search-input" />
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
              <th>Address</th>
              <th>Contact</th>
              <th>Samurdhi</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acc in paginatedAccounts" :key="acc.id">
              <td>{{ acc.oldBillNumber }}</td>
              <td class="new-bill">{{ acc.newBillNumber }}</td>
              <td>{{ acc.fullName }}</td>
              <td>{{ acc.nic }}</td>
              <td>{{ acc.propertyAddress }}</td>
              <td>{{ acc.contactInfo }}</td>
              <td>{{ acc.isSamurdhi ? `Yes (${acc.samurdhiNumber})` : 'No' }}</td>
              <td>
               <span :class="{'status-active': acc.status === 1, 'status-inactive': acc.status === 0}">
                  {{ acc.status === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="action-btn" @click="openEditModal(acc)">Edit</button>
              </td>
            </tr>
            <tr v-if="accounts.length === 0">
                <td colspan="9" style="text-align:center; padding: 20px;">No customers found.</td>
            </tr>
          </tbody>
        </table>

        <div v-if="accounts.length > 0" class="pagination-container">
            <button 
                class="pagination-btn" 
                @click="prevPage" 
                :disabled="currentPage === 1"
            >
                « Previous
            </button>
            
            <span class="page-info">
                Page <b>{{ currentPage }}</b> of <b>{{ totalPages }}</b>
            </span>
            
            <button 
                class="pagination-btn" 
                @click="nextPage" 
                :disabled="currentPage === totalPages"
            >
                Next »
            </button>
        </div>

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

    <div v-if="isEditDialogOpen" class="modal-overlay">
        <div class="modal-content edit-modal">
        <h4>Edit Customer Details</h4>
        <form @submit.prevent="saveCustomer" class="edit-form">
           <div class="form-group">
              <label>Full Name</label>
              <input type="text" v-model="editForm.fullName" required />
           </div>
           <div class="form-group">
              <label>NIC (Changing this will transfer ownership)</label>
              <input type="text" v-model="editForm.nic" required class="warning-input" />
           </div>
           <div class="form-group">
              <label>Contact Info</label>
              <input type="text" v-model="editForm.contactInfo" />
           </div>
           <div class="form-group checkbox-row">
              <input type="checkbox" id="editSamurdhi" v-model="editForm.isSamurdhi" />
              <label for="editSamurdhi">Samurdhi Beneficiary</label>
           </div>
           <div class="form-group" v-if="editForm.isSamurdhi">
              <label>Samurdhi Number</label>
              <input type="text" v-model="editForm.samurdhiNumber" />
           </div>
           <div class="modal-actions">
             <button type="button" class="modal-btn" @click="closeEditModal" :disabled="isSaving">Cancel</button>
             <button type="submit" class="modal-btn primary" :disabled="isSaving">
               {{ isSaving ? 'Saving...' : 'Save Changes' }}
             </button>
           </div>
        </form>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* --- Page Layout --- */
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
  padding-bottom: 15px;
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

/* --- Controls Row --- */
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
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 13px;
}

/* --- Table Styles --- */
.table-responsive {
  overflow-x: auto;
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 800px;
  margin-bottom: 15px; /* Added margin for pagination */
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

/* --- Status Badges --- */
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

.new-bill { font-weight: bold; color: #2c3e50; }
.loading-state { text-align: center; padding: 20px; font-size: 14px; color: #42b883; font-weight: bold; }

/* --- NEW: Pagination Styles (Matches Reference Image) --- */
.pagination-container {
    display: flex;
    justify-content: flex-end; /* Aligns to right like the screenshot */
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e0e0e0;
    gap: 10px;
}

.pagination-btn {
    background-color: #ffffff;
    border: 1px solid #dcdcdc;
    color: #333;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
    background-color: #f1f1f1;
    border-color: #bbb;
}

.pagination-btn:disabled {
    color: #ccc;
    background-color: #f9f9f9;
    cursor: not-allowed;
    border-color: #eee;
}

.page-info {
    font-size: 13px;
    color: #555;
    margin: 0 10px;
}

/* --- Modal Styles (Same as before) --- */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white; padding: 25px; border-radius: 8px;
  width: 350px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.edit-modal { width: 450px; }
.modal-content h4 {
  margin-top: 0; margin-bottom: 15px; color: #2c3e50;
  border-bottom: 2px solid #42b883; display: inline-block; padding-bottom: 5px; font-size: 16px;
}
.edit-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 13px; font-weight: bold; color: #2c3e50; }
.form-group input { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; }
.warning-input { border-color: #f39c12 !important; background-color: #fef9e7; }
.checkbox-row { flex-direction: row; align-items: center; gap: 10px; }
.filter-section { margin-bottom: 15px; }
.filter-section h5 { margin: 0 0 8px 0; font-size: 13px; color: #2c3e50; text-transform: uppercase; font-weight: bold; }
.checkbox-list { display: flex; flex-direction: column; gap: 6px; }
.checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #2c3e50; cursor: pointer; }
.modal-actions {
  display: flex; justify-content: flex-end; gap: 10px;
  margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px;
}
.modal-btn {
  padding: 8px 16px; border: 1px solid #ccc; background: white;
  cursor: pointer; border-radius: 4px; font-size: 13px; font-weight: bold;
}
.modal-btn.primary { background: #42b883; color: white; border-color: #42b883; }
</style>