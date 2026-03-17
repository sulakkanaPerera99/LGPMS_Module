<template>
  <div>
    <div class="page-container" id="print-accounts">
      <header class="page-header">
        <h3>Print Water Accounts</h3>
        <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
      </header>

      <div class="card table-card">
        <div class="controls-row">
          <button class="filter-btn" @click="isFilterDialogOpen = true">Filter</button>
          <button class="print-btn" @click="printPage">🖨️ Print Page</button>
        </div>

        <div class="table-responsive">
  <div v-if="isLoading" class="loading-state">Loading Data...</div>
  <table v-else class="accounts-table">
    <thead>
      <tr>
        <th>Bill Number</th>
        <th>Customer Name</th>
        <th>Meter Reading</th>
        <th>Reading date</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="acc in paginatedAccounts" :key="acc.id">
        <td>{{ acc.newBillNumber }}</td>
        <td>{{ acc.fullName }}</td>
        <td></td>
        <td></td>
      </tr>
      <tr v-if="paginatedAccounts.length === 0">
        <td colspan="4" style="text-align:center; padding: 20px;">No customers found.</td>
      </tr>
    </tbody>
  </table>

  <div v-if="totalPages > 1" class="pagination-controls">
    <button @click="setPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">
      Previous
    </button>
    
    <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
    
    <button @click="setPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">
      Next
    </button>
  </div>
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

    <div class="bottom-split-container mt-5 pt-4">
      
      <div class="unmetered-billing-section card table-card shadow-sm">
        <h4 style="margin-top:0; color:#2c3e50; border-bottom: 2px solid #42b883; display:inline-block; padding-bottom:5px;">
          Generate Fixed Bills (Unmetered)
        </h4>
        
        <div class="controls-row" style="margin-top: 15px;">
          <div style="flex: 1;">
            <label style="font-weight:bold; font-size:12px; color:#2c3e50; display:block; margin-bottom:5px;">
              Filter by Water Project
            </label>
            <select v-model="unmeteredProjectCode" @change="filterUnmeteredAccounts" style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px; font-size:13px;">
              <option value="">All Projects</option>
              <option v-for="project in availableProjectCodes" :key="project.code" :value="project.code">
                {{ project.code }} - {{ project.name }}
              </option>
            </select>
          </div>
          
          <button 
            @click="generateUnmeteredBills" 
            class="print-btn" 
            style="background-color: #27ae60; margin-top: 18px;"
            :disabled="isGenerating">
            {{ isGenerating ? 'Generating...' : '⚡ Generate Bills' }}
          </button>
        </div>

        <div class="table-responsive" style="max-height: 400px; overflow-y: auto; margin-top: 15px;">
          <table class="accounts-table">
            <thead style="position: sticky; top: 0; background: white; z-index: 1;">
              <tr>
                <th>Bill Number</th>
                <th>Customer Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="acc in unmeteredAccounts" :key="acc.id">
                <td style="font-weight: bold;">{{ acc.newBillNumber }}</td>
                <td>{{ acc.fullName }}</td>
                <td><span class="badge-unmetered">Unmetered</span></td>
              </tr>
              <tr v-if="unmeteredAccounts.length === 0">
                <td colspan="3" style="text-align:center; padding: 20px;">No unmetered customers found for this project.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="qr-page-container qr-side-section" id="QR-container">
        <div id="printable-qr" class="text-center p-4 qr-card shadowed">
          <h3 class="mb-3">Download Meter Reading App</h3>
          <p class="instruction-text">පහත QR කේතය Scan කර APK ගොනුව බාගත කරගන්න.</p>
          
          <div class="qr-frame my-4">
            <img :src="qrImageUrl" alt="App QR Code" class="mx-auto qr-static-img" />
          </div>

          <div class="mt-3">
            <p class="app-name">Water Meter App</p>
          </div>
        </div>

        <div class="mt-4 text-center">
          <button @click="printOfficialQR" class="btn-print">
            <i class="fas fa-print"></i> Print Official QR
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import qrImage from '@/utils/QRforMR.png'; 
import govLogo from '@/assets/images/government.png'; 

