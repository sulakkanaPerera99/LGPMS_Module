<template>
  <div>   <div id="register-customer-container" class="page-container">
    <header class="page-header">
      <h2>Register New Customer</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="content-area">
      <div class="card form-card">
        <h4>Customer Details Form</h4>
        <form @submit.prevent="submitForm" class="customer-form">
          
          <div class="form-row">
            <div class="form-group">
              <label for="cType">Customer Type</label>
              <select id="cType" v-model="form.customerType">
                <option v-for="type in customerTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="nic">NIC</label>
              <input id="nic" v-model="form.nic" type="text" placeholder="National Identity Card No" required />
            </div>

            <div class="form-group">
              <label for="fName">Full Name</label>
              <input id="fName" v-model="form.fullName" type="text" placeholder="Enter full name" required />
            </div>
          </div>

          <div class="form-row" v-if="form.customerType === 'Existing Customer'">
            <div class="form-group">
              <label for="oldBillNo">Old Bill Number</label>
              <input id="oldBillNo" v-model="form.oldBillNumber" type="text" placeholder="Enter existing bill number" />
            </div>
            <div class="form-group">
              <label for="currBalance">Current Balance</label>
              <input id="currBalance" v-model="form.currentBalance" type="number" placeholder="Enter current balance" />
           </div>
            <div class="form-group">
              <label for="currReading">Current Reading</label>
              <input id="currReading" v-model="form.currentReading" type="number" placeholder="Enter current meter reading" />
            </div>
            <div class="form-group">
              <label for="currReading">Last Reading Date</label>
              <input id="currReading" v-model="form.lastReadingDate" type="date" placeholder="Enter last reading date" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="pAddress">Property Address (Water Supply)</label>
              <textarea id="pAddress" v-model="form.propertyAddress" rows="3" required></textarea>
            </div>
            <div class="form-group">
              <label for="mAddress">Mailing Address</label>
              <textarea id="mAddress" v-model="form.mailingAddress" rows="3" required></textarea>
            </div>
          </div>
          
          <div class="form-row">
             <div class="form-group">
               <label for="contact">Contact Information</label>
               <input id="contact" v-model="form.contactInfo" type="tel" placeholder="Phone number" pattern="07[0-9]{8}" maxlength="10" required />
             </div>
             <div class="form-group">
               <label for="connType">Water Supply Connection Type</label>
               <select id="connType" v-model="form.connectionType">
                 <option v-for="type in connectionTypes" :key="type" :value="type">{{ type }}</option>
               </select>
             </div>
             <div class="form-group">
                 <label for="pCode">Water Project Code</label>
                 <select id="pCode" v-model="form.projectCode" required>
                   <option value="" disabled>Select a Project</option>
                   <option v-for="project in availableProjectCodes" :key="project.code" :value="project.code">
                     {{ project.name }} - {{ project.code }}
                   </option>
                 </select>
             </div>
           </div>

           <div class="form-row checkbox-row">
             <div class="form-group checkbox-group">
               <div class="form-group checkbox-group">
                  <label for="metered">Metered Status</label>
                  <input id="metered" v-model="form.isMetered" type="checkbox" />
               </div>
                  <label for="samurdhi">Samurdhi Beneficiary</label>
                  <input id="samurdhi" v-model="form.isSamurdhi" type="checkbox" />
                </div>
             <div class="form-group" v-if="form.isSamurdhi">
               <label for="sNumber">Samurdhi Number</label>
               <input class="samurdhi-input" id="sNumber" v-model="form.samurdhiNumber" type="text" placeholder="Enter Samurdhi Number" />
             </div>
           </div>
          <button type="submit" class="submit-btn">Register Customer</button>
        </form>
      </div>
    </div>
  </div>

    <div id="manage-water-accounts-container" class="page-container">
    <header class="page-header">
      <h2>Manage Water Accounts</h2>
      </header>

    <div class="card table-card">
      
      <h4>Existing Accounts</h4>

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
           <div class="form-group">
              <label>Status</label>
              <select v-model="editForm.status">
                <option :value="1">Active</option>
                <option :value="0">Inactive</option>
              </select>
          </div>
           <div class="modal-actions">
             <button type="button" class="modal-btn" @click="closeEditModal" :disabled="isSaving">Cancel</button>
             <button type="submit" class="modal-btn primary" :disabled="isSaving || !isFormChanged">
               {{ isSaving ? 'Saving...' : 'Save Changes' }}
             </button>
           </div>
        </form>
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue' 
import axios from 'axios'
import { convertToNewNic } from '../../utils/nicValidation.js'
import Swal from 'sweetalert2'

