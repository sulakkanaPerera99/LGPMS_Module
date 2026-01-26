<script setup>
import { ref, reactive } from 'vue'

const searchQuery = ref('')
const billFound = ref(false)

const billData = reactive({
  billNumber: '',
  billingDate: '',
  invoicePeriod: '',
  prevReading: 0,
  currReading: 0,
  unitsConsumed: 0,
  waterCharges: 0,
  fixedCharges: 0,
  monthlyCharges: 0,
  prevDues: 0,
  otherCharges: 0,
  totalAmount: 0
})

const searchBill = () => {
  if (searchQuery.value.trim()) {
    // Simulate finding a bill
    billFound.value = true
    
    // Populate with dummy data for UI demonstration
    billData.billNumber = searchQuery.value
    billData.billingDate = '2023-10-15'
    billData.invoicePeriod = '2023-09-01 to 2023-09-30'
    billData.prevReading = 12500
    billData.currReading = 12545
    billData.unitsConsumed = 45
    billData.waterCharges = 1200.00
    billData.fixedCharges = 50.00
    billData.monthlyCharges = 1250.00
    billData.prevDues = 150.00
    billData.otherCharges = 25.00
    billData.totalAmount = 1425.00
  }
}

const confirmPrint = () => {
  alert(`Print confirmed for Bill${billData.billNumber}`)
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Print Bill</h3>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <!-- Search Section -->
    <div class="card search-card">
      <div class="search-box">
        <label for="billSearch">Bill Number</label>
        <div class="input-group">
          <input 
            id="billSearch" 
            v-model="searchQuery" 
            type="text" 
            placeholder="Enter Bill Number" 
            @keyup.enter="searchBill"
          />
          <button @click="searchBill" class="search-btn">Search</button>
        </div>
      </div>
    </div>

    <!-- Bill Details Section -->
    <div v-if="billFound" class="card details-card">
      <h4>Bill Details</h4>
      
      <div class="details-grid">
        <div class="detail-item">
          <span class="label">Bill Number</span>
          <span class="value">{{ billData.billNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Billing Date</span>
          <span class="value">{{ billData.billingDate }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Invoice Period (From/To)</span>
          <span class="value">{{ billData.invoicePeriod }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Previous Reading</span>
          <span class="value">{{ billData.prevReading }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Current Reading</span>
          <span class="value">{{ billData.currReading }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Units Consumed</span>
          <span class="value">{{ billData.unitsConsumed }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Water Consumption Charges</span>
          <span class="value">{{ billData.waterCharges.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Fixed Charges</span>
          <span class="value">{{ billData.fixedCharges.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Monthly Charges</span>
          <span class="value">{{ billData.monthlyCharges.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Previous Dues</span>
          <span class="value">{{ billData.prevDues.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Other Charges</span>
          <span class="value">{{ billData.otherCharges.toFixed(2) }}</span>
        </div>
        <div class="detail-item highlight">
          <span class="label">Total Amount to Pay</span>
          <span class="value total-value">{{ billData.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <div class="action-row">
        <button @click="confirmPrint" class="confirm-btn">Print Bill</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  font-size: 10px;
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
  margin-bottom: 20px;
  font-size: 14px; /* Strict Requirement */
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 300px;
}

.input-group {
  display: flex;
  gap: 10px;
}

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  flex: 1;
}

input:focus {
  outline: none;
  border-color: #42b883;
}

.search-btn, .confirm-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 7px; /* Strict Requirement */
}

.search-btn:hover, .confirm-btn:hover {
  background-color: #3aa876;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
}

.detail-item.highlight {
  background-color: #e8f5e9;
  border-color: #42b883;
}

.detail-item .label {
  font-weight: 600;
  color: #666;
  font-size: 7px; /* Strict Requirement */
}

.detail-item .value {
  color: #2c3e50;
  font-weight: bold;
  font-size: 7px; /* Strict Requirement */
}

.total-value {
  color: #42b883 !important;
  font-size: 8px !important; /* Slightly larger for emphasis, but close to 7px */
}

.action-row {
  display: flex;
  justify-content: flex-end;
}
</style>
