<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 1. Data Storage
const accounts = ref([])
const availableProjectCodes = ref([]) 
const currentSabha = ref('')
const isLoading = ref(false)

// 2. Search & Sort State
const searchQuery = ref('')
const sortBy = ref('name_asc')

// 3. Filter State
const isFilterDialogOpen = ref(false)
const activeFilters = reactive({
  projectCode: '', 
  connectionTypes: [],
  samurdhi: [],
  metered: [],
  status: []
})
// දත්ත ගබඩා කිරීමට ref එකක්
const selectedAccounts = ref([]);

// Session එකෙන් ලොග් වී සිටින පරිශීලකයාගේ NIC එක ලබා ගැනීම
const getLoggedUserNIC = () => {
    const userDataString = sessionStorage.getItem('userData');
    if (userDataString) {
        const userData = JSON.parse(userDataString);
        // මෙහි nic හෝ sub_nic ලෙස ඔබේ session එකේ ඇති පරිදි නිවැරදි key එක යොදන්න
        return userData.nic || userData.sub_nic; 
    }
    return null;
};

// API එක මගින් දත්ත ලබා ගැනීම
const fetchTempInvoices = async () => {
    const subNic = getLoggedUserNIC();
    if (!subNic) return;

    try {
        const response = await axios.get(`/temp-invoices/${subNic}`);
        selectedAccounts.value = response.data; // මෙහි දැන් cus_name, cus_nic, amount අඩංගුයි
    } catch (error) {
        console.error("Error loading temp invoices:", error);
    }
};

// Page එක load වන විට function එක call කිරීම
onMounted(async () => {
    // දැනට ඇති දේට අමතරව මෙය එක් කරන්න
    await fetchTempInvoices();
});

const currentPage = ref(1);
const itemsPerPage = 4;

// Computed Property to get Paginated Data
const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return accounts.value.slice(start, end);
});

// Total Pages Calculation
const totalPages = computed(() => {
  return Math.ceil(accounts.value.length / itemsPerPage) || 1;
});

// Reset pagination when data changes
watch(accounts, () => {
  currentPage.value = 1;
});

const removeFromSummary = async (invoice, index) => {
    const subNic = getLoggedUserNIC();
    
    if (confirm("Are you sure you want to permanently delete this record from database?")) {
        try {
            // Backend එකට delete request එක යැවීම
            const response = await axios.delete(`/temp-invoices/${subNic}/${invoice.cus_nic}`);
            
            if (response.data.success) {
                // Database එකෙන් මැකුණු පසු පමණක් Frontend Table එකෙන් ඉවත් කිරීම
                selectedAccounts.value.splice(index, 1);
                alert("Record deleted successfully.");
            }
        } catch (error) {
            console.error("Error deleting record:", error);
            alert("Failed to delete record from database.");
        }
    }
};

// 4. Fetch Data on Load
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');

  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;

    if (currentSabha.value) {
      await Promise.all([
        fetchAccounts(),
        fetchProjects() 
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

// 5.1 Fetch Projects Function
const fetchProjects = async () => {
    try {
        const response = await axios.get(`/water-payment-projects/${currentSabha.value}`);
        availableProjectCodes.value = response.data;
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
  activeFilters.projectCode = '' 
  activeFilters.connectionTypes = []
  activeFilters.samurdhi = []
  activeFilters.metered = []
  activeFilters.status = []
  fetchAccounts();
}

const openPaymentModal = (account) => {
  console.log("Pay Bill clicked for Account:", account.id);
  router.push({ name: 'WaterBillPayment', params: { accountId: account.id } });
};
</script>

<template>
  <div id="payable-accounts-container" class="page-container">
    <header class="page-header">
      <h3>Pay Bill</h3>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="card table-card">
      <h4>Existing Accounts</h4>
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
            <tr v-for="acc in paginatedAccounts" :key="acc.id">
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
        <div class="pagination-controls" v-if="accounts.length > itemsPerPage">
  <small>Showing page {{ currentPage }} of {{ totalPages }}</small>
  <nav class="pagination-nav">
    <button 
      class="pag-btn" 
      :disabled="currentPage === 1" 
      @click="currentPage--"
    >Previous</button>

    <div class="page-numbers">
      <button 
        v-for="page in totalPages" 
        :key="page" 
        class="page-num-btn"
        :class="{ active: currentPage === page }"
        @click="currentPage = page"
      >{{ page }}</button>
    </div>

    <button 
      class="pag-btn" 
      :disabled="currentPage === totalPages" 
      @click="currentPage++"
    >Next</button>
  </nav>
</div>
      </div>
    </div>
    <div class="card table-card mt-4">
  <h4>Temporary Invoice Summary</h4>
  <div class="table-responsive">
    <table class="accounts-table">
      <thead>
        <tr>
          <th>Customer NIC</th>
          <th>Customer Name</th>
          <th style="text-align: right;">Amount (Rs.)</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(invoice, index) in selectedAccounts" :key="index">
          <td>{{ invoice.cus_nic }}</td>
          <td>{{ invoice.cus_name }}</td>
          <td style="text-align: right; font-weight: bold;">
            {{ invoice.amount ? Number(invoice.amount).toFixed(2) : '0.00' }}
          </td>
          <td style="text-align: center;">
          <button class="delete-btn" @click="removeFromSummary(invoice, index)" title="Permanently Delete">
          <i class="fas fa-trash-alt"></i>
        </button>
        </td>
        </tr>
        <tr v-if="selectedAccounts.length === 0">
          <td colspan="3" style="text-align:center; padding: 20px;">No records found.</td>
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
#payable-accounts-container.page-container {
    padding: 20px !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
    font-family: sans-serif !important;
}

#payable-accounts-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 20px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 10px !important;
}

#payable-accounts-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important; 
}

#payable-accounts-container .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 15px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
    margin-bottom: 20px !important;
}

