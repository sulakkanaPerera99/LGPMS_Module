<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const connectionTypes = ['Domestic', 'Commercial', 'Construction/Industrial']
const currentSabha = ref('')
const currentUserNIC = ref('') 

// --- Search & Sort State
const searchQuery = ref('')
const sortBy = ref('code_asc') 

// Edit Form State
const showEditModal = ref(false)
const editId = ref(null)
const editForm = ref({
  projectCode: '',
  connectionType: '',
  isMetered: false,
  isSamurdhi: false,
  fixedRate: 0,
  unitRanges: [],
  otherCharges: [],
  discounts: [],
  fines: []
})

// ✅ New: මුල් දත්ත තබා ගැනීමට (සංසන්දනය සඳහා)
const originalEditForm = ref({})

// ✅ Computed Property: දත්ත වෙනස් වී ඇත්දැයි බැලීමට
const isFormChanged = computed(() => {
  return JSON.stringify(editForm.value) !== JSON.stringify(originalEditForm.value);
});

// Table Data
const billingFeesList = ref([])
const availableProjectCodes = ref([])

onMounted(async () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData && userData.sabha) {
      currentSabha.value = userData.sabha
      currentUserNIC.value = userData.nic || 'UNKNOWN_USER'
      
      // Fetch Project Codes
      availableProjectCodes.value = [] 

      await fetchBillingConfigs()
    }
  } catch (error) {
    console.error("Error init:", error)
  }
})

const addEditUnitRange = () => {
  const ranges = editForm.value.unitRanges;
  if (ranges.length > 0) {
    const lastMax = Number(ranges[ranges.length - 1].max);
    ranges.push({ min: lastMax + 1, max: lastMax + 1, rate: 0, fixed_charge: 0 });
  } else {
    ranges.push({ min: 0, max: 0, rate: 0, fixed_charge: 0 });
  }
}

// ✅ watcher for Edit Form's Unit Ranges
watch(() => editForm.value.unitRanges, (newRanges) => {
  if (!newRanges) return;
  
  newRanges.forEach((range, index) => {
    if (index > 0) {
      const prevMax = Number(newRanges[index - 1].max);
      range.min = prevMax + 1;
    }
  });
}, { deep: true });

// --- Watchers for Search & Sort
let debounceTimeout = null;
watch(searchQuery, () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        fetchBillingConfigs();
    }, 400);
});

watch(sortBy, () => fetchBillingConfigs(), { immediate: false });

// --- Methods ---

const fetchBillingConfigs = async () => {
  try {
    const params = {};
    if (searchQuery.value && searchQuery.value.trim() !== '') {
        params.search = searchQuery.value.trim();
    }
    if (sortBy.value) {
        params.sort = sortBy.value;
    }
    const response = await axios.get(`/billing-fees/${currentSabha.value}`, { params })
    billingFeesList.value = response.data.data || response.data
  } catch (error) {
    console.error("Error fetching configs:", error)
  }
}

// --- Edit Form Helpers ---
// ✅ added fixed_charge: 0 to match AddBillingFees
const removeEditUnitRange = (index) => editForm.value.unitRanges.splice(index, 1)
const addEditOtherCharge = () => editForm.value.otherCharges.push({ name: '', amount: 0, type: 'fixed' })
const removeEditOtherCharge = (index) => editForm.value.otherCharges.splice(index, 1)
const addEditDiscount = () => editForm.value.discounts.push({ name: '', amount: 0, type: 'fixed' })
const removeEditDiscount = (index) => editForm.value.discounts.splice(index, 1)
const addEditFine = () => editForm.value.fines.push({ name: '', amount: 0, type: 'fixed' })
const removeEditFine = (index) => editForm.value.fines.splice(index, 1)


// --- Open Modal Logic ---
const openEditModal = (config) => {
  editId.value = config.id
  
  // දත්ත සකස් කර ගැනීම
  const data = {
    projectCode: config.projectCode,
    connectionType: config.connectionType,
    isMetered: config.isMetered,
    isSamurdhi: config.isSamurdhi,
    fixedRate: config.fixedRate,
    unitRanges: config.unitRanges || [],
    otherCharges: config.otherCharges || [],
    discounts: config.discounts || [],
    fines: config.fines || []
  };

  // ✅ editForm සහ originalEditForm දෙකටම දත්ත දැමීම
  editForm.value = JSON.parse(JSON.stringify(data));
  originalEditForm.value = JSON.parse(JSON.stringify(data));
  
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editId.value = null
  // Reset Forms
  editForm.value = {
      projectCode: '', connectionType: '', isMetered: false, isSamurdhi: false,
      fixedRate: 0, unitRanges: [], otherCharges: [], discounts: [], fines: []
  };
  originalEditForm.value = {};
}

