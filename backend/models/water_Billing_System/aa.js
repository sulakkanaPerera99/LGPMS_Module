
// ... (getPaymentHistoryByAccountId function එක වෙනස් කිරීමට අවශ්‍ය නැත) ...

export const getPaymentHistoryByAccountId = async (accountId) => {
    const query = `
        SELECT 
            wb.id,
            wb.bill_number,
            wb.paid_date,
            wb.paid_amount,
            wb.total_amount,
            wb.payment_status,
            wca.full_name,
            (wb.total_amount - COALESCE(wb.paid_amount, 0)) AS remaining_due,
            wb.created_at
        FROM 
            water_bills wb
        JOIN 
            water_customer_accounts wca ON wb.account_id = wca.id
        WHERE 
            wb.account_id = ?
        ORDER BY 
            COALESCE(wb.paid_date, wb.created_at) DESC
    `;

    try {
        const [rows] = await db.promise().query(query, [accountId]);
        return rows;
    } catch (error) {
        throw error;
    }
};

// ✅ Updated Search Function
export const getAccountIdBySearchTerm = async (term) => {
    try {
        // 1. Try to find by Account ID, NIC, or Customer Bill Number in customer table
        // මෙතන 'new_bill_number' කියන තැනට ඔබේ table එකේ අදාළ column name එක දාන්න.
        const customerQuery = `
            SELECT id 
            FROM water_customer_accounts 
            WHERE id = ? OR nic = ? OR new_bill_number = ? 
            LIMIT 1
        `;
        
        // term එක තුන් වරක් pass කරන්න ඕන (id, nic, bill_number සඳහා)
        const [customerRows] = await db.promise().query(customerQuery, [term, term, term]);
        
        if (customerRows.length > 0) return customerRows[0].id;

        // 2. Try to find by Specific Invoice Number in bills table (Optional - මේකත් තියෙන එක හොඳයි)
        const billQuery = `SELECT account_id FROM water_bills WHERE bill_number = ? LIMIT 1`;
        const [billRows] = await db.promise().query(billQuery, [term]);

        if (billRows.length > 0) return billRows[0].account_id;

        return null;
    } catch (error) {
        throw error;
    }
};





//controller-------------------


import {

    getPaymentHistoryByAccountId,

    getAccountIdBySearchTerm

} from '../../models/water_billing_system/paymentHistoryModel.js';



export const getCustomerPaymentHistory = async (req, res) => {

    try {

        // We rename the param to 'searchTerm' for clarity,

        // though in routes.js it might still be defined as /:account_id

        // (It's better to keep the route param generic like /:search_term)

        const searchTerm = req.params.account_id || req.params.search_term;



        if (!searchTerm) {

            return res.status(400).json({

                success: false,

                message: "Search term (ID, NIC, or Bill Number) is required"

            });

        }



        // 1. Resolve the Account ID

        const accountId = await getAccountIdBySearchTerm(searchTerm);



        if (!accountId) {

            return res.status(404).json({

                success: false,

                message: "No customer found matching that ID, NIC, or Bill Number."

            });

        }



        // 2. Fetch History using the resolved Account ID

        const history = await getPaymentHistoryByAccountId(accountId);



        return res.status(200).json({

            success: true,

            data: history

        });



    } catch (error) {

        console.error("Error fetching payment history:", error);

        return res.status(500).json({

            success: false,

            message: "Internal Server Error",

            error: error.message

        });

    }

};


//rotes

import express from 'express';
import { 
    getCustomerPaymentHistory
} from '../../controllers/water_billing_system/paymentHistoryController.js';

const router = express.Router();

// 2. අදාල Account එකේ History එක ගන්න Route එක (Account ID එකෙන්)
router.get('/payment-history/:account_id', getCustomerPaymentHistory);

export default router;





