<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const applicationNumber = ref('');
const searchResult = ref(null);
const message = ref('');

const goBack = () => {
  router.back();
};

const search = () => {
  if (!applicationNumber.value) {
    alert('Please enter an Application Number');
    return;
  }

  // Mock data fetch
  searchResult.value = {
    customerName: 'John Doe',
    assessmentBalance: 120.50,
    waterBillBalance: 45.00,
    otherBalances: 15.00,
  };

  updateMessage();
};

const totalDue = computed(() => {
  if (!searchResult.value) return 0;
  return (
    searchResult.value.assessmentBalance +
    searchResult.value.waterBillBalance +
    searchResult.value.otherBalances
  );
});

const updateMessage = () => {
  if (searchResult.value && totalDue.value > 0) {
    message.value = `Dear ${searchResult.value.customerName}, you have outstanding dues totaling $${totalDue.value.toFixed(2)} linked to Application No: ${applicationNumber.value}. Please clear them to proceed with your certificate issuance.`;
  } else {
    message.value = '';
  }
};

const sendMessage = () => {
  alert('Message sent successfully!');
};
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>Check Dues</h2>
      <button @click="goBack" class="back-link">Back to Dashboard</button>
    </header>

    <div class="card">
      <h4>Search Application</h4>
      <div class="form-group">
        <label for="app-no">Application Number</label>
        <div class="input-group">
          <input
            id="app-no"
            v-model="applicationNumber"
            type="text"
            placeholder="Enter Application Number"
          />
          <button @click="search" class="action-btn search-btn">Search</button>
        </div>
      </div>
    </div>

    <div v-if="searchResult" class="card results-card">
      <h4>Balance Summary</h4>
      
      <div class="balance-grid">
        <div class="balance-item">
          <span class="label-text">Assessment Balance:</span>
          <span class="value-text">${{ searchResult.assessmentBalance.toFixed(2) }}</span>
        </div>
        <div class="balance-item">
          <span class="label-text">Water Bill Balance:</span>
          <span class="value-text">${{ searchResult.waterBillBalance.toFixed(2) }}</span>
        </div>
        <div class="balance-item">
          <span class="label-text">Other Balances:</span>
          <span class="value-text">${{ searchResult.otherBalances.toFixed(2) }}</span>
        </div>
        <div class="balance-item total">
          <span class="label-text">Total Due:</span>
          <span class="value-text">${{ totalDue.toFixed(2) }}</span>
        </div>
      </div>

      <div v-if="totalDue > 0" class="messaging-section">
        <div class="section-label">Notify Customer</div>
        <textarea v-model="message" class="message-box" rows="4"></textarea>
        <div class="action-row">
           <button @click="sendMessage" class="action-btn send-btn">Send Message</button>
        </div>
      </div>
      <div v-else class="no-dues">
        <p>No outstanding dues found.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 900px;
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
  background: none;
  border: none;
  color: #42b883;
  text-decoration: none; /* Changed to match reference link style */
  font-weight: bold;
  font-size: 10px;
  cursor: pointer;
  padding: 0;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

h4 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  display: inline-block;
  padding-bottom: 5px;
  margin-bottom: 15px;
  font-size: 14px; /* Strict Requirement */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
}

.input-group {
  display: flex;
  gap: 10px;
}

input, textarea {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  width: 100%;
  box-sizing: border-box;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #42b883;
}

.action-btn {
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 7px; /* Strict Requirement */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.search-btn {
  background-color: #42b883; /* Matching add-btn style from reference */
}

.send-btn {
  background-color: #42b883; /* Matching submit-btn style */
}

.send-btn:hover {
  background-color: #3aa876;
}

.section-label {
  font-size: 10px;
  font-weight: bold;
  color: #42b883;
  margin-top: 10px;
  margin-bottom: 10px;
  text-transform: uppercase;
  border-bottom: 1px solid #eee;
  padding-bottom: 2px;
}

.balance-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9f9f9; /* Matching dynamic-section bg */
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
}

.balance-item {
  display: flex;
  justify-content: space-between;
  font-size: 7px;
}

.label-text {
  color: #2c3e50;
  font-weight: 600;
}

.value-text {
  color: #333;
}

.balance-item.total {
  font-weight: bold;
  border-top: 1px solid #ccc;
  padding-top: 5px;
  margin-top: 5px;
  color: #e74c3c; /* Highlight total due */
}

.messaging-section {
  margin-top: 20px;
}

.message-box {
  margin-bottom: 10px;
}

.action-row {
  display: flex;
  justify-content: flex-end;
}

.no-dues {
  margin-top: 15px;
  color: #42b883;
  font-weight: bold;
  font-size: 7px;
}
</style>
