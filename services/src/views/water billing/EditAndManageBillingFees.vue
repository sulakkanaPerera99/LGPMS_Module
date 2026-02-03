<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const connectionTypes = ['Domestic', 'Commercial', 'Construction/Industrial']

// Form State (For Adding)
const projectCode = ref('')
const connectionType = ref('Domestic')
const currentSabha = ref('')
const isMetered = ref(false)
const isSamurdhi = ref(false)
const fixedRate = ref(null)
const unitRanges = ref([{ min: 0, max: 0, rate: 0 }])
const otherCharges = ref([{ name: '', amount: 0, type: 'fixed' }])
const discounts = ref([{ name: '', amount: 0, type: 'fixed' }])

// --- NEW: Edit Form State (Separate state for the modal) ---
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
const currentUserNIC = ref('') // To store NIC

// Table Data & Meta
const billingFeesList = ref([])
const availableProjectCodes = ref([])

onMounted(async () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData && userData.sabha) {
      currentSabha.value = userData.sabha
      currentUserNIC.value = userData.nic || 'UNKNOWN_USER' // NIC එක ලබා ගැනීම
      
      // Fetch Project Codes (Dummy data or API)
      // const response = await axios.get(`/water-project-list/${userData.sabha}`)
      // availableProjectCodes.value = response.data
      availableProjectCodes.value = [{code: 'WP001', name: 'Main Water'}, {code: 'WP002', name: 'Rural Scheme'}] // Example

      await fetchBillingConfigs()
    }
  } catch (error) {
    console.error("Error init:", error)
  }
})

// --- Methods ---

const fetchBillingConfigs = async () => {
  try {
    const response = await axios.get(`/billing-fees/${currentSabha.value}`)
    billingFeesList.value = response.data.data || response.data
  } catch (error) {
    console.error("Error fetching configs:", error)
  }
}

// Add Form Helpers
const addUnitRange = () => unitRanges.value.push({ min: 0, max: 0, rate: 0 })
const removeUnitRange = (index) => unitRanges.value.splice(index, 1)
const addOtherCharge = () => otherCharges.value.push({ name: '', amount: 0, type: 'fixed' })
const removeOtherCharge = (index) => otherCharges.value.splice(index, 1)
const addDiscount = () => discounts.value.push({ name: '', amount: 0, type: 'fixed' })
const removeDiscount = (index) => discounts.value.splice(index, 1)

// --- NEW: Edit Form Helpers ---
// Modal එකේ තියෙන Dynamic Rows Manage කරන්න
const addEditUnitRange = () => editForm.value.unitRanges.push({ min: 0, max: 0, rate: 0 })
const removeEditUnitRange = (index) => editForm.value.unitRanges.splice(index, 1)
const addEditOtherCharge = () => editForm.value.otherCharges.push({ name: '', amount: 0, type: 'fixed' })
const removeEditOtherCharge = (index) => editForm.value.otherCharges.splice(index, 1)
const addEditDiscount = () => editForm.value.discounts.push({ name: '', amount: 0, type: 'fixed' })
const removeEditDiscount = (index) => editForm.value.discounts.splice(index, 1)