export const getCustomersHistoryBySabha = (sabhaCode, projectCode, filters = {}) => {
    return new Promise((resolve, reject) => {
        let query = `
            SELECT 
                wca.id,
                wca.nic,
                wca.old_bill_number AS oldBillNumber,
                wca.new_bill_number AS newBillNumber,
                wca.full_name AS fullName,
                wca.contact_info AS contactInfo,
                wca.connection_type AS connectionType,
                wca.project_code AS projectCode,
                wca.is_samurdhi AS isSamurdhi,
                wca.samurdhi_number AS samurdhiNumber,
                wca.is_metered AS isMetered,
                wca.status AS status,
                
                -- ✅ FIX 1: current_balance NULL නම් 0 ලෙස එවන්න
                COALESCE(wca.current_balance, 0) AS currentBalance,

                -- ✅ FIX 2: Last Paid Date
                (
                    SELECT paid_date 
                    FROM water_bills wb 
                    WHERE wb.account_id = wca.id 
                    AND wb.paid_amount > 0 
                    ORDER BY wb.paid_date DESC 
                    LIMIT 1
                ) AS lastPaidDate,

                -- ✅ FIX 3: Last Paid Amount NULL නම් 0 ලෙස එවන්න
                COALESCE((
                    SELECT paid_amount 
                    FROM water_bills wb 
                    WHERE wb.account_id = wca.id 
                    AND wb.paid_amount > 0 
                    ORDER BY wb.paid_date DESC 
                    LIMIT 1
                ), 0) AS lastPaidAmount

            FROM water_customer_accounts wca
            WHERE wca.sabha_code = ?
        `;




     //   +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


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

// --- New State for Bill Selection ---
const isBillSelectionModalOpen = ref(false)
const selectedAccount = ref(null)
const billHistory = ref([])
const isBillHistoryLoading = ref(false)

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
        // Backend Route: /water-project-list/:sabha_code
        const response = await axios.get(`/water-project-list/${currentSabha.value}`);
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

    const response = await axios.get(`/water-customers/${currentSabha.value}`, { params });
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

// 7. Bill Selection & Navigation Logic
const openBillSelectionModal = async (account) => {
    selectedAccount.value = account;
    isBillSelectionModalOpen.value = true;
    billHistory.value = [];
    isBillHistoryLoading.value = true;

    try {
        // Fetch bill history for the selected account
        const response = await axios.get(`/water-bills/customer/${account.id}`);
        
        if (response.data && Array.isArray(response.data)) {
            // Constraint: Display only the latest 12 bills
            billHistory.value = response.data.slice(0, 12);
        }
    } catch (error) {
        console.error("Error fetching bill history:", error);
    } finally {
        isBillHistoryLoading.value = false;
    }
}

const selectBill = (billId) => {
    router.push({ 
        name: 'BillTemplate', 
        params: { id: billId } 
    });
}

const formatBillMonth = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const closeBillSelectionModal = () => {
    isBillSelectionModalOpen.value = false;
    selectedAccount.value = null;
    billHistory.value = [];
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Print Bill</h3>
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="acc in accounts" :key="acc.id">
              <td>{{ acc.newBillNumber }}</td>
              <td>{{ acc.fullName }}</td>
              <td>
               <span :class="{'status-active': acc.status === 1, 'status-inactive': acc.status === 0}">
                  {{ acc.status === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button class="action-btn" @click="openBillSelectionModal(acc)">Print Bill</button>
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

    <!-- Bill Selection Modal -->
    <div v-if="isBillSelectionModalOpen" class="modal-overlay">
      <div class="modal-content bill-selection-content">
        <div class="modal-header-row">
            <h4>Select Bill Period</h4>
            <button class="close-icon-btn" @click="closeBillSelectionModal">×</button>
        </div>
        
        <div v-if="selectedAccount" class="account-summary">
            <p><strong>Customer:</strong> {{ selectedAccount.fullName }}</p>
            <p><strong>Bill No:</strong> {{ selectedAccount.newBillNumber }}</p>
        </div>

        <div v-if="isBillHistoryLoading" class="loading-state">
           <div class="spinner"></div> Loading Bill History...
        </div>
        
        <div v-else-if="billHistory.length > 0" class="bill-list-container">
           <div 
             v-for="bill in billHistory" 
             :key="bill.id" 
             class="bill-list-item" 
             @click="selectBill(bill.id)"
           >
             <div class="bill-info">
                <span class="bill-period">{{ formatBillMonth(bill.billingDate) }}</span>
                <span class="bill-number-small">#{{ bill.billNumber }}</span>
             </div>
             <span class="arrow-icon">→</span>
           </div>
        </div>
        
        <div v-else class="empty-state">
           <p>No bill history found for this customer.</p>
        </div>

        <div class="modal-actions">
          <button class="modal-btn" @click="closeBillSelectionModal">Close</button>
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
  display: inline-block;
  padding-bottom: 5px;
  font-size: 16px; /* Increased from 14px */
}

/* Only apply border to filter modal header */
.modal-content:not(.bill-selection-content) h4 {
  border-bottom: 2px solid #42b883;
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

/* --- Bill Selection Modal Styles --- */
.bill-selection-content {
    max-width: 400px;
    width: 90%;
}

.modal-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 2px solid #42b883;
    padding-bottom: 5px;
}

.modal-header-row h4 {
    margin: 0;
}

.close-icon-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #888;
}

.close-icon-btn:hover {
    color: #333;
}

.account-summary {
    background-color: #f8f9fa;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
    font-size: 13px;
    color: #2c3e50;
}

.account-summary p {
    margin: 2px 0;
}

.bill-list-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    border-radius: 4px;
}

.bill-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}

.bill-list-item:last-child {
    border-bottom: none;
}

.bill-list-item:hover {
    background-color: #eafaf1;
}

.bill-info {
    display: flex;
    flex-direction: column;
}

.bill-period {
    font-weight: bold;
    color: #2c3e50;
    font-size: 14px;
}

.bill-number-small {
    font-size: 11px;
    color: #7f8c8d;
}

.arrow-icon {
    color: #42b883;
    font-weight: bold;
}

.empty-state {
    text-align: center;
    padding: 20px;
    color: #7f8c8d;
    font-style: italic;
    font-size: 13px;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #42b883;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>