#payable-accounts-container h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 10px !important;
    margin-bottom: 20px !important;
    font-size: 16px !important; 
}

#payable-accounts-container .controls-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 15px !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
}

#payable-accounts-container .search-wrapper {
    position: relative !important;
    flex: 1 !important;
    min-width: 200px !important;
}

#payable-accounts-container .search-icon {
    position: absolute !important;
    left: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    font-size: 14px !important; 
    color: #888 !important;
    pointer-events: none !important;
}

#payable-accounts-container .search-input {
    width: 100% !important;
    padding: 10px 10px 10px 30px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    box-sizing: border-box !important;
}

#payable-accounts-container .sort-select {
    padding: 10px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    background-color: white !important;
    cursor: pointer !important;
}

#payable-accounts-container .filter-btn {
    background-color: #2c3e50 !important;
    color: white !important;
    border: none !important;
    padding: 10px 16px !important; 
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    font-size: 13px !important; 
}

#payable-accounts-container .table-responsive {
    overflow-x: auto !important;
}

#payable-accounts-container .accounts-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 13px !important; 
    min-width: 600px !important;
    margin-top: 10px !important;
}

#payable-accounts-container .accounts-table th,
#payable-accounts-container .accounts-table td {
    text-align: left !important;
    padding: 12px !important; 
    border: 2px solid #99a3b0 !important;
    color: #2c3e50 !important;
    vertical-align: top !important;
}

#payable-accounts-container .accounts-table th {
    background-color: #bcccdc !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
}

#payable-accounts-container .accounts-table tr:hover {
    background-color: #f9f9f9 !important;
}

#payable-accounts-container .action-btn {
    background: transparent !important;
    border: 1px solid #42b883 !important;
    color: #42b883 !important;
    padding: 6px 12px !important; 
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important; 
}

#payable-accounts-container .action-btn:hover {
    background: #42b883 !important;
    color: white !important;
}

/* Modal Styles */
#payable-accounts-container .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background-color: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 1000 !important;
}

#payable-accounts-container .modal-content {
    background: white !important;
    padding: 25px !important; 
    border-radius: 8px !important;
    width: 350px !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
}

#payable-accounts-container .modal-content h4 {
    margin-top: 0 !important;
    margin-bottom: 15px !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    font-size: 16px !important; 
}

#payable-accounts-container .filter-section {
    margin-bottom: 15px !important;
}

#payable-accounts-container .filter-section h5 {
    margin: 0 0 8px 0 !important;
    font-size: 13px !important; 
    color: #2c3e50 !important;
    text-transform: uppercase !important;
    font-weight: bold !important;
}

#payable-accounts-container .checkbox-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
}

#payable-accounts-container .checkbox-item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 13px !important; 
    color: #2c3e50 !important;
    cursor: pointer !important;
}

#payable-accounts-container .modal-actions {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 10px !important;
    margin-top: 25px !important;
    border-top: 1px solid #eee !important;
    padding-top: 15px !important;
}

#payable-accounts-container .modal-btn {
    padding: 8px 16px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    background: white !important;
    cursor: pointer !important;
    font-size: 13px !important; 
    font-weight: bold !important;
}

#payable-accounts-container .modal-btn.primary {
    background-color: #42b883 !important;
    color: white !important;
    border-color: #42b883 !important;
}

#payable-accounts-container .loading-state {
    text-align: center !important;
    padding: 20px !important;
    font-size: 14px !important; 
    color: #42b883 !important;
}

#payable-accounts-container .status-active {
    color: #27ae60 !important; 
    font-weight: bold !important;
    background-color: #eafaf1 !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
}

#payable-accounts-container .status-inactive {
    color: #c0392b !important; 
    font-weight: bold !important;
    background-color: #fdedec !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
}

/* Pagination Styles */
 #payable-accounts-container .pagination-controls {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-top: 15px !important;
    padding: 10px 0 !important;
}

#payable-accounts-container .pagination-nav {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}

#payable-accounts-container .page-numbers {
    display: flex !important;
    gap: 5px !important;
}

#payable-accounts-container .pag-btn {
    padding: 6px 12px !important;
    border: 1px solid #ccc !important;
    background: white !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    font-size: 12px !important;
}

#payable-accounts-container .pag-btn:disabled {
    cursor: not-allowed !important;
    opacity: 0.5 !important;
}

#payable-accounts-container .page-num-btn {
    width: 30px !important;
    height: 30px !important;
    border: 1px solid #ccc !important;
    background: white !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    font-size: 12px !important;
}

#payable-accounts-container .page-num-btn.active {
    background-color: #42b883 !important;
    color: white !important;
    border-color: #42b883 !important;
    font-weight: bold !important;
}

#payable-accounts-container .page-num-btn:hover:not(.active) {
    background-color: #f0f0f0 !important;
}
</style>