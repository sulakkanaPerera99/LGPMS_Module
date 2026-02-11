<script setup>
import { reactive, ref, onMounted, watch } from 'vue' 
import axios from 'axios'
import { convertToNewNic } from '../../utils/nicValidation.js';

const customerTypes = ['New Customer', 'Existing Customer']
const connectionTypes = ['Domestic', 'Commercial', 'Industrial/Construction']

// 1. Project Codes සහ Sabha Code සදහා Variables
const currentSabha = ref('');
const availableProjectCodes = ref([]);

const form = reactive({
  customerType: 'New Customer',
  oldBillNumber: '', 
  currentReading:'',
  newBillNumber: '',
  fullName: '',
  nic: '',
  propertyAddress: '',
  mailingAddress: '',
  contactInfo: '',
  connectionType: 'Domestic',
  projectCode: '', // User තෝරන Code එක මෙතනට එනවා
  isSamurdhi: false,
  samurdhiNumber: '',
  isMetered: false,
  sabhaCustomerId: null
})

// 2. Page එක Load වෙනකොටම Session Check කරලා Project Codes ගෙන්වා ගැනීම
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    
    // Sabha Code එක ගන්නවා
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;

    if (!currentSabha.value) {
      alert("Session Error: Sabha Code not found. Please login again.");
    } else {
      console.log("Current Sabha Code:", currentSabha.value); 
      // සභා කෝඩ් එක හරි නම්, Project List එක ගෙන්වා ගන්නවා
      await fetchProjectCodes();
    }
  } else {
    alert("Session Expired. Please login again.");
  }
});

// 3. Backend එකෙන් Project List එක ගෙන්වා ගන්නා Function එක (අලුතෙන් එකතු කළේ)
const fetchProjectCodes = async () => {
  try {
    // Backend Route: /api/water-projects-list/:sabha_code
    const response = await axios.get(`/water-project-list/${currentSabha.value}`);
    availableProjectCodes.value = response.data; 
    console.log("Projects Loaded:", availableProjectCodes.value);
  } catch (error) {
    console.error("Error fetching project codes:", error);
  }
};

// NIC එක වෙනස් වෙනකොට බලන් ඉන්න Watcher එකක්
// NIC Watcher Logic Update
watch(() => form.nic, async (rawNic) => {
    
    // 1. මුලින්ම Check කරනවා Input එක Valid ද කියලා (හිස් ද? දිග මදිද?)
    if (!rawNic || (rawNic.length !== 10 && rawNic.length !== 12)) {
        clearAutoFilledFields();
        return; 
    }

    // 2. මෙතනදී Convert කරනවා (10 ක් නම් 12 වෙනවා, 12 නම් එහෙමම තියෙනවා)
    const convertedNic = convertToNewNic(rawNic);

    // 3. දැන් Convert වුනු NIC එක යවනවා Backend එකට
    await fetchSabhaCustomerDetails(convertedNic);
});

const fetchSabhaCustomerDetails = async (nicForCheck) => {
    try {
        // මෙතන යන්නේ Convert වුනු (12 digits) NIC එක
        const response = await axios.get(`/check-sabha-customer/${nicForCheck}`);
        
        if (response.data.success && response.data.data) {
            const data = response.data.data;
            
            // අනිත් විස්තර පුරවන්න
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
    // Property Address එකත් Sabha Table එකෙන් එනවා නම් ඒකත් මෙතන Clear කරන්න
    // form.propertyAddress = ''; 
};

// 4. දත්ත යවන Function එක
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
      alert('Customer Registered Successfully! Bill No: ' + response.data.data.generatedBillNumber);
      
      // Form එක Reset කරනවා
      Object.assign(form, {
        customerType: 'New Customer',
        oldBillNumber: '',
        currentReading: '',
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
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>Register New Customer</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="card form-card">
      <h4>Customer Details Form</h4>
      <form @submit.prevent="submitForm" class="customer-form">
        
        <div class="form-group">
          <label for="cType">Customer Type</label>
          <select id="cType" v-model="form.customerType">
            <option v-for="type in customerTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <div class="form-row" v-if="form.customerType === 'Existing Customer'">
          <div class="form-group">
            <label for="oldBillNo">Old Bill Number</label>
            <input id="oldBillNo" v-model="form.oldBillNumber" type="text" placeholder="Enter existing bill number" />
          </div>
          <div class="form-group">
            <label for="currReading">Current Reading</label>
            <input id="currReading" v-model="form.currentReading" type="number" placeholder="Enter current meter reading" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="nic">NIC</label>
            <input id="nic" v-model="form.nic" type="text" placeholder="National Identity Card No" required />
          </div>
          <div class="form-group">
            <label for="fName">Full Name</label>
            <input id="fName" v-model="form.fullName" type="text" placeholder="Enter full name" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="pAddress">Property Address (Water Supply)</label>
            <textarea id="pAddress" v-model="form.propertyAddress" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="mAddress">Mailing Address</label>
            <textarea id="mAddress" v-model="form.mailingAddress" rows="3"></textarea>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="contact">Contact Information</label>
            <input id="contact" v-model="form.contactInfo" type="text" placeholder="Phone / Email" />
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
            <label for="samurdhi">Samurdhi Beneficiary</label>
            <input id="samurdhi" v-model="form.isSamurdhi" type="checkbox" />
          </div>
          <div class="form-group" v-if="form.isSamurdhi">
            <label for="sNumber">Samurdhi Number</label>
            <input id="sNumber" v-model="form.samurdhiNumber" type="text" placeholder="Enter Samurdhi Number" />
          </div>
        </div>

        <div class="form-group checkbox-group">
          <label for="metered">Metered Status</label>
          <input id="metered" v-model="form.isMetered" type="checkbox" />
        </div>

        <button type="submit" class="submit-btn">Register Customer</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
.page-container {
    padding: 20px;
    max-width: 800px;
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
    font-size: 14px; 
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

/* --- Form Layout --- */
.customer-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
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

.checkbox-row {
    align-items: center;
}

.checkbox-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
}

.checkbox-group input[type="checkbox"] {
    width: auto;
    margin: 0;
    padding: 0;
}

/* --- Form Elements --- */
label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 13px; 
}

input, 
select, 
textarea {
    padding: 10px; 
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px; 
    width: 100%;
    box-sizing: border-box;
}

input:focus, 
select:focus, 
textarea:focus {
    outline: none;
    border-color: #42b883;
}

/* --- Buttons --- */
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
    margin-top: 10px;
    height: 38px;
}

.submit-btn:hover {
    background-color: #3aa876;
}
</style>