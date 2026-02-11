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

// ✅ 1. Script Change: Added 'fixed_charge: 0' to default state
const unitRanges = ref([{ min: 0, max: 0, rate: 0, fixed_charge: 0 }])

const otherCharges = ref([{ name: '', amount: 0, type: 'fixed' }])
const discounts = ref([{ name: '', amount: 0, type: 'fixed' }])

const availableProjectCodes = ref([])

onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;

    if (!currentSabha.value) {
      alert("Session Error: Sabha Code not found. Please login again.");
    } else {
      console.log("Current Sabha Code:", currentSabha.value); 
      await fetchProjectCodes();
    }
  } else {
    alert("Session Expired. Please login again.");
  }
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

// Add Form Helpers
// ✅ 2. Script Change: Added 'fixed_charge: 0' when adding new row
const addUnitRange = () => unitRanges.value.push({ min: 0, max: 0, rate: 0, fixed_charge: 0 })

const removeUnitRange = (index) => unitRanges.value.splice(index, 1)
const addOtherCharge = () => otherCharges.value.push({ name: '', amount: 0, type: 'fixed' })
const removeOtherCharge = (index) => otherCharges.value.splice(index, 1)
const addDiscount = () => discounts.value.push({ name: '', amount: 0, type: 'fixed' })
const removeDiscount = (index) => discounts.value.splice(index, 1)

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
      
      // Reset Form
      projectCode.value = ''
      connectionType.value = 'Domestic'
      isMetered.value = false
      isSamurdhi.value = false
      fixedRate.value = null
      unitRanges.value = [{ min: 0, max: 0, rate: 0, fixed_charge: 0 }]
      otherCharges.value = [{ name: '', amount: 0, type: 'fixed' }]
      discounts.value = [{ name: '', amount: 0, type: 'fixed' }]
    }
  } catch (error) {
    console.error("Error saving:", error)
    alert("Failed to save.")
  }
}
</script>

<template>
  <div class="billing-container">
    <header class="page-header">
      <h2>Add New Billing Fee</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="content-area">
      <div class="card form-card">
        <h4>Fee Configuration Form</h4>
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
              <label>Fixed Rate (Default) (Rs)</label>
              <input v-model="fixedRate" type="number" placeholder="0.00" required />
              <small style="color: gray; font-size: 11px;">This value will be used if no slab-specific fixed charge is found.</small>
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

            <div v-for="(item, index) in unitRanges" :key="index" class="dynamic-row">
              <input v-model="item.min" type="number" placeholder="Min" class="small-input" />
              <input v-model="item.max" type="number" placeholder="Max" class="small-input" />
              <input v-model="item.rate" type="number" step="0.01" placeholder="Rate" />
              <input v-model="item.fixed_charge" type="number" step="0.01" placeholder="Fixed Rates Per Slab" />
              
              <button type="button" @click="removeUnitRange(index)" class="remove-btn" v-if="unitRanges.length > 1">Remove</button>
            </div>
            <button type="button" @click="addUnitRange" class="add-btn">+ Add Slab</button>
          </div>

          <div class="dynamic-section">
            <div class="section-header">Taxes & Service Charges</div>
            <div v-for="(item, index) in otherCharges" :key="index" class="dynamic-row-other">
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
            <div v-for="(item, index) in discounts" :key="index" class="dynamic-row-other">
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
    font-size: 14px; 
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
    font-size: 16px; 
}

.section-header {
    font-weight: bold;
    margin-bottom: 10px;
    color: #2c3e50;
    font-size: 14px; 
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
    font-size: 13px; 
}

input,
select {
    padding: 10px; 
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px; 
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
    font-size: 13px; 
}

.checkbox-item input {
    width: auto; 
}

/* --- DYNAMIC SECTIONS (Ranges, Charges) --- */
/* ✅ 4. Style Change: Updated Grid to support 4 columns + button */
.header-labels01 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 50px; 
    gap: 10px;
    font-size: 13px; 
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

/* Main Slab Row Style */
.dynamic-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr auto; 
    gap: 10px;
    margin-bottom: 8px;
    align-items: center;
}

/* Taxes and Discounts Row Style*/
.dynamic-row-other {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr auto;
    gap: 10px;
    margin-bottom: 8px;
    align-items: center;
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
    align-self: flex-start;
    font-size: 13px; 
    height: 38px; 
}

.submit-btn:hover {
    background-color: #3aa876;
}
</style>