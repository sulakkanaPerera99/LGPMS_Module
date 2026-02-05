<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const connectionTypes = ['Domestic', 'Commercial', 'Construction/Industrial']
const currentSabha = ref('')
const currentUserNIC = ref('') 

// --- Search & Sort State
const searchQuery = ref('')
const sortBy = ref('code_asc') // Default sort by Project Code

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
  discounts: []
})

// Table Data
const billingFeesList = ref([])
const availableProjectCodes = ref([])

onMounted(async () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData && userData.sabha) {
      currentSabha.value = userData.sabha
      currentUserNIC.value = userData.nic || 'UNKNOWN_USER'
      
      // Fetch Project Codes (Mock or API)
      availableProjectCodes.value = [{code: 'WP001', name: 'Main Water'}, {code: 'WP002', name: 'Rural Scheme'}] 

      await fetchBillingConfigs()
    }
  } catch (error) {
    console.error("Error init:", error)
  }
})

// --- Watchers for Search & Sort
// Debounce search slightly to prevent too many API calls while typing
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
    // Construct Query Params
    const params = {};
    
    if (searchQuery.value && searchQuery.value.trim() !== '') {
        params.search = searchQuery.value.trim();
    }
    
    if (sortBy.value) {
        params.sort = sortBy.value;
    }

    // Call API with Params
    const response = await axios.get(`/billing-fees/${currentSabha.value}`, { params })
    billingFeesList.value = response.data.data || response.data
  } catch (error) {
    console.error("Error fetching configs:", error)
  }
}

// --- Edit Form Helpers ---
const addEditUnitRange = () => editForm.value.unitRanges.push({ min: 0, max: 0, rate: 0 })
const removeEditUnitRange = (index) => editForm.value.unitRanges.splice(index, 1)
const addEditOtherCharge = () => editForm.value.otherCharges.push({ name: '', amount: 0, type: 'fixed' })
const removeEditOtherCharge = (index) => editForm.value.otherCharges.splice(index, 1)
const addEditDiscount = () => editForm.value.discounts.push({ name: '', amount: 0, type: 'fixed' })
const removeEditDiscount = (index) => editForm.value.discounts.splice(index, 1)

// --- Open Modal Logic ---
const openEditModal = (config) => {
  editId.value = config.id
  editForm.value = JSON.parse(JSON.stringify({
    projectCode: config.projectCode,
    connectionType: config.connectionType,
    isMetered: config.isMetered,
    isSamurdhi: config.isSamurdhi,
    fixedRate: config.fixedRate,
    unitRanges: config.unitRanges || [],
    otherCharges: config.otherCharges || [],
    discounts: config.discounts || []
  }))
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editId.value = null
}

// --- Update Logic ---
const updateForm = async () => {
  if (editForm.value.fixedRate === null) return

  const payload = {
    ...editForm.value,
    user_nic: currentUserNIC.value,
    sabha_code: currentSabha.value
  }

  try {
    const response = await axios.put(`/billing-fees/${editId.value}`, payload)
    
    if (response.status === 200) {
      alert("Configuration Updated Successfully!")
      await fetchBillingConfigs()
      closeEditModal()
    }
  } catch (error) {
    console.error("Error updating:", error)
    alert("Failed to update configuration.")
  }
}
</script>

<template>
  <div class="billing-container">
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
              <th>Samurdhi</th> <th>Fixed</th>
              <th>Slabs (Min-Max : Rate)</th>
              <th>Charges & Discounts</th>
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
              <td>{{ config.isSamurdhi ? 'Yes' : 'No' }}</td> <td>{{ config.fixedRate }}</td>
              <td>
                <div v-for="(range, idx) in config.unitRanges" :key="idx">
                  {{ range.min }} - {{ range.max }} : Rs.{{ range.rate }}
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
              <label>Fixed Rate (Rs)</label>
              <input v-model="editForm.fixedRate" type="number" placeholder="0.00" required />
            </div>
          </div>

          <div class="dynamic-section01">
            <div class="section-header">Consumption Slabs (Unit Prices)</div>
            <div class="header-labels01">
                <span>Min Unit</span> <span>Max Unit</span> <span>Rate (Rs)</span> <span></span>
            </div>
            <div v-for="(item, index) in editForm.unitRanges" :key="index" class="dynamic-row">
              <input v-model="item.min" type="number" class="small-input" />
              <input v-model="item.max" type="number" class="small-input" />
              <input v-model="item.rate" type="number" step="0.01" />
              <button type="button" @click="removeEditUnitRange(index)" class="remove-btn">Remove</button>
            </div>
            <button type="button" @click="addEditUnitRange" class="add-btn">+ Add Slab</button>
          </div>

          <div class="dynamic-section">
            <div class="section-header">Taxes & Service Charges</div>
            <div v-for="(item, index) in editForm.otherCharges" :key="index" class="dynamic-row">
              <input v-model="item.name" type="text" />
              <select v-model="item.type" class="small-select">
                 <option value="fixed">Fixed</option>
                 <option value="percentage">%</option>
              </select>
              <input v-model="item.amount" type="number" step="0.01" />
              <button type="button" @click="removeEditOtherCharge(index)" class="remove-btn">Remove</button>
            </div>
            <button type="button" @click="addEditOtherCharge" class="add-btn">+ Add Charge</button>
          </div>

          <div class="dynamic-section discount-section">
            <div class="section-header">Discounts</div>
            <div v-for="(item, index) in editForm.discounts" :key="index" class="dynamic-row">
              <input v-model="item.name" type="text" />
              <select v-model="item.type" class="small-select">
                 <option value="fixed">Fixed</option>
                 <option value="percentage">%</option>
              </select>
              <input v-model="item.amount" type="number" step="0.01" />
              <button type="button" @click="removeEditDiscount(index)" class="remove-btn">Remove</button>
            </div>
            <button type="button" @click="addEditDiscount" class="add-btn">+ Add Discount</button>
          </div>

          <button type="submit" class="submit-btn" style="width:100%">Update Configuration</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
