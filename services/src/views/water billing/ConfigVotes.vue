<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// State variables
const currentSabha = ref('')
const currentUserNIC = ref('')
const allVoteHeads = ref([]) // මෙය empSbRates ලෙසද හැඳින්විය හැක

const fineVote = ref('')
const arrearsVote = ref('')
const currentMonthVote = ref('')
const excessVote = ref('')

// පද්ධතියට ලොග් වී ඇති සභාවේ සහ පරිශීලකයාගේ දත්ත ලබා ගැනීම
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    // ඔබ කලින් file එකේ භාවිතා කළ key ම මෙතැනටත් යොදන්න
    currentSabha.value = userData.sabha || userData.sabha_code;
    currentUserNIC.value = userData.nic || userData.emp_nic;
    
    // 1. මුලින්ම Dropdown එකට අවශ්‍ය Rate Heads (Vote Heads) ලැයිස්තුව ගෙන්වා ගන්න
    await fetchEmpRates();
    
    // 2. පසුව දැනටමත් Save කර ඇති Config ඇත්නම් ඒවා ලබාගන්න
    await fetchExistingVotes();
  } else {
    Swal.fire('Session Expired', 'Please login again.', 'error');
  }
});

// ඔබ කලින් file එකේ භාවිතා කළ එම API එකම මෙහිදීත් භාවිතා කරමු
const fetchEmpRates = async () => {
  try {
    // පවතින file එකේ තිබූ endpoint එක: `/emp-rates/${this.currentSabha}/${this.currentUserNIC}`
    const res = await axios.get(`/emp-rates/${currentSabha.value}/${currentUserNIC.value}`);
    if (res.data && res.data.data) {
      allVoteHeads.value = res.data.data;
    }
  } catch (error) {
    console.error("Error fetching emp rates:", error);
    Swal.fire('Error', 'Could not load Vote Heads from the system.', 'error');
  }
};

// දැනට පද්ධතියේ Config කර ඇති අගයන් ලබා ගැනීම
const fetchExistingVotes = async () => {
  try {
    const response = await axios.get(`/water-votes/${currentSabha.value}`);
    if (response.data) {
      fineVote.value = response.data.fine_vote || '';
      arrearsVote.value = response.data.arrears_vote || '';
      currentMonthVote.value = response.data.current_vote || '';
      excessVote.value = response.data.excess_vote || '';
    }
  } catch (error) {
    console.error("Error fetching existing configuration:", error);
  }
};

// දත්ත සුරැකීමේ Logic එක
const submitForm = async () => {
  const payload = {
    sabha_code: currentSabha.value,
    fine_vote: fineVote.value,
    arrears_vote: arrearsVote.value,
    current_vote: currentMonthVote.value,
    excess_vote: excessVote.value,
    user_nic: currentUserNIC.value
  };

  try {
    
    const response = await axios.post('/water-votes/configure', payload);
    
    if (response.data.success) {
      Swal.fire('Success', 'Configuration saved!', 'success');
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to save data', 'error');
  }
};
</script>

<template>
  <div id="water-votes-config-container" class="billing-container">
    <header class="page-header">
      <h2>Water Vote Configuration</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="content-area">
      <div class="card form-card">
        <h4>Setup Payment Vote Heads</h4>
        <p class="helper-text">Select the account codes (Vote Heads) for distributing water bill payments.</p>
        
        <form @submit.prevent="submitForm" class="billing-form">
          <div class="vote-grid">
            
            <div class="form-group">
              <label>Fine Amount Vote Head</label>
              <div class="input-wrapper">
                <i class="fas fa-gavel icon"></i>
                <select v-model="fineVote" class="custom-select" required>
                <option value="" disabled>Select Rate Head for Fines</option>
                <option v-for="rate in allVoteHeads" :key="rate.sb_rate_head" :value="rate.sb_rate_head">
                    {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Arrears Amount Vote Head</label>
              <div class="input-wrapper">
                <i class="fas fa-history icon"></i>
                <select v-model="arrearsVote" class="custom-select" required>
                <option value="" disabled>Select Rate Head for Arrears</option>
                <option v-for="rate in allVoteHeads" :key="rate.sb_rate_head" :value="rate.sb_rate_head">
                    {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Current Month Amount Vote Head</label>
              <div class="input-wrapper">
                <i class="fas fa-calendar-check icon"></i>
                <select v-model="currentMonthVote" class="custom-select" required>
                <option value="" disabled>Select Rate Head for Current Month</option>
                <option v-for="rate in allVoteHeads" :key="rate.sb_rate_head" :value="rate.sb_rate_head">
                    {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Excess Amount Vote Head</label>
              <div class="input-wrapper">
                <i class="fas fa-coins icon"></i>
                <select v-model="excessVote" class="custom-select" required>
                <option value="" disabled>Select Rate Head for Excess</option>
                <option v-for="rate in allVoteHeads" :key="rate.sb_rate_head" :value="rate.sb_rate_head">
                    {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                </option>
                </select>
              </div>
            </div>

          </div>

          <div class="action-row">
            <button type="submit" class="submit-btn">
              <i class="fas fa-save"></i> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
#water-votes-config-container .billing-container {
    padding: 20px !important;
    max-width: 900px !important;
    margin: 0 auto !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
}

#water-votes-config-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin: 30px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 15px !important;
}

#water-votes-config-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important;
}

#water-votes-config-container .content-area {
    margin: 30px !important;
}

#water-votes-config-container .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 12px !important;
    padding: 30px !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
}

#water-votes-config-container h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 3px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    margin-bottom: 10px !important;
    font-size: 18px !important;
}

#water-votes-config-container .helper-text {
    color: #666;
    font-size: 13px;
    margin-bottom: 25px;
}

#water-votes-config-container .vote-grid {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 25px !important;
}

@media (max-width: 600px) {
    #water-votes-config-container .vote-grid {
        grid-template-columns: 1fr !important;
    }
}

#water-votes-config-container .form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
}

#water-votes-config-container label {
    font-weight: 600 !important;
    color: #2c3e50 !important;
    font-size: 13.5px !important;
}

#water-votes-config-container .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

#water-votes-config-container .input-wrapper .icon {
    position: absolute;
    left: 14px;
    color: #42b883;
    font-size: 14px;
    z-index: 5;
}

/* Custom Dropdown/Select Styles */
#water-votes-config-container .custom-select {
    padding: 12px 12px 12px 42px !important;
    border: 1px solid #dcdfe6 !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    width: 100% !important;
    height: 45px !important;
    background-color: white !important;
    cursor: pointer;
    appearance: none; /* Default arrow ඉවත් කිරීම */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2342b883' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 16px;
    transition: all 0.3s;
}

#water-votes-config-container .custom-select:focus {
    outline: none !important;
    border-color: #42b883 !important;
    box-shadow: 0 0 8px rgba(66, 184, 131, 0.1) !important;
}

#water-votes-config-container .action-row {
    margin-top: 35px;
    display: flex;
    justify-content: flex-end;
}

#water-votes-config-container .submit-btn {
    background-color: #42b883 !important;
    color: white !important;
    border: none !important;
    padding: 12px 25px !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    font-weight: bold !important;
    font-size: 14px !important;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s;
}

#water-votes-config-container .submit-btn:hover {
    background-color: #3aa876 !important;
}
</style>