// ==========================================
// SHARED STATE
// ==========================================
const currentSabha = ref('');

// ==========================================
// ADD CUSTOMER - STATE & METHODS
// ==========================================
const customerTypes = ['New Customer', 'Existing Customer']
const connectionTypes = ['Domestic', 'Commercial', 'Industrial/Construction']
const availableProjectCodes = ref([]);

const form = reactive({
  customerType: 'New Customer',
  oldBillNumber: '', 
  currentReading:'0',
  lastReadingDate: '0000-00-00',
  newBillNumber: '',
  fullName: '',
  nic: '',
  propertyAddress: '',
  mailingAddress: '',
  contactInfo: '',
  connectionType: 'Domestic',
  projectCode: '',
  isSamurdhi: false,
  samurdhiNumber: '',
  currentBalance: '0.00',
  isMetered: false,
  sabhaCustomerId: null
});

const fetchProjectCodes = async () => {
  try {
    const response = await axios.get(`/water-project-list/${currentSabha.value}`);
    availableProjectCodes.value = response.data; 
    console.log("Projects Loaded:", availableProjectCodes.value);
  } catch (error) {
    console.error("Error fetching project codes:", error);
  }
};

watch(() => form.nic, async (rawNic) => {
    
    if (!rawNic || (rawNic.length !== 10 && rawNic.length !== 12)) {
        clearAutoFilledFields();
        return; 
    }

    const convertedNic = convertToNewNic(rawNic);

    await fetchSabhaCustomerDetails(convertedNic);
});

const fetchSabhaCustomerDetails = async (nicForCheck) => {
    try {
        const response = await axios.get(`/check-sabha-customer/${nicForCheck}`);
        
        if (response.data.success && response.data.data) {
            const data = response.data.data;
            
            form.fullName = data.cus_name || ''; 
            form.mailingAddress = data.cus_address || '';
            form.contactInfo = data.cus_contact || '';
            form.sabhaCustomerId = data.id;

            console.log("Data Found for:", nicForCheck);
        } else {
            clearAutoFilledFields();
        }
    } catch (error) {
        console.error("Auto-fill error:", error);
        clearAutoFilledFields();
    }
};

const clearAutoFilledFields = () => {
    form.fullName = '';
    form.mailingAddress = '';
    form.contactInfo = '';
    form.sabhaCustomerId = null;
};

const submitForm = async () => {
  try {
    if (!currentSabha.value) {
      alert("Session Error: Please login again.");
      return;
    }

    const finalNic = convertToNewNic(form.nic);

    const payload = {
      ...form, 
      nic: finalNic,
      sabha_code: currentSabha.value 
    };

    console.log("Sending Payload:", payload); 

    const response = await axios.post('/register-customer', payload);

    if (response.status === 200 || response.status === 201) {
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Customer added successfully.',
        timer: 2000,
        showConfirmButton: false
    });
      
      Object.assign(form, {
        customerType: 'New Customer',
        oldBillNumber: '',
        currentReading: '0',
        lastReadingDate: '',
        newBillNumber: '',
        fullName: '',
        nic: '',
        propertyAddress: '',
        mailingAddress: '',
        contactInfo: '',
        connectionType: 'Domestic',
        projectCode: '',
        currentBalance: '0.00',
        isSamurdhi: false,
        samurdhiNumber: '',
        isMetered: false
      });
    }

  } catch (error) {
    console.error('Error registering customer:', error);
    if (error.response && error.response.data) {
        alert("Failed: " + error.response.data.message);
    } else {
        alert('Failed to register customer. Please try again.');
    }
  }
}

// ==========================================
// MANAGE ACCOUNTS - STATE & METHODS
// ==========================================
const accounts = ref([]) 
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const searchQuery = ref('')
const sortBy = ref('name_asc')
const isFilterDialogOpen = ref(false)

const activeFilters = reactive({
  connectionTypes: [],
  samurdhi: [],
  metered: [],
  status: []
})

