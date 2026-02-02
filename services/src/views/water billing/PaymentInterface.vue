<template>
  <div class="payment-interface">
    <div v-if="loading" class="loading-state">
      <p>Loading bill details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="alert alert-danger">
        {{ error }}
      </div>
      <button @click="$router.go(-1)" class="btn btn-secondary mt-3">Go Back</button>
    </div>

    <div v-else-if="billDetails" class="bill-content">
      <h2 class="mb-4">Water Bill Payment</h2>
      
      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-header bg-primary text-white">
              Customer Details
            </div>
            <div class="card-body">
              <p><strong>Name:</strong> {{ billDetails.customerName }}</p>
              <p><strong>Account No:</strong> {{ billDetails.accountNumber }}</p>
              <p><strong>NIC:</strong> {{ billDetails.nic }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="card h-100">
            <div class="card-header bg-info text-white">
              Bill Summary
            </div>
            <div class="card-body">
              <p><strong>Bill Number:</strong> {{ billDetails.billNumber }}</p>
              <p><strong>Period:</strong> {{ billDetails.invoicePeriod }}</p>
              <p><strong>Billing Date:</strong> {{ formatDate(billDetails.billingDate) }}</p>
              <hr>
              <div class="readings">
                <small class="text-muted">Readings:</small>
                <div class="d-flex justify-content-between">
                  <span>Prev: {{ billDetails.readings.previous }}</span>
                  <span>Curr: {{ billDetails.readings.current }}</span>
                  <span>Units: {{ billDetails.readings.units }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          Charges Breakdown
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <span>Water Consumption Charge</span>
            <span>{{ formatCurrency(billDetails.charges.waterCharge) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Fixed Charge</span>
            <span>{{ formatCurrency(billDetails.charges.fixedCharge) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Monthly Charge</span>
            <span>{{ formatCurrency(billDetails.charges.monthlyCharge) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2">
            <span>Other Charges</span>
            <span>{{ formatCurrency(billDetails.charges.otherCharges) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2 text-danger">
            <span>Previous Dues</span>
            <span>{{ formatCurrency(billDetails.charges.previousDues) }}</span>
          </div>
          <hr>
          <div class="d-flex justify-content-between font-weight-bold fs-5">
            <span>Total Amount Payable</span>
            <span class="text-success">{{ formatCurrency(billDetails.totalAmount) }}</span>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="form-check mb-3">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="applyDiscount" 
              v-model="applyDiscount"
            >
            <label class="form-check-label" for="applyDiscount">
              Apply Discount (if available in configuration)
            </label>
          </div>

          <div class="form-group">
            <label for="paymentAmount" class="font-weight-bold">Enter Payment Amount (LKR)</label>
            <input 
              type="number" 
              id="paymentAmount" 
              v-model.number="paymentAmount" 
              class="form-control form-control-lg mt-2" 
              min="1"
              step="0.01"
            >
          </div>
        </div>
      </div>

      <div class="payment-actions text-end">
        <button 
          @click="proceedToPayment" 
          class="btn btn-success btn-lg" 
          :disabled="paymentAmount <= 0 || isProcessing"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Pay Now ({{ formatCurrency(paymentAmount) }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'PaymentInterface',
  props: ['billNumber'],
  data() {
    return {
      billDetails: null,
      loading: true,
      error: null,
      paymentAmount: 0,
      applyDiscount: false, // Checkbox state
      isProcessing: false // To prevent double clicks
    };
  },
  async mounted() {
    const billNumber = this.billNumber || this.$route.params.billNumber;
    if (billNumber) {
      await this.fetchBillDetails(billNumber);
    } else {
      this.error = "Invalid request: No Bill Number provided.";
      this.loading = false;
    }
  },
  methods: {
    async fetchBillDetails(billNumber) {
      try {
        this.loading = true;
        this.error = null;
        // Make sure this URL matches your backend route for fetching details
        const response = await axios.get(`http://localhost:3000/api/water-bill-details/${billNumber}`);
        
        if (response.data.success) {
          this.billDetails = response.data.data;
          this.paymentAmount = this.billDetails.totalAmount;
        } else {
          this.error = response.data.message || "Failed to load bill details.";
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
            this.error = "No active pending bills found for this account.";
        } else {
            this.error = "An error occurred while connecting to the server.";
            console.error(err);
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
        if(!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    },
    formatCurrency(value) {
        if (value === undefined || value === null) return '0.00';
        return parseFloat(value).toFixed(2);
    },
    
    // ✅ NEW: Updated Logic to Call Backend
    async proceedToPayment() {
        if (this.paymentAmount <= 0) {
          alert("Please enter a valid amount greater than 0.");
          return;
        }

        // Confirmation
        if(!confirm(`Are you sure you want to pay LKR ${this.formatCurrency(this.paymentAmount)}?`)) {
            return;
        }

        this.isProcessing = true;

        try {
            // Prepare Payload for Controller
            // NOTE: Ensure your billDetails object has 'id' (bill_id) and 'accountId'
            const payload = {
                bill_id: this.billDetails.id, 
                account_id: this.billDetails.accountId,
                payment_amount: this.paymentAmount,
                apply_discount: this.applyDiscount
            };

            // Call the Backend Route
            const response = await axios.post('http://localhost:3000/api/payments/process', payload);

            if (response.data.success) {
                alert("Payment Successful!");
                // Redirect back to list or dashboard
                this.$router.push('/officer-dashboard'); // Or wherever you want to go
            } else {
                alert("Payment Failed: " + response.data.message);
            }

        } catch (error) {
            console.error("Payment Error:", error);
            const errMsg = error.response?.data?.message || "An error occurred during payment processing.";
            alert("Error: " + errMsg);
        } finally {
            this.isProcessing = false;
        }
    }
  }
};
</script>

<style scoped>
.payment-interface {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}
.loading-state, .error-state {
  text-align: center;
  padding: 50px;
}
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>