// ==========================================
// SHARED & PRINT ACCOUNTS STATE
// ==========================================
const accounts = ref([])
const availableProjectCodes = ref([])
const currentSabha = ref('')
const isLoading = ref(false)

const isFilterDialogOpen = ref(false)
const activeFilters = reactive({
  projectCode: '',
  status: []
})

// ==========================================
// UNMETERED SECTION STATE
// ==========================================
const allRawAccounts = ref([]) 
const unmeteredAccounts = ref([])
const unmeteredProjectCode = ref('')
const isGenerating = ref(false)

// --- Pagination State ---
const currentPage = ref(1);
const rowsPerPage = 10;

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return accounts.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(accounts.value.length / rowsPerPage);
});

const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// ==========================================
// QR APP STATE
// ==========================================
const qrImageUrl = ref(qrImage);
const logoUrl = ref(govLogo);

onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha_name || userData.sabha || userData.sabha_code || "Pradeshiya Sabha";

    if (currentSabha.value) {
      await Promise.all([
        fetchAccounts(),
        fetchProjects()
      ]);
    }
  }
});

watch(activeFilters, () => fetchAccounts(), { deep: true, immediate: false });

watch(accounts, () => {
  currentPage.value = 1;
});

// API Calls
const fetchProjects = async () => {
  try {
    const response = await axios.get(`/water-project-list/${currentSabha.value}`);
    availableProjectCodes.value = response.data;
  } catch (error) {
    console.error("Error loading projects:", error);
  }
};

const fetchAccounts = async () => {
  isLoading.value = true;
  try {
    const params = {};
    if (activeFilters.projectCode) params.projectCode = activeFilters.projectCode;
    if (activeFilters.status && activeFilters.status.length > 0) {
      params.status = activeFilters.status.join(',');
    }

    const response = await axios.get(`/water-customers/${currentSabha.value}`, { params });
    
    allRawAccounts.value = response.data;

    let meteredData= response.data.filter(acc => acc.isMetered === 1 || acc.isMetered === true);

    meteredData.sort((a, b) => {
      const valA = String(a.newBillNumber || "").slice(-3);
      const valB = String(b.newBillNumber || "").slice(-3);
      return parseInt(valA) - parseInt(valB);
    });

    accounts.value=meteredData;
    
    filterUnmeteredAccounts();

  } catch (error) {
    console.error("Error fetching accounts:", error);
  } finally {
    isLoading.value = false;
  }
};

// ==========================================
// UNMETERED BILLS LOGIC
// ==========================================
const filterUnmeteredAccounts = () => {
  let filtered = allRawAccounts.value.filter(acc => acc.isMetered === 0 || acc.isMetered === false);
  
  if (unmeteredProjectCode.value) {
    filtered = filtered.filter(acc => acc.projectCode === unmeteredProjectCode.value);
  }
  
  unmeteredAccounts.value = filtered;
};