const isEditDialogOpen = ref(false)
const isSaving = ref(false)
const editForm = reactive({
  id: null,
  fullName: '',
  nic: '',
  contactInfo: '',
  isSamurdhi: false,
  samurdhiNumber: '',
  status: 1
})

const originalEditForm = ref({})

const isFormChanged = computed(() => {
  return JSON.stringify(editForm) !== JSON.stringify(originalEditForm.value)
})

watch(searchQuery, () => fetchAccounts(), { immediate: false });
watch(sortBy, () => fetchAccounts(), { immediate: false });
watch(activeFilters, () => fetchAccounts(), { deep: true, immediate: false });

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
  } finally {
    isLoading.value = false;
  }
};

// --- Pagination Logic ---
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

// Edit Functions
const openEditModal = (acc) => {
  editForm.id = acc.id
  editForm.fullName = acc.fullName
  editForm.nic = acc.nic
  editForm.contactInfo = acc.contactInfo
  editForm.isSamurdhi = Boolean(acc.isSamurdhi)
  editForm.samurdhiNumber = acc.samurdhiNumber || ''
  editForm.status = acc.status

  originalEditForm.value = JSON.parse(JSON.stringify(editForm));

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
  editForm.status = 1
  originalEditForm.value = {}
}

const saveCustomer = async () => {
  if (!editForm.id) return

  isEditDialogOpen.value = false

  // Confirmation Dialog
  const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to update this customer's details?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#42b883',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update it!'
  });

  if (result.isConfirmed) {
      isSaving.value = true
      try {
        const payload = {
          fullName: editForm.fullName,
          nic: editForm.nic,
          contactInfo: editForm.contactInfo,
          isSamurdhi: editForm.isSamurdhi,
          samurdhiNumber: editForm.samurdhiNumber,
          status: Number(editForm.status),
          sabha_code: currentSabha.value
        }
        const response = await axios.put(`/update-customer/${editForm.id}`, payload)
        
        if (response.status === 200) {
          // ✅ Success Message Update
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: response.data.message || "Customer updated successfully",
            timer: 2000,
            showConfirmButton: false
          });
          
          editForm.id = null
          originalEditForm.value = {}
          await fetchAccounts() 
        }
      } catch (error) {
        console.error("Error updating customer:", error)
        Swal.fire('Error', "Failed to update customer.", 'error')
      } finally {
        isSaving.value = false
      }
  } else {
      closeEditModal();
  }
}

// ==========================================
// COMBINED onMounted HOOK
// ==========================================
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;

    if (!currentSabha.value) {
      alert("Session Error: Sabha Code not found.");
    } else {
      if (typeof fetchProjectCodes === 'function') {
        await fetchProjectCodes();
      }
      
      if (typeof fetchAccounts === 'function') {
        await fetchAccounts();
      }
    }
  }
});
</script>

<style scoped>
/* ========================================== */
/* ADD CUSTOMER STYLES                        */
/* ========================================== */
#register-customer-container.page-container {
    padding: 20px !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    font-family: sans-serif !important;
}

#register-customer-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin: 40px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 10px !important;
}

#register-customer-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important; 
}

#register-customer-container .content-area {
    display: flex !important;
    flex-direction: column !important;
    gap: 30px !important;
    margin: 30px !important;
}

#register-customer-container .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

#register-customer-container h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    margin-bottom: 20px !important;
    font-size: 16px !important; 
}

/* --- Form Layout --- */
#register-customer-container .customer-form {
    display: flex !important;
    flex-direction: column !important;
    gap: 15px !important;
}

#register-customer-container .form-row {
    display: flex !important;
    gap: 20px !important;
    flex-wrap: wrap !important;
}

#register-customer-container .form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
    flex: 1 !important;
    min-width: 150px !important;
    padding: 0 !important;
    margin: 5px 5px !important;
}

#register-customer-container .samurdhi-input {
    max-width: 500px !important;
}

#register-customer-container .checkbox-row {
    align-items: center !important;
}

#register-customer-container .checkbox-group {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    gap: 10px !important;
    flex: 0 0 auto !important;
}

#register-customer-container .checkbox-group input[type="checkbox"] {
    width: auto !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* --- Form Elements --- */