.billing-container {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
    font-family: sans-serif;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
}

.back-link {
    color: #42b883;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px; /* Increased */
}

.content-area {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

h4 {
    margin-top: 0;
    color: #2c3e50;
    border-bottom: 2px solid #42b883;
    display: inline-block;
    padding-bottom: 5px;
    margin-bottom: 20px;
    font-size: 16px; /* Increased */
}

.section-header {
    font-weight: bold;
    margin-bottom: 10px;
    color: #2c3e50;
    font-size: 14px; /* Increased */
}

/* --- FORM ELEMENTS --- */
.billing-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-row {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
    min-width: 150px;
}

label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 13px; /* Increased */
}

input,
select {
    padding: 10px; /* Increased padding */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px; /* Increased */
    width: 100%;
    box-sizing: border-box;
}

input:focus,
select:focus {
    outline: none;
    border-color: #42b883;
}

.checkbox-row {
    display: flex;
    flex-direction: row;
    gap: 20px;
    align-items: center;
    padding-top: 15px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    font-size: 13px; /* Increased */
}

.checkbox-item input {
    width: auto;
}

/* --- SEARCH & SORT CONTROLS --- */
.controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
    flex-wrap: wrap;
}

.search-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.sort-wrapper {
    position: relative;
    width: auto; 
    min-width: 150px;
    flex-grow: 0;
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
    padding: 10px 10px 10px 30px; /* Padding for icon */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    box-sizing: border-box;
}

.sort-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    background-color: white;
    cursor: pointer;
}

/* --- DYNAMIC SECTIONS --- */
.header-labels01 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 50px;
    gap: 10px;
    font-size: 13px; /* Increased */
    font-weight: bold;
    margin-bottom: 5px;
    color: #666;
}

.header-labels01 span {
    text-align: center;
}

.dynamic-section,
.dynamic-section01 {
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 4px;
    background-color: #f9f9f9;
}

.discount-section {
    border-color: #a8e6cf;
    background-color: #f0fff4;
}

.dynamic-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 10px;
    margin-bottom: 8px;
    align-items: center;
}

.dynamic-section:not(:first-of-type) .dynamic-row {
    grid-template-columns: 2fr 1fr 1fr auto;
}

.small-input {
    width: 100%;
}

.small-select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    width: 100%;
    box-sizing: border-box;
}

/* --- BUTTONS --- */
.add-btn,
.remove-btn {
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.add-btn {
    background-color: #2c3e50;
    color: white;
}

.remove-btn {
    background-color: #e74c3c;
    color: white;
}

.submit-btn {
    background-color: #42b883;
    color: white;
    border: none;
    padding: 0 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px; /* Increased */
    height: 38px;
}

.submit-btn:hover {
    background-color: #3aa876;
}

/* --- TABLE STYLES --- */
.billing-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px; /* Increased */
}

.billing-table th,
.billing-table td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
    vertical-align: top;
}

.billing-table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.action-btn {
    background: transparent;
    border: 1px solid #42b883;
    color: #42b883;
    padding: 6px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.action-btn:hover {
    background: #42b883;
    color: white;
}

/* --- MODAL STYLES --- */
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
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background-color: #fff;
    padding: 25px;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 2px solid #42b883;
    padding-bottom: 10px;
}

.modal-header h4 {
    margin: 0;
    border: none;
    padding: 0;
    font-size: 16px;
}

.close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #888;
}

.close-btn:hover {
    color: #e74c3c;
}

.read-only-input {
    background-color: #e9ecef;
    color: #495057;
    cursor: not-allowed;
    font-weight: bold;
    border: 1px solid #ced4da;
}

/* --- Animations --- */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>