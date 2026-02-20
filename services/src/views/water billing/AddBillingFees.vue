<script setup>
import { ref, onMounted, watch} from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

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


// unitRanges වෙනස් වන විට ඊළඟ Slab වල Min අගයන් නිවැරදි කිරීම
watch(unitRanges, (newRanges) => {
  for (let i = 1; i < newRanges.length; i++) {
    const previousMax = Number(newRanges[i - 1].max);
    newRanges[i].min = previousMax + 1;
  }
}, { deep: true });

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
const validateSlabs = () => {
  unitRanges.value.forEach((range, index) => {
    if (index > 0) {
      
      const prevMax = Number(unitRanges.value[index - 1].max);
      range.min = prevMax + 1;
    }
  });
}

const addUnitRange = () => {
  const lastIndex = unitRanges.value.length - 1;
  const lastMax = Number(unitRanges.value[lastIndex].max);
  
  unitRanges.value.push({ 
    min: lastMax + 1,
    rate: 0, 
    fixed_charge: 0 
  });
}

const removeUnitRange = (index) => {
  unitRanges.value.splice(index, 1);
  validateSlabs();
}

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
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: 'Configuration saved successfully.',
        timer: 2000,
        showConfirmButton: false
    });
      
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
       if (error.response && error.response.status === 409) {
            Swal.fire({
                icon: 'warning',
                title: 'Duplicate Configuration',
                text: error.response.data.message,
                confirmButtonColor: '#f39c12'
            });
        } else if (error.response && error.response.data && error.response.data.message) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response.data.message
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: 'Can not connect to the server. Please try again.'
            });
        }
  }
}
</script>

<template>
  <div id="add-billing-fees-container" class="billing-container">
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
              <input v-model.number="item.min" type="number" placeholder="Min" class="small-input" :readonly="index !== 0"
              :style="index !== 0 ? 'background-color: #f4f4f4; cursor: not-allowed; color: #666;' : ''"
               />
      
              <input v-model="item.max" type="number" class="small-input" />
              <input v-model="item.rate" type="number" step="0.01" placeholder="Rate" />
              <input v-model="item.fixed_charge" type="number" step="0.01" placeholder="Fixed Rates Per Slab" />
              
              <button type="button" @click="removeUnitRange(index)" class="remove-btn" v-if="unitRanges.length > 1">Remove</button>
            </div>
            <button type="button" @click="addUnitRange" class="add-btn">+ Add Slab</button>
          </div>

          <div class="side-by-side-row">
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
</div>

          <button type="submit" class="submit-btn">Save Configuration</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
#add-billing-fees-container .billing-container {
    padding: 20px !important;
    max-width: 1000px !important;
    margin: 0 auto !important;
    font-family: sans-serif !important;
}

#add-billing-fees-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin: 30px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 15px !important;
}

#add-billing-fees-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important; 
}

#add-billing-fees-container .content-area {
    display: flex !important;
    flex-direction: column !important;
    gap: 30px !important;
    margin: 30px !important;
}

#add-billing-fees-container .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

#add-billing-fees-container h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    margin-bottom: 20px !important;
    font-size: 16px !important; 
}

#add-billing-fees-container .section-header {
    font-weight: bold !important;
    margin-bottom: 10px !important;
    color: #2c3e50 !important;
    font-size: 14px !important; 
}

/* --- FORM ELEMENTS --- */
#add-billing-fees-container .billing-form {
    display: flex !important;
    flex-direction: column !important;
    gap: 20px !important;
}

#add-billing-fees-container .form-row {
    display: flex !important;
    gap: 20px !important;
    flex-wrap: wrap !important;
}

#add-billing-fees-container .form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
    flex: 1 !important;
    min-width: 150px !important;
    padding: 0 !important;
    margin: 0 5px !important;
}

#add-billing-fees-container label {
    font-weight: 600 !important;
    color: #2c3e50 !important;
    font-size: 13px !important; 
}

#add-billing-fees-container input,
#add-billing-fees-container select {
    padding: 10px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    width: 100% !important; 
    box-sizing: border-box !important;
}

#add-billing-fees-container input:focus,
#add-billing-fees-container select:focus {
    outline: none !important;
    border-color: #42b883 !important;
}

#add-billing-fees-container .checkbox-row {
    display: flex !important;
    flex-direction: row !important;
    gap: 20px !important;
    align-items: center !important;
    padding-top: 15px !important;
}

#add-billing-fees-container .checkbox-item {
    display: flex !important;
    align-items: center !important;
    gap: 5px !important;
    cursor: pointer !important;
    font-size: 13px !important; 
}

#add-billing-fees-container .checkbox-item input {
    width: auto !important; 
}

/* --- DYNAMIC SECTIONS --- */
#add-billing-fees-container .header-labels01 {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr 1fr 50px !important; 
    gap: 10px !important;
    font-size: 13px !important; 
    font-weight: bold !important;
    margin-bottom: 5px !important;
    color: #666 !important;
}

#add-billing-fees-container .header-labels01 span {
    text-align: center !important;
}

#add-billing-fees-container .dynamic-section,
#add-billing-fees-container .dynamic-section01 {
    border: 1px solid #eee !important;
    padding: 15px !important;
    border-radius: 4px !important;
    background-color: #f9f9f9 !important;
}

#add-billing-fees-container .discount-section {
    border-color: #a8e6cf !important;
    background-color: #f0fff4 !important;
}

/* ✅ සෙක්ෂන් දෙක පේළියකට ගැනීමට එක් කළ Layout එක */
#add-billing-fees-container .side-by-side-row {
    display: flex !important;
    gap: 20px !important;
    flex-wrap: nowrap !important; 
    align-items: flex-start !important;
}


#add-billing-fees-container .side-by-side-row .dynamic-section {
    flex: 1 !important;
    min-width: 0 !important; /* Overflow omit */
}

#add-billing-fees-container .dynamic-row-other {
    display: grid !important;
    grid-template-columns: 1.5fr 1fr 1fr auto !important; 
    gap: 8px !important;
    margin-bottom: 8px !important;
    align-items: center !important;
}

/* small screen (Responsive) */
@media (max-width: 850px) {
    #add-billing-fees-container .side-by-side-row {
        flex-direction: column !important;
    }
}

#add-billing-fees-container .dynamic-row {
    display: grid !important;
    grid-template-columns: 1fr 1fr 1fr 1fr auto !important; 
    gap: 10px !important;
    margin-bottom: 8px !important;
    align-items: center !important;
}

#add-billing-fees-container .dynamic-row-other {
    display: grid !important;
    grid-template-columns: 2fr 1fr 1fr auto !important;
    gap: 10px !important;
    margin-bottom: 8px !important;
    align-items: center !important;
}

#add-billing-fees-container .small-input {
    width: 100% !important;
}

#add-billing-fees-container .small-select {
    padding: 10px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    width: 100% !important;
    box-sizing: border-box !important;
}

/* --- BUTTONS --- */
#add-billing-fees-container .add-btn,
#add-billing-fees-container .remove-btn {
    border: none !important;
    padding: 6px 12px !important; 
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important; 
}

#add-billing-fees-container .add-btn {
    background-color: #2c3e50 !important;
    color: white !important;
}

#add-billing-fees-container .remove-btn {
    background-color: #e74c3c !important;
    color: white !important;
}

#add-billing-fees-container .submit-btn {
    background-color: #42b883 !important;
    color: white !important;
    border: none !important;
    padding: 0 20px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    align-self: flex-start !important;
    font-size: 13px !important; 
    height: 38px !important; 
}

#add-billing-fees-container .submit-btn:hover {
    background-color: #3aa876 !important;
}
</style>