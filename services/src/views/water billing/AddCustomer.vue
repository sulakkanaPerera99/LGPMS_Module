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
  <div id="register-customer-container" class="page-container">
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
              <label for="currReading">Current Reading</label>
              <input id="currReading" v-model="form.currentReading" type="number" placeholder="Enter current meter reading" />
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
</template>

<style scoped>
/* --- Page Layout --- */
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
</style>