// --- Update Logic ---
const updateForm = async () => {
  if (editForm.value.fixedRate === null) return

  // ✅ 1. Confirmation එකට කලින් Modal එක Close කිරීම
  showEditModal.value = false;

  // ✅ 2. SweetAlert Confirmation
  const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to update this configuration?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#42b883',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update it!'
  });

  if (result.isConfirmed) {
      const payload = {
        ...editForm.value,
        user_nic: currentUserNIC.value,
        sabha_code: currentSabha.value
      }

      try {
        const response = await axios.put(`/billing-fees/${editId.value}`, payload)
        
        if (response.status === 200) {
          // ✅ Success Alert
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Configuration updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });

          await fetchBillingConfigs()
          // Note: Modal is already closed, just cleanup state
          editId.value = null;
          originalEditForm.value = {};
        }
      } catch (error) {
        console.error("Error updating:", error)
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: "Failed to update configuration.",
          confirmButtonColor: '#d33'
        });
      }
  } else {
      // User Cancel කළොත්, Modal එක වැසී ඇති නිසා state cleanup කරන්න
      closeEditModal();
  }
}
</script>

<template>
  <div id="edit-billing-fees-container" class="billing-container">
    <header class="page-header">
      <h2>Manage Billing Configurations</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="content-area">
      <div style="display:flex; justify-content:flex-end;">
         <router-link to="/add-billing-fees" class="submit-btn" style="text-decoration:none; display:inline-flex; align-items:center;">+ Add New Fee</router-link>
      </div>

      <div class="card table-card">
        <h4>Existing Configurations</h4>

        <div class="controls-row">
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input type="text" v-model="searchQuery" placeholder="Search by Project Code or Type..." class="search-input" />
            </div>
            <div class="sort-wrapper">
              <select v-model="sortBy" class="sort-select">
                <option value="code_asc">Project Code (Asc)</option>
                <option value="code_desc">Project Code (Desc)</option>
                <option value="type_asc">Connection Type (A-Z)</option>
                <option value="type_desc">Connection Type (Z-A)</option>
              </select>
            </div>
        </div>

        <table class="billing-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Type</th>
              <th>Metered</th>
              <th>Samurdhi</th> 
              <th>Fixed</th>
              <th>Slabs (Min-Max : Rate)</th>
              <th>Charges , Discounts & fines</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="billingFeesList.length === 0">
              <td colspan="8" style="text-align: center; padding: 20px;">No configurations found.</td>
            </tr>
            <tr v-for="config in billingFeesList" :key="config.id">
              <td>{{ config.projectCode }}</td>
              <td>{{ config.connectionType }}</td>
              <td>{{ config.isMetered ? 'Yes' : 'No' }}</td>
              <td>{{ config.isSamurdhi ? 'Yes' : 'No' }}</td> 
              <td>{{ config.fixedRate }}</td>
              <td>
                <div v-for="(range, idx) in config.unitRanges" :key="idx">
                  {{ range.min }} - {{ range.max }} : Rs.{{ range.rate }} 
                  <span v-if="range.fixed_charge !== undefined" style="color: #555; font-size: 11px;">
                    (Fixed: Rs.{{ range.fixed_charge }})
                  </span>
                </div>
                <div v-if="!config.unitRanges || config.unitRanges.length === 0">-</div>
              </td>
              <td>
                <div v-for="(charge, idx) in config.otherCharges" :key="'c'+idx">
                  <span style="color:#e74c3c">+ {{ charge.name }} ({{ charge.amount }}{{ charge.type === 'percentage' ? '%' : '' }})</span>
                </div>
                <div v-for="(disc, idx) in config.discounts" :key="'d'+idx">
                   <span style="color:#27ae60">- {{ disc.name }} ({{ disc.amount }}{{ disc.type === 'percentage' ? '%' : '' }})</span>
                </div>
                <div v-for="(fine, idx) in config.fines" :key="'d'+idx">
                   <span style="color:#FF7F11">- {{ fine.name }} ({{ fine.amount }}{{ fine.type === 'percentage' ? '%' : '' }})</span>
                </div>
              </td>
              <td>
                <button class="action-btn" @click="openEditModal(config)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
           <h4>Edit Configuration</h4>
           <button class="close-btn" @click="closeEditModal">×</button>
        </div>
        
        <form @submit.prevent="updateForm" class="billing-form">
           <div class="form-row">
            <div class="form-group">
              <label>Water Project Code</label>
              <input 
                type="text" 
                v-model="editForm.projectCode" 
                readonly 
                class="read-only-input"
                title="Project Code cannot be changed"
              />
            </div>

            <div class="form-group">
              <label>Connection Type</label>
              <select v-model="editForm.connectionType">
                <option v-for="type in connectionTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            
            <div class="form-group checkbox-row">
               <div class="checkbox-item">
                  <input id="editMetered" v-model="editForm.isMetered" type="checkbox" />
                  <label for="editMetered">Metered</label>
               </div>
               <div class="checkbox-item">
                  <input id="editSamurdhi" v-model="editForm.isSamurdhi" type="checkbox" />
                  <label for="editSamurdhi">Samurdhi</label>
               </div>
            </div>

            <div class="form-group">
              <label>Fixed Rate (Default) (Rs)</label>
              <input v-model="editForm.fixedRate" type="number" placeholder="0.00" required />
              </div>
          </div>

          <div class="dynamic-section01">
            <div class="section-header">Consumption Slabs (Unit Prices & Fixed Charges)</div>
            <div class="header-labels01">
                <span>Min Unit</span> 
                <span>Max Unit</span> 
                <span>Unit Price (Rs)</span> 
                <span>Fixed Charge (Rs)</span> <span></span>
            </div>
            <div v-for="(item, index) in editForm.unitRanges" :key="index" class="dynamic-row">
              <input 
                      v-model.number="item.min" 
                      type="number" 
                      placeholder="Min" 
                      class="small-input" 
                      :readonly="index !== 0"
                      :style="index !== 0 ? 'background-color: #f4f4f4; cursor: not-allowed; color: #666;' : ''"/>
              <input v-model="item.max" type="number" placeholder="Max" class="small-input" />
              <input v-model="item.rate" type="number" step="0.01" placeholder="Rate" />
              <input v-model="item.fixed_charge" type="number" step="0.01" placeholder="Fixed Rates Per Slab" />
              <button type="button" @click="removeEditUnitRange(index)" class="remove-btn">Remove</button>
            </div>
            <button type="button" @click="addEditUnitRange" class="add-btn">Add Slab</button>
          </div>

            <div class="dynamic-section">
              <div class="section-header">Taxes & Service Charges</div>
              <div v-for="(item, index) in editForm.otherCharges" :key="index" class="dynamic-row-other">
                <input v-model="item.name" type="text" placeholder="Charge Name" />
                <select v-model="item.type" class="small-select">
                   <option value="fixed">Fixed (Rs)</option>
                   <option value="percentage">%</option>
                </select>
                <input v-model="item.amount" type="number" step="0.01" placeholder="Val" />
                <button type="button" @click="removeEditOtherCharge(index)" class="remove-btn">Remove</button>
              </div>
              <button type="button" @click="addEditOtherCharge" class="add-btn">Add Charge</button>
            </div>

            <div class="dynamic-section discount-section">
              <div class="section-header">Discounts</div>
              <div v-for="(item, index) in editForm.discounts" :key="index" class="dynamic-row-other">
                <input v-model="item.name" type="text" placeholder="Discount Name" />
                <select v-model="item.type" class="small-select">
                   <option value="fixed">Fixed (Rs)</option>
                   <option value="percentage">%</option>
                </select>
                <input v-model="item.amount" type="number" step="0.01" placeholder="Val" />
                <button type="button" @click="removeEditDiscount(index)" class="remove-btn">Remove</button>
              </div>
              <button type="button" @click="addEditDiscount" class="add-btn">Add Discount</button>
            </div>
            <div class="dynamic-section fines-section">
              <div class="section-header">Fines</div>
              <div v-for="(item, index) in editForm.fines" :key="index" class="dynamic-row-other">
                <input v-model="item.name" type="text" placeholder="Fine Name" />
                <select v-model="item.type" class="small-select">
                   <option value="fixed">Fixed (Rs)</option>
                   <option value="percentage">%</option>
                </select>
                <input v-model="item.amount" type="number" step="0.01" placeholder="Val" />
                <button type="button" @click="removeEditFine(index)" class="remove-btn">Remove</button>
              </div>
              <button type="button" @click="addEditFine" class="add-btn">Add Fine</button>
            </div>

          <button type="submit" class="submit-btn" style="width:100%" :disabled="!isFormChanged">Update Configuration</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