// --- NEW: Open Modal Logic ---
const openEditModal = (config) => {
  editId.value = config.id
  // Deep copy to prevent editing table directly before saving
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

// --- Submit Logic (Add New) ---
const submitForm = async () => {
  if (fixedRate.value === null) return

  const payload = {
    sabha_code: currentSabha.value,
    projectCode: projectCode.value || 'General Config',
    connectionType: connectionType.value,
    isMetered: isMetered.value ? 1 : 0,
    isSamurdhi: isSamurdhi.value ? 1 : 0,
    fixedRate: fixedRate.value,
    unitRanges: unitRanges.value,     
    otherCharges: otherCharges.value,
    discounts: discounts.value
  }

  try {
    const response = await axios.post('/billing-fees', payload)
    if (response.status === 200 || response.status === 201) {
      alert("Configuration Saved Successfully!")
      await fetchBillingConfigs()
      // Reset
      projectCode.value = ''
      connectionType.value = 'Domestic'
      isMetered.value = false
      isSamurdhi.value = false
      fixedRate.value = null
      unitRanges.value = [{ min: 0, max: 0, rate: 0 }]
      otherCharges.value = [{ name: '', amount: 0, type: 'fixed' }]
      discounts.value = [{ name: '', amount: 0, type: 'fixed' }]
    }
  } catch (error) {
    console.error("Error saving:", error)
    alert("Failed to save.")
  }
}

// --- NEW: Update Logic (Edit) ---
const updateForm = async () => {
  if (editForm.value.fixedRate === null) return

  const payload = {
    ...editForm.value,
    user_nic: currentUserNIC.value, // Pass NIC for created_by
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
      <h2>Edit and Manage Billing Fees</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="content-area">
      <div class="card form-card">
        <h4>Add New Fee Configuration</h4>
        <form @submit.prevent="submitForm" class="billing-form">
          <div class="form-row">
            <div class="form-group">
              <label>Water Project Code</label>
              <select v-model="projectCode">
                <option value="">Select Project</option>
                <option v-for="project in availableProjectCodes" :key="project.code" :value="project.code">
                  {{ project.code }} - {{ project.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Connection Type</label>
              <select v-model="connectionType">
                <option v-for="type in connectionTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            
            <div class="form-group checkbox-row">
               <div class="checkbox-item">
                  <input id="metered" v-model="isMetered" type="checkbox" />
                  <label for="metered">Metered</label>
               </div>
               <div class="checkbox-item">
                  <input id="samurdhi" v-model="isSamurdhi" type="checkbox" />
                  <label for="samurdhi">Samurdhi</label>
               </div>
            </div>

            <div class="form-group">
              <label>Fixed Rate (Rs)</label>
              <input v-model="fixedRate" type="number" placeholder="0.00" required />
            </div>
          </div>

          <div class="dynamic-section01">
            <div class="section-header">Consumption Slabs (Unit Prices)</div>
            <div class="header-labels01">
                <span>Min Unit</span> <span>Max Unit</span> <span>Rate (Rs)</span> <span></span>
            </div>
            <div v-for="(item, index) in unitRanges" :key="index" class="dynamic-row">
              <input v-model="item.min" type="number" placeholder="Min" class="small-input" />
              <input v-model="item.max" type="number" placeholder="Max" class="small-input" />
              <input v-model="item.rate" type="number" step="0.01" placeholder="Price" />
              <button type="button" @click="removeUnitRange(index)" class="remove-btn" v-if="unitRanges.length > 1">Remove</button>
            </div>
            <button type="button" @click="addUnitRange" class="add-btn">+ Add Slab</button>
          </div>

          <div class="dynamic-section">
            <div class="section-header">Taxes & Service Charges</div>
            <div v-for="(item, index) in otherCharges" :key="index" class="dynamic-row">
              <input v-model="item.name" type="text" placeholder="Charge Name" />
              <select v-model="item.type" class="small-select">
                 <option value="fixed">Fixed (Rs)</option>
                 <option value="percentage">%</option>
              </select>
              <input v-model="item.amount" type="number" step="0.01" placeholder="Val" />
              <button type="button" @click="removeOtherCharge(index)" class="remove-btn" v-if="otherCharges.length > 1">Remove</button>
            </div>
            <button type="button" @click="addOtherCharge" class="add-btn">+ Add Charge</button>
          </div>

          <div class="dynamic-section discount-section">
            <div class="section-header">Discounts</div>
            <div v-for="(item, index) in discounts" :key="index" class="dynamic-row">
              <input v-model="item.name" type="text" placeholder="Discount Name" />
              <select v-model="item.type" class="small-select">
                 <option value="fixed">Fixed (Rs)</option>
                 <option value="percentage">%</option>
              </select>
              <input v-model="item.amount" type="number" step="0.01" placeholder="Val" />
              <button type="button" @click="removeDiscount(index)" class="remove-btn" v-if="discounts.length > 1">Remove</button>
            </div>
            <button type="button" @click="addDiscount" class="add-btn">+ Add Discount</button>
          </div>

          <button type="submit" class="submit-btn">Save Configuration</button>
        </form>
      </div>

      <div class="card table-card">
        <h4>Existing Configurations</h4>
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
              <td colspan="8" style="text-align: center; padding: 20px;">No configurations added yet.</td>
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
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

/* --- MAIN PAGE REUSABLE STYLES --- */

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
  font-size: 12px;
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
  font-size: 14px;
}

.section-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 10px;
}

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
  font-size: 10px;
}

input,
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 10px;
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
}

.header-labels01 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 50px;
  gap: 10px;
  font-size: 9px;
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
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 10px;
}

.add-btn,
.remove-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
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
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  align-self: flex-start;
  font-size: 10px;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}

.billing-table th,
.billing-table td {
  text-align: left;
  padding: 10px;
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
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 9px;
}

.action-btn:hover {
  background: #42b883;
  color: white;
}

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
  font-size: 12px;
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
  font-size: 14px;
}

.section-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 10px; /* From new file */
}

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
  font-size: 10px; /* Matched to new file */
}

input, select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 10px; /* Matched to new file */
}

input:focus, select:focus {
  outline: none;
  border-color: #42b883;
}

/* --- NEW CSS CLASSES (Merged from Top File) --- */

.checkbox-row {
   display: flex;
   flex-direction: row; /* Overriding default column */
   gap: 20px;
   align-items: center;
   padding-top: 15px;
}

.checkbox-item {
   display: flex;
   align-items: center;
   gap: 5px;
   cursor: pointer;
}

.header-labels {
   display: grid;
   grid-template-columns: 1fr 1fr 1fr 50px; /* Adjusted for remove button */
   gap: 10px;
   font-size: 9px;
   font-weight: bold;
   margin-bottom: 5px;
   color: #666;
}

.header-labels01 {
   display: grid;
   grid-template-columns: 1fr 1fr 1fr 50px; /* Adjusted for remove button */
   gap: 10px;
   font-size: 9px;
   font-weight: bold;
   margin-bottom: 5px;
   color: #666;
}

.header-labels01 span {
   text-align: center;
}

.dynamic-section {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

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

/* Grid Layout for Dynamic Rows */
.dynamic-row {
   display: grid;
   grid-template-columns: 1fr 1fr 1fr auto; /* For Slabs */
   gap: 10px;
   margin-bottom: 8px;
   align-items: center;
}

/* Specific Grid for Charges & Discounts (Name, Type, Amount, Btn) */
.dynamic-section:not(:first-of-type) .dynamic-row {
   grid-template-columns: 2fr 1fr 1fr auto; 
}

.small-input {
   width: 100%;
}

.small-select {
   padding: 8px;
   border: 1px solid #ccc;
   border-radius: 4px;
   font-size: 10px;
}

/* Buttons */
.add-btn, .remove-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
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
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  align-self: flex-start;
  font-size: 10px;
}

.submit-btn:hover {
  background-color: #3aa876;
}

/* Table Styles */
.billing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px; /* Slightly adjusted for better read */
}

.billing-table th,
.billing-table td {
  text-align: left;
  padding: 10px;
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
  padding: 3px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 9px;
}

.action-btn:hover {
  background: #42b883;
  color: white;
}
</style>