#register-customer-container label {
    font-weight: 600 !important;
    color: #2c3e50 !important;
    font-size: 13px !important; 
}

#register-customer-container input, 
#register-customer-container select, 
#register-customer-container textarea {
    padding: 10px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    width: 100% !important;
    box-sizing: border-box !important;
}

#register-customer-container input:focus, 
#register-customer-container select:focus, 
#register-customer-container textarea:focus {
    outline: none !important;
    border-color: #42b883 !important;
}

/* --- Buttons --- */
#register-customer-container .submit-btn {
    background-color: #42b883 !important;
    color: white !important;
    border: none !important;
    padding: 0 20px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    align-self: flex-start !important;
    font-size: 13px !important; 
    margin-top: 10px !important;
    height: 38px !important;
}

#register-customer-container .submit-btn:hover {
    background-color: #3aa876 !important;
}

/* ========================================== */
/* MANAGE ACCOUNTS STYLES                     */
/* ========================================== */
#manage-water-accounts-container .page-container {
    padding: 20px !important;
    max-width: 1200px !important;
    margin: 0 auto !important;
    font-family: sans-serif !important;
}

#manage-water-accounts-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin: 40px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 15px !important;
}

#manage-water-accounts-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important;
}

#manage-water-accounts-container .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
    margin: 40px !important;
}

#manage-water-accounts-container h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    margin-bottom: 20px !important;
    font-size: 16px !important; 
}

/* --- Controls Row --- */
#manage-water-accounts-container .controls-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 15px !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
}

#manage-water-accounts-container .search-wrapper {
    position: relative !important;
    flex: 1 !important;
    min-width: 200px !important;
}

#manage-water-accounts-container .search-icon {
    position: absolute !important;
    left: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    font-size: 14px !important;
    color: #888 !important;
    pointer-events: none !important;
}

#manage-water-accounts-container .search-input {
    width: 100% !important;
    padding: 10px 10px 10px 30px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important;
    box-sizing: border-box !important;
}

#manage-water-accounts-container .sort-select {
    padding: 10px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important;
    background-color: white !important;
    cursor: pointer !important;
}

#manage-water-accounts-container .filter-btn {
    background-color: #2c3e50 !important;
    color: white !important;
    border: none !important;
    padding: 10px 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    font-size: 13px !important;
}

/* --- Table Styles --- */
#manage-water-accounts-container .table-responsive {
    overflow-x: auto !important;
}

#manage-water-accounts-container .accounts-table {
    width: 100% !important;
    border-collapse: collapse !important;
    min-width: 800px !important;
    margin-bottom: 15px !important;
}

#manage-water-accounts-container .accounts-table th,
#manage-water-accounts-container .accounts-table td {
    text-align: left !important;
    padding: 12px !important;
    border: 2px solid #99a3b0 !important;
    color: #2c3e50 !important;
    vertical-align: top !important;
}

#manage-water-accounts-container .accounts-table td {
    font-size: 14px !important;
    font-weight: 500 !important;
}

#manage-water-accounts-container .accounts-table th {
    background-color: #bcccdc !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
}

#manage-water-accounts-container .accounts-table tr:hover {
    background-color: #f9f9f9 !important;
}

#manage-water-accounts-container .action-btn {
    background: transparent !important;
    border: 1px solid #42b883 !important;
    color: #42b883 !important;
    padding: 6px 12px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important;
}

#manage-water-accounts-container .action-btn:hover {
    background: #42b883 !important;
    color: white !important;
}

/* --- Status Badges --- */
#manage-water-accounts-container .status-active {
    color: #27ae60 !important;
    font-weight: bold !important;
    background-color: #eafaf1 !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
}

#manage-water-accounts-container .status-inactive {
    color: #c0392b !important;
    font-weight: bold !important;
    background-color: #fdedec !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
}

#manage-water-accounts-container .new-bill {
    font-weight: bold !important;
    color: #2c3e50 !important;
}

#manage-water-accounts-container .loading-state {
    text-align: center !important;
    padding: 20px !important;
    font-size: 14px !important;
    color: #42b883 !important;
    font-weight: bold !important;
}

/* --- Pagination Styles --- */
#manage-water-accounts-container .pagination-container {
    display: flex !important;
    justify-content: flex-end !important;
    align-items: center !important;
    padding-top: 15px !important;
    border-top: 1px solid #e0e0e0 !important;
    gap: 10px !important;
}