#edit-billing-fees-container .billing-container {
    padding: 20px !important;
    max-width: 1000px !important;
    margin: 0 auto !important;
    font-family: sans-serif !important;
}

#edit-billing-fees-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin: 40px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 15px !important;
}

#edit-billing-fees-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important; 
}

#edit-billing-fees-container .content-area {
    display: flex !important;
    flex-direction: column !important;
    gap: 30px !important;
    margin: 40px !important;
}

#edit-billing-fees-container .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

#edit-billing-fees-container h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    margin-bottom: 20px !important;
    font-size: 16px !important; 
}

#edit-billing-fees-container .section-header {
    font-weight: bold !important;
    margin-bottom: 10px !important;
    color: #2c3e50 !important;
    font-size: 14px !important; 
}

/* --- FORM ELEMENTS --- */
#edit-billing-fees-container .billing-form {
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
}

#edit-billing-fees-container .form-row {
    display: flex !important;
    gap: 20px !important;
    flex-wrap: wrap !important;
}

#edit-billing-fees-container .form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
    flex: 1 !important;
    min-width: 150px !important;
    padding: 0 !important;
    margin: 0 5px !important;
}

#edit-billing-fees-container label {
    font-weight: 600 !important;
    color: #2c3e50 !important;
    font-size: 13px !important; 
}

