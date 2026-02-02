<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const accountId = route.params.accountId;

// Mock Data - Structure ready for API integration
const billData = ref({
    id: accountId,
    customerName: 'K.G. Gunapala',
    nic: '851234567V',
    billNumber: 'WB-2023-001',
    billingDate: '2023-10-15',
    invoicePeriod: 'September 2023',
    prevReading: 1450,
    currReading: 1485,
    unitsConsumed: 35,
    waterCharges: 1250.00,
    fixedCharges: 50.00,
    monthlyCharges: 1300.00,
    previousDues: 150.00,
    otherCharges: 20.00,
    totalAmount: 1470.00
});

const paymentAmount = ref(0);

onMounted(() => {
    // Initialize payment amount with total due
    if (billData.value) {
        paymentAmount.value = billData.value.totalAmount;
    }
});

const confirmPayment = () => {
    // Placeholder for API call
    console.log(`Processing payment of Rs. ${paymentAmount.value} for Account ${accountId}`);
    alert(`Payment of Rs. ${paymentAmount.value} confirmed!`);
    router.push('/bill-payment'); // Redirect back to list after success
};
</script>

<template>
    <div class="page-container">
        <header class="page-header">
            <h3>Process Payment</h3>
            <!-- Assuming the list page route is /bill-payment -->
            <router-link to="/bill-payment" class="back-link">Back to Customer List</router-link>
        </header>

        <!-- Customer Info Section -->
        <div class="card info-card">
            <h4>Customer Information</h4>
            <div class="info-row">
                <div class="info-item">
                    <span class="label">Customer Name:</span>
                    <span class="value">{{ billData.customerName }}</span>
                </div>
                <div class="info-item">
                    <span class="label">NIC:</span>
                    <span class="value">{{ billData.nic }}</span>
                </div>
                <div class="info-item">
                    <span class="label">Bill Number:</span>
                    <span class="value">{{ billData.billNumber }}</span>
                </div>
            </div>
        </div>

        <!-- Billing Details Grid -->
        <div class="card details-card">
            <h4>Billing Details</h4>
            <div class="details-grid">
                <div class="detail-item">
                    <span class="label">Billing Date</span>
                    <span class="value">{{ billData.billingDate }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Invoice Period</span>
                    <span class="value">{{ billData.invoicePeriod }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Readings (Prev / Curr)</span>
                    <span class="value">{{ billData.prevReading }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Readings (Prev / Curr)</span>
                    <span class="value">{{ billData.currReading }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Units Consumed</span>
                    <span class="value">{{ billData.unitsConsumed }}</span>
                </div>
                
                <div class="detail-item">
                    <span class="label">Water Charges</span>
                    <span class="value">{{ Number(billData.waterCharges).toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Fixed Charges</span>
                    <span class="value">{{ Number(billData.fixedCharges).toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Monthly Charges</span>
                    <span class="value">{{ Number(billData.monthlyCharges).toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Previous Dues</span>
                    <span class="value">{{ Number(billData.previousDues).toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                    <span class="label">Other Charges</span>
                    <span class="value">{{ Number(billData.otherCharges).toFixed(2) }}</span>
                </div>
            </div>
        </div>

        <!-- Payment Section -->
        <div class="card payment-card">
            <div class="payment-summary">
                <div class="total-due">
                    <span class="label">Total Amount Due:</span>
                    <span class="amount">Rs. {{ Number(billData.totalAmount).toFixed(2) }}</span>
                </div>
                
                <div class="payment-input-group">
                    <label for="payAmount">Payment Amount (Rs.)</label>
                    <input 
                        id="payAmount" 
                        type="number" 
                        v-model="paymentAmount" 
                        class="payment-input"
                        step="0.01"
                    />
                </div>

                <button class="action-btn primary-btn" @click="confirmPayment">
                    Confirm Payment
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Inherited Styles from WaterBillList.vue */
.page-container {
  padding: 20px;
  max-width: 1200px;
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

.page-header h3 {
    margin: 0;
    color: #2c3e50;
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
  margin-bottom: 20px;
}

h4 {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #42b883;
    display: inline-block;
    padding-bottom: 5px;
    font-size: 16px;
}

/* Info Section Styles */
.info-row {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-item .label {
    font-size: 12px;
    color: #7f8c8d;
    margin-bottom: 4px;
}

.info-item .value {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
}

/* Details Grid Styles */
.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 20px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #eee;
}

.detail-item .label {
    font-size: 11px;
    color: #7f8c8d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
}

.detail-item .value {
    font-size: 14px;
    font-weight: bold;
    color: #2c3e50;
}

/* Payment Section Styles */
.payment-card {
    background-color: #eafaf1; /* Light green tint */
    border: 1px solid #42b883;
}

.payment-summary {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 20px;
}

.total-due {
    font-size: 18px;
    color: #2c3e50;
}

.total-due .amount {
    font-size: 24px;
    font-weight: bold;
    color: #c0392b;
    margin-left: 10px;
}

.payment-input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.payment-input-group label {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 5px;
    color: #2c3e50;
}

.payment-input {
    padding: 10px;
    font-size: 18px;
    border: 2px solid #42b883;
    border-radius: 6px;
    text-align: right;
    width: 200px;
    font-weight: bold;
    color: #2c3e50;
}

.payment-input:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.2);
}

.action-btn {
  background: transparent;
  border: 1px solid #42b883;
  color: #42b883;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.primary-btn {
    background-color: #42b883;
    color: white;
    padding: 12px 30px;
    font-size: 16px;
    font-weight: bold;
    border: none;
}

.primary-btn:hover {
    background-color: #3aa876;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
</style>