#manage-water-accounts-container .pagination-btn {
    background-color: #ffffff !important;
    border: 1px solid #dcdcdc !important;
    color: #333 !important;
    padding: 8px 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;
}

#manage-water-accounts-container .pagination-btn:hover:not(:disabled) {
    background-color: #f1f1f1 !important;
    border-color: #bbb !important;
}

#manage-water-accounts-container .pagination-btn:disabled {
    color: #ccc !important;
    background-color: #f9f9f9 !important;
    cursor: not-allowed !important;
    border-color: #eee !important;
}

#manage-water-accounts-container .page-info {
    font-size: 13px !important;
    color: #555 !important;
    margin: 0 10px !important;
}

/* --- Modal Styles --- */
#manage-water-accounts-container .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 1000 !important;
}

#manage-water-accounts-container .modal-content {
    background: white !important;
    padding: 25px !important;
    border-radius: 8px !important;
    width: 350px !important;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
}

#manage-water-accounts-container .edit-modal {
    width: 450px !important;
}

#manage-water-accounts-container .modal-content h4 {
    margin-top: 0 !important;
    margin-bottom: 15px !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    font-size: 16px !important;
}

#manage-water-accounts-container .form-group {
    margin: 5px !important;
}

/* --- Edit Form Status Dropdown Styles --- */
#manage-water-accounts-container .form-group select {
    padding: 10px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important;
    background-color: white !important;
    cursor: pointer !important;
    outline: none !important;
    transition: border-color 0.2s !important;
    padding: 5px !important;
    margin: 5px !important;
}

#manage-water-accounts-container .form-group select:focus {
    border-color: #42b883 !important;
}

#manage-water-accounts-container .form-group select option[value="1"] {
    color: #27ae60 !important;
    font-weight: bold !important;
}

#manage-water-accounts-container .form-group select option[value="0"] {
    color: #c0392b !important;
    font-weight: bold !important;
}

#manage-water-accounts-container .edit-form .form-group label {
    margin-bottom: 2px !important;
}

#manage-water-accounts-container .edit-form {
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
}

#manage-water-accounts-container .form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
}

#manage-water-accounts-container .form-group label {
    font-size: 13px !important;
    font-weight: bold !important;
    color: #2c3e50 !important;
}

#manage-water-accounts-container .form-group input {
    padding: 10px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important;
}

#manage-water-accounts-container .warning-input {
    border-color: #f39c12 !important;
    background-color: #fef9e7 !important;
}

#manage-water-accounts-container .checkbox-row {
    flex-direction: row !important;
    align-items: center !important;
    gap: 10px !important;
}

#manage-water-accounts-container .filter-section {
    margin-bottom: 15px !important;
}

#manage-water-accounts-container .filter-section h5 {
    margin: 0 0 8px 0 !important;
    font-size: 13px !important;
    color: #2c3e50 !important;
    text-transform: uppercase !important;
    font-weight: bold !important;
}

#manage-water-accounts-container .checkbox-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
}

#manage-water-accounts-container .checkbox-item {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-size: 13px !important;
    color: #2c3e50 !important;
    cursor: pointer !important;
}

#manage-water-accounts-container .modal-actions {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 10px !important;
    margin-top: 20px !important;
    border-top: 1px solid #eee !important;
    padding-top: 15px !important;
}

#manage-water-accounts-container .modal-btn {
    padding: 8px 16px !important;
    border: 1px solid #ccc !important;
    background: white !important;
    cursor: pointer !important;
    border-radius: 4px !important;
    font-size: 13px !important;
    font-weight: bold !important;
}

#manage-water-accounts-container .modal-btn.primary {
    background: #42b883 !important;
    color: white !important;
    border-color: #42b883 !important;
}

/* ✅ Disabled Button Style */
#manage-water-accounts-container .modal-btn.primary:disabled {
    background-color: #a5d4c0 !important; 
    color: #ffffff !important;
    cursor: not-allowed !important;        
    opacity: 0.7 !important;               
    border: 1px solid #a5d4c0 !important;
}
/* අමතර පෙනුම සඳහා (දෙක වෙන් කර දැක්වීමට) */
.border-top {
  border-top: 2px dashed #ddd !important;
}
</style>