#edit-billing-fees-container input,
#edit-billing-fees-container select {
    padding: 10px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    width: 100% !important; 
    box-sizing: border-box !important;
}

#edit-billing-fees-container input:focus,
#edit-billing-fees-container select:focus {
    outline: none !important;
    border-color: #42b883 !important;
}

#edit-billing-fees-container .checkbox-row {
    display: flex !important;
    flex-direction: row !important;
    gap: 20px !important;
    align-items: center !important;
    padding-top: 15px !important;
}

#edit-billing-fees-container .checkbox-item {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    cursor: pointer !important;
    font-size: 13px !important; 
}

#edit-billing-fees-container .checkbox-item input {
    width: auto !important; 
}

/* --- SEARCH & SORT CONTROLS --- */
#edit-billing-fees-container .controls-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 20px !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
}

#edit-billing-fees-container .search-wrapper {
    position: relative !important;
    flex: 1 !important;
    min-width: 200px !important;
}

#edit-billing-fees-container .sort-wrapper {
    position: relative !important;
    width: auto !important; 
    min-width: 150px !important;
    flex-grow: 0 !important;
}

#edit-billing-fees-container .search-icon {
    position: absolute !important;
    left: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    font-size: 14px !important; 
    color: #888 !important;
    pointer-events: none !important;
}

#edit-billing-fees-container .search-input {
    width: 100% !important;
    padding: 10px 10px 10px 30px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    box-sizing: border-box !important;
}

#edit-billing-fees-container .sort-select {
    width: 100% !important;
    padding: 10px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    background-color: white !important;
    cursor: pointer !important;
}

/* --- DYNAMIC SECTIONS --- */
/* ✅ 5 columns for the updated Add UI format */
#edit-billing-fees-container .header-labels01 {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr 1fr 50px !important; 
    gap: 10px !important;
    font-size: 13px !important; 
    font-weight: bold !important;
    margin-bottom: 5px !important;
    color: #666 !important;
}

#edit-billing-fees-container .header-labels01 span {
    text-align: center !important;
}

#edit-billing-fees-container .dynamic-section,
#edit-billing-fees-container .dynamic-section01 {
    border: 1px solid #eee !important;
    padding: 15px !important;
    border-radius: 4px !important;
    background-color: #f9f9f9 !important;
}

#edit-billing-fees-container .discount-section {
    border-color: #a8e6cf !important;
    background-color: #f0fff4 !important;
}

#edit-billing-fees-container .fines-section {
    border-color: #e6aba8 !important;
    background-color: #fff0f0 !important;
}

#edit-billing-fees-container .side-by-side-row .dynamic-section {
    flex: 1 !important;
    min-width: 0 !important; 
}