const generateUnmeteredBills = async () => {
  if (unmeteredAccounts.value.length === 0) {
    Swal.fire('Notice', 'No unmetered customers found to generate bills.', 'info');
    return;
  }

  const result = await Swal.fire({
    title: 'Generate Bills?',
    text: `Are you sure you want to generate bills for ${unmeteredAccounts.value.length} unmetered customers?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#27ae60',
    cancelButtonText: 'Cancel',
    confirmButtonText: 'Yes, Generate!'
  });

  if (result.isConfirmed) {
    isGenerating.value = true;
    try {
      const payload = {
        sabha_code: currentSabha.value,
        project_code: unmeteredProjectCode.value || null
      };
      
      const response = await axios.post('/water-readings/generate-unmetered-bills', payload);
      
      if (response.data.status === 'success') {
         Swal.fire('Success', response.data.message, 'success');
      } else {
         Swal.fire('Notice', response.data.message, 'info');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to generate bills. Please try again.', 'error');
    } finally {
      isGenerating.value = false;
    }
  }
};

// ==========================================
// PRINT LOGIC (OLD)
// ==========================================
const applyFilters = () => {
  isFilterDialogOpen.value = false
  fetchAccounts();
}
const clearFilters = () => {
  activeFilters.projectCode = ''
  activeFilters.status = []
  fetchAccounts();
}

const printPage = () => {
  const printWindow = window.open('', '_blank');
  const sabhaName = currentSabha.value; 
  const currentDate = new Date().toLocaleDateString('en-GB');
  
  const selectedProjectObj = availableProjectCodes.value.find(p => p.code === activeFilters.projectCode);
  const projectName = selectedProjectObj ? `${selectedProjectObj.code} - ${selectedProjectObj.name}` : 'All Projects';

  const htmlContent = `
    <html>
      <head>
        <title>Meter Reading Collection Sheet</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; color: #000; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
          .header h2 { margin: 5px 0; font-size: 18px; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; font-weight: bold;}
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          th, td { border: 1px solid #000; padding: 10px 5px; text-align: left; }
          th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
          .text-center { text-align: center; }
          .empty-cell { height: 35px; } 
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${sabhaName}</h1>
          <h2>Water Meter Reading Collection Sheet</h2>
        </div>
        <div class="meta-info">
          <span>Project: ${projectName}</span>
          <span>Date: ${currentDate}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 20%;">Bill Number</th>
              <th style="width: 40%;">Customer Name</th>
              <th style="width: 15%;">Meter Reading</th>
              <th style="width: 20%;">Reading Date</th>
            </tr>
          </thead>
          <tbody>
            ${accounts.value.length > 0 ? accounts.value.map((acc, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${acc.newBillNumber}</td>
                <td>${acc.fullName}</td>
                <td class="empty-cell"></td>
                <td class="empty-cell"></td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" class="text-center" style="padding: 20px;">No customers found.</td>
              </tr>
            `}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
};

const printOfficialQR = () => {
  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Official QR - Meter Reading App</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Segoe UI', sans-serif; text-align: center; color: #000; padding: 20px; }
          .print-header { margin-bottom: 30px; }
          .print-logo { width: 100px; height: auto; margin-bottom: 15px; }
          .print-title { font-size: 26px; font-weight: bold; margin: 0; }
          .print-subtitle { font-size: 18px; margin: 5px 0; }
          .line { border-top: 2px solid #000; margin: 20px 0 40px 0; }
          .qr-section { margin: 20px auto; padding: 20px; border: 2px solid #000; display: inline-block; border-radius: 10px; }
          .qr-img { width: 350px; height: 350px; }
          .instruction { font-size: 22px; font-weight: bold; margin-top: 20px; }
          .description { font-size: 16px; margin: 10px 50px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <img src="${logoUrl.value}" class="print-logo" />
          <p class="print-title">ජල මීටර් කියවීමේ ජංගම යෙදුම</p>
          <p class="print-subtitle">(Mobile Application)</p>
          <div class="line"></div>
        </div>
        <p class="instruction">පහත QR කේතය Scan කර APK ගොනුව බාගත කරගන්න.</p>
        <div class="qr-section">
          <img src="${qrImageUrl.value}" class="qr-img" />
        </div>
        <p class="description">මෙම QR කේතය ස්කෑන් කිරීමෙන් ජංගම යෙදුම ඔබගේ දුරකථනයට ස්ථාපනය කරගත හැක.</p>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  printWindow.addEventListener('load', () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  });
};
</script>

<style scoped>
/* ========================================== */
/* SHARED & OLD STYLES                        */
/* ========================================== */
.page-container {
    padding: 20px !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
    font-family: sans-serif !important;
}

.page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 20px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 10px !important;
}

.back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important;
}

.card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 15px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
    margin-bottom: 20px !important;
}

.controls-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 15px !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
}

.filter-btn, .print-btn {
    background-color: #2c3e50 !important;
    color: white !important;
    border: none !important;
    padding: 10px 16px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    font-size: 13px !important;
}

.print-btn {
    background-color: #3498db !important;
}
.print-btn:disabled {
    background-color: #95a5a6 !important;
    cursor: not-allowed !important;
}

.table-responsive {
    overflow-x: auto !important;
}

.accounts-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 13px !important;
    min-width: 100% !important;
}

.accounts-table th, .accounts-table td {
    text-align: left !important;
    padding: 12px !important;
    border-bottom: 1px solid #eee !important;
    color: #2c3e50 !important;
    vertical-align: top !important;
    border: 2px solid #99a3b0 !important;
}

.accounts-table th {
    background-color: #bcccdc !important;
    font-weight: 600 !important;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 15px;
    gap: 15px;
}

.pagination-controls button {
    padding: 6px 12px;
    background-color: #2c3e50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.pagination-controls button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
}

.page-info {
    font-size: 14px;
    font-weight: bold;
    color: #2c3e50;
}

.badge-unmetered {
    background-color: #e74c3c !important;
    color: white !important;
    padding: 3px 8px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
}

/* Modal Styles */
.modal-overlay {
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

.modal-content {
    background: white !important;
    padding: 25px !important;
    border-radius: 8px !important;
    width: 350px !important;
}

.filter-section { margin-bottom: 15px !important; }
.checkbox-list { display: flex !important; flex-direction: column !important; gap: 6px !important; }
.checkbox-item { display: flex !important; align-items: center !important; gap: 8px !important; font-size: 13px !important; cursor: pointer !important;}
.modal-actions { display: flex !important; justify-content: flex-end !important; gap: 10px !important; margin-top: 25px !important; border-top: 1px solid #eee !important; padding-top: 15px !important;}
.modal-btn { padding: 8px 16px !important; border: 1px solid #ccc !important; border-radius: 4px !important; background: white !important; cursor: pointer !important; font-size: 13px !important; font-weight: bold !important;}
.modal-btn.primary { background-color: #42b883 !important; color: white !important; border-color: #42b883 !important; }
.loading-state { text-align: center !important; padding: 20px !important; font-size: 14px !important; color: #42b883 !important; }

/* ========================================== */
/* NEW SPLIT LAYOUT (FLEXBOX)                 */
/* ========================================== */
.border-top { border-top: 2px dashed #ddd !important; }
.bottom-split-container {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 30px !important;
    align-items: flex-start !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
    padding: 0 20px !important;
}

.unmetered-billing-section {
    flex: 1 1 500px !important;
    margin-bottom: 0 !important;
}

/* QR Code Section - Right Side Adjustment */
.qr-side-section {
  flex: 0 0 400px !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: center !important;
  background-color: transparent !important;
  padding: 0 !important;
  min-height: unset !important;
}

.qr-card {
  background: white !important;
  padding: 30px !important;
  border-radius: 15px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  text-align: center !important;
  border: 1px solid #eee !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.qr-frame { background: #f9f9f9 !important; padding: 15px !important; border-radius: 10px !important; border: 1px dashed #ccc !important; display: inline-block !important; }
.qr-static-img { width: 220px !important; height: 220px !important; }
.btn-print { background-color: #537495 !important; color: white !important; border: none !important; padding: 12px 30px !important; border-radius: 8px !important; font-size: 15px !important; font-weight: bold !important; cursor: pointer !important; }

@media (max-width: 900px) {
  .bottom-split-container { flex-direction: column !important; }
  .qr-side-section { flex: 1 1 100% !important; width: 100% !important; margin-top: 20px !important; }
}
</style>