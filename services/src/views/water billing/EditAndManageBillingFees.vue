<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const connectionTypes = ['Domestic', 'Commercial', 'Construction/Industrial']
const availableProjectCodes = ref([])

// Form State
const projectCode = ref('')
const connectionType = ref('Domestic')
const currentSabha = ref('')
const isMetered = ref(false)
const fixedRate = ref(null)

// Dynamic Sections State
const unitRanges = ref([{ range: '', price: 0 }])
const otherCharges = ref([{ name: '', amount: 0 }])

// Table Data (Dummy Data ඉවත් කරන ලදි, දැන් මෙය හිස් Array එකකි)
const billingFeesList = ref([])

// Fetch Project Codes on Mount
onMounted(async () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData && userData.sabha) {
      currentSabha.value = userData.sabha
      // Fetch real project list from backend
      // Assuming axios baseURL is set to include /api, otherwise use /api/water-project-list/...
      const response = await axios.get(`/water-project-list/${userData.sabha}`)
      availableProjectCodes.value = response.data

      // Fetch existing billing configurations
      await fetchBillingConfigs()
    }
  } catch (error) {
    console.error("Error fetching project codes:", error)
  }
})

// Methods
const fetchBillingConfigs = async () => {
  try {
    const response = await axios.get(`/billing-fees/${currentSabha.value}`)
    billingFeesList.value = response.data.data || response.data
  } catch (error) {
    console.error("Error fetching billing configs:", error)
  }
}

const addUnitRange = () => {
  unitRanges.value.push({ range: '', price: 0 })
}

const removeUnitRange = (index) => {
  unitRanges.value.splice(index, 1)
}

const addOtherCharge = () => {
  otherCharges.value.push({ name: '', amount: 0 })
}

const removeOtherCharge = (index) => {
  otherCharges.value.splice(index, 1)
}

const submitForm = async () => {
  if (fixedRate.value === null) return

  const payload = {
    projectCode: projectCode.value || 'General Config',
    connectionType: connectionType.value,
    isMetered: isMetered.value,
    fixedRate: fixedRate.value,
    unitRanges: unitRanges.value,
    otherCharges: otherCharges.value,
    sabha_code: currentSabha.value
  }

  try {
    const response = await axios.post('/billing-fees', payload)
    
    if (response.status === 200 || response.status === 201) {
      alert("Configuration Saved Successfully!")
      await fetchBillingConfigs()

      // Reset Form
      projectCode.value = ''
      connectionType.value = 'Domestic'
      isMetered.value = false
      fixedRate.value = null
      unitRanges.value = [{ range: '', price: 0 }]
      otherCharges.value = [{ name: '', amount: 0 }]
    }
  } catch (error) {
    console.error("Error saving configuration:", error)
    alert("Failed to save configuration.")
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
              <label for="pCode">Water Project Code</label>
              <select id="pCode" v-model="projectCode">
                <option value="">None (General Config)</option>
                <option v-for="project in availableProjectCodes" :key="project.code" :value="project.code">
                  {{ project.code }} - {{ project.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="cType">Type of Water Connection</label>
              <select id="cType" v-model="connectionType">
                <option v-for="type in connectionTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div class="form-group checkbox-group">
              <label for="metered">Metered or Not</label>
              <input id="metered" v-model="isMetered" type="checkbox" />
            </div>
            <div class="form-group">
              <label for="fRate">Fixed Rates</label>
              <input id="fRate" v-model="fixedRate" type="number" placeholder="0.00" required />
            </div>
          </div>

          <div class="dynamic-section">
            <div class="section-header">Unit Prices</div>
            <div v-for="(item, index) in unitRanges" :key="index" class="dynamic-row">
              <input v-model="item.range" type="text" placeholder="Range (e.g. 1-10)" />
              <input v-model="item.price" type="number" placeholder="Price" />
              <button type="button" @click="removeUnitRange(index)" class="remove-btn" v-if="unitRanges.length > 1">Remove</button>
            </div>
            <button type="button" @click="addUnitRange" class="add-btn">+ Add Range</button>
          </div>

          <div class="dynamic-section">
            <div class="section-header">Other Charges</div>
            <div v-for="(item, index) in otherCharges" :key="index" class="dynamic-row">
              <input v-model="item.name" type="text" placeholder="Charge Name" />
              <input v-model="item.amount" type="number" placeholder="Amount" />
              <button type="button" @click="removeOtherCharge(index)" class="remove-btn" v-if="otherCharges.length > 1">Remove</button>
            </div>
            <button type="button" @click="addOtherCharge" class="add-btn">+ Add Charge</button>
          </div>

          <button type="submit" class="submit-btn">Save Configuration</button>
        </form>
      </div>

      <div class="card table-card">
        <h4>Existing Configurations</h4>
        <table class="billing-table">
          <thead>
            <tr>
              <th>Project Code</th>
              <th>Connection Type</th>
              <th>Metered</th>
              <th>Fixed Rate</th>
              <th>Unit Ranges</th>
              <th>Other Charges</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="billingFeesList.length === 0">
              <td colspan="7" style="text-align: center; padding: 20px;">No configurations added yet.</td>
            </tr>
            <tr v-for="config in billingFeesList" :key="config.id">
              <td>{{ config.projectCode }}</td>
              <td>{{ config.connectionType }}</td>
              <td>{{ config.isMetered ? 'Yes' : 'No' }}</td>
              <td>{{ config.fixedRate }}</td>
              <td>
                <div v-for="(range, idx) in config.unitRanges" :key="idx">
                  {{ range.range }}: {{ range.price }}
                </div>
                <div v-if="config.unitRanges.length === 0">-</div>
              </td>
              <td>
                <div v-for="(charge, idx) in config.otherCharges" :key="idx">
                  {{ charge.name }}: {{ charge.amount }}
                </div>
                <div v-if="config.otherCharges.length === 0">-</div>
              </td>
              <td>
                <button class="action-btn">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  font-size: 14px; /* Strict Requirement */
}

.section-header {
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
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

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
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

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
}

input, select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
}

input:focus, select:focus {
  outline: none;
  border-color: #42b883;
}

.dynamic-section {
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.dynamic-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.add-btn, .remove-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 7px; /* Strict Requirement */
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
  font-size: 7px; /* Strict Requirement */
}

.submit-btn:hover {
  background-color: #3aa876;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7px; /* Strict Requirement */
}

.billing-table th,
.billing-table td {
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
}

.billing-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}
</style>