#edit-billing-fees-container .dynamic-row-other {
    display: grid !important;
    grid-template-columns: 1.5fr 1fr 1fr auto !important; 
    gap: 8px !important;
    margin-bottom: 8px !important;
    align-items: center !important;
}

@media (max-width: 850px) {
    #edit-billing-fees-container .side-by-side-row {
        flex-direction: column !important;
    }
}

/* ✅ Updated for 5 columns */
#edit-billing-fees-container .dynamic-row {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr 1fr auto !important; 
    gap: 10px !important;
    margin-bottom: 8px !important;
    align-items: center !important;
}

#edit-billing-fees-container .small-input {
    width: 100% !important;
}

#edit-billing-fees-container .small-select {
    padding: 10px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    width: 100% !important; 
    box-sizing: border-box !important;
}

/* --- BUTTONS --- */
#edit-billing-fees-container .add-btn,
#edit-billing-fees-container .remove-btn {
    border: none !important;
    padding: 6px 12px !important; 
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important; 
}

#edit-billing-fees-container .add-btn {
    background-color: #2c3e50 !important;
    color: white !important;
}

#edit-billing-fees-container .remove-btn {
    background-color: #e74c3c !important;
    color: white !important;
}

#edit-billing-fees-container .submit-btn {
    background-color: #42b883 !important;
    color: white !important;
    border: none !important;
    padding: 0 20px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    font-size: 13px !important; 
    height: 38px !important; 
}

#edit-billing-fees-container .submit-btn:hover {
    background-color: #3aa876 !important;
}

/* ✅ Disabled Button Style */
#edit-billing-fees-container .submit-btn:disabled {
    background-color: #a5d4c0 !important; 
    color: #ffffff !important;
    cursor: not-allowed !important;        
    opacity: 0.7 !important;               
    border: 1px solid #a5d4c0 !important;
}

/* --- TABLE STYLES --- */
#edit-billing-fees-container .billing-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 13px !important; 
    border: 1px solid #dee2e6 !important; 
}

#edit-billing-fees-container .billing-table th,
#edit-billing-fees-container .billing-table td {
    text-align: center !important;
    padding: 12px 0px !important;
    border: 1px solid #99a3b0 !important; 
    color: #2c3e50 !important;
    vertical-align: top !important;
}

#edit-billing-fees-container .billing-table th {
    background-color: #bcccdc !important;
    font-size: 15px !important;
    font-weight: 600 !important;
}

#edit-billing-fees-container .billing-table td {
    font-weight: 600 !important;
    font-size: 14px !important;
    vertical-align: middle !important;
}

#edit-billing-fees-container .action-btn {
    background: transparent !important;
    border: 1px solid #42b883 !important;
    color: #42b883 !important;
    padding: 6px 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important; 
}

#edit-billing-fees-container .action-btn:hover {
    background: #42b883 !important;
    color: white !important;
}

/* --- MODAL STYLES --- */
#edit-billing-fees-container .modal-overlay {
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
    animation: fadeIn 0.3s ease !important;
}

#edit-billing-fees-container .modal-content {
    background-color: #fff !important;
    padding: 25px !important;
    border-radius: 12px !important;
    width: 90% !important;
    max-width: 800px !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
    animation: slideUp 0.3s ease !important;
}

#edit-billing-fees-container .modal-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 20px !important;
    border-bottom: 2px solid #42b883 !important;
    padding-bottom: 10px !important;
}

#edit-billing-fees-container .modal-header h4 {
    margin: 0 !important;
    border: none !important;
    padding: 0 !important;
    font-size: 16px !important;
}

#edit-billing-fees-container .close-btn {
    background: none !important;
    border: none !important;
    font-size: 24px !important;
    cursor: pointer !important;
    color: #888 !important;
}

#edit-billing-fees-container .close-btn:hover {
    color: #e74c3c !important;
}

#edit-billing-fees-container .read-only-input {
    background-color: #e9ecef !important;
    color: #495057 !important;
    cursor: not-allowed !important;
    font-weight: bold !important;
    border: 1px solid #ced4da !important;
}

/* --- Animations --- */
@keyframes fadeIn {
    from { opacity: 0 !important; }
    to { opacity: 1 !important; }
}

@keyframes slideUp {
    from { transform: translateY(20px) !important; opacity: 0 !important; }
    to { transform: translateY(0) !important; opacity: 1 !important; }
}
</style>