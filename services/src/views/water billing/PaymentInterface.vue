<template>
  <div class="payment-interface">
    <div v-if="loading" class="loading-state">
      <p>Loading Account details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="alert alert-danger">{{ error }}</div>
      <button @click="$router.go(-1)" class="btn btn-secondary mt-3">Go Back</button>
    </div>

    <div v-else-if="accountDetails" class="bill-content">
      <div class="page-header">
        <h2>Account Payment (FIFO)</h2>
        <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
      </div>
      
      <div class="card mb-4 mt-4">
        <div class="card-header bg-primary text-white">Customer Account Details</div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Name:</strong> {{ accountDetails.customerName }}</p>
              <p><strong>Account No:</strong> {{ accountDetails.accountNumber }}</p>
            </div>
            <div class="col-md-6 text-end">
              <p><strong>NIC:</strong> {{ accountDetails.nic }}</p>
              <h4 class="text-danger">Total Outstanding: {{ formatCurrency(accountDetails.totalOutstanding) }}</h4>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4" v-if="accountDetails.pendingBills.length > 0">
        <div class="card-header bg-light">Pending Bills Breakdown (Oldest First)</div>
        <div class="table-responsive">
          <table class="table table-sm table-striped mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill No</th>
                <th class="text-end">Bill Total</th>
                <th class="text-end">Paid</th>
                <th class="text-end">Due</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="bill in accountDetails.pendingBills" :key="bill.bill_number">
                <td>{{ formatDate(bill.billing_date) }}</td>
                <td>{{ bill.bill_number }}</td>
                <td class="text-end">{{ formatCurrency(bill.total_amount) }}</td>
                <td class="text-end">{{ formatCurrency(bill.paid_amount) }}</td>
                <td class="text-end text-danger font-weight-bold">{{ formatCurrency(bill.due_amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="alert alert-success">No pending bills! Account is clear.</div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="form-group">
            <label for="paymentAmount" class="font-weight-bold fs-5">Enter Payment Amount (LKR)</label>
            <input 
              type="number" 
              id="paymentAmount" 
              v-model.number="paymentAmount" 
              class="form-control form-control-lg mt-2" 
              min="1"
              step="0.01"
              placeholder="Ex: 5000.00"
            >
            <small class="text-muted">This amount will be used to clear bills starting from the oldest.</small>
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
          <span v-else>Confirm Payment ({{ formatCurrency(paymentAmount) }})</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2'; // ✅ SweetAlert2 Import කරන්න

export default {
  name: 'PaymentInterface',
  data() {
    return {
      accountDetails: null,
      loading: true,
      error: null,
      paymentAmount: 0,
      isProcessing: false
    };
  },
  async mounted() {
    // URL එකෙන් accountId එක ගන්නවා
    const accountId = this.$route.params.accountId;
    if (accountId) {
      await this.fetchAccountDetails(accountId);
    } else {
      this.error = "Invalid request: No Account ID provided.";
      this.loading = false;
    }
  },
  methods: {
    async fetchAccountDetails(accountId) {
      try {
        this.loading = true;
        this.error = null;
        
        // Backend URL එක ඔබේ Port එකට ගැලපෙන විදියට තියෙන්න ඕන
        const response = await axios.get(`http://localhost:3000/api/water-account-payment-details/${accountId}`);
        
        if (response.data.success) {
          this.accountDetails = response.data.data;
          // Default Payment එක විදියට Outstanding එක දානවා
          this.paymentAmount = this.accountDetails.totalOutstanding > 0 ? this.accountDetails.totalOutstanding : 0;
        } else {
          this.error = response.data.message;
        }
      } catch (err) {
        this.error = "Failed to load account details.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
        if(!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    },
    formatCurrency(value) {
        return parseFloat(value || 0).toFixed(2);
    },

    // ✅ යාවත්කාලීන කළ Payment Function එක
    async proceedToPayment() {
        // 1. Validation
        if (this.paymentAmount <= 0) {
            Swal.fire('Invalid Amount', 'Please enter a valid payment amount.', 'warning');
            return;
        }

        // 2. Confirmation (SweetAlert2)
        const result = await Swal.fire({
            title: 'Confirm Payment?',
            text: `Are you sure you want to process a payment of LKR ${this.formatCurrency(this.paymentAmount)}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#42b883',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Process it!'
        });

        if (!result.isConfirmed) return;

        this.isProcessing = true;

        try {
            // 3. Session එකෙන් Officer NIC එක ගැනීම (Frontend Logic)
            const userDataString = sessionStorage.getItem('userData');
            let sub_nic = "UNKNOWN";
            
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                // Session එකේ NIC එක තියෙන නම අනුව මෙය වෙනස් වෙන්න පුළුවන් (nic, emp_nic, id)
                sub_nic = userData.nic || userData.emp_nic || userData.id || "UNKNOWN";
            }

            // 4. Payload එක සකස් කිරීම
            const payload = {
                account_id: this.accountDetails.accountId,
                payment_amount: this.paymentAmount,
                sub_nic: sub_nic, // Officer NIC
                paymonth: new Date().toISOString().slice(0, 7) // (Optional) Current Month
            };

            // 5. Backend Call
            const response = await axios.post('http://localhost:3000/api/payments/process', payload);

            if (response.data.success) {
                // Success Alert
                await Swal.fire({
                    icon: 'success',
                    title: 'Payment Recorded!',
                    text: 'Payment details have been saved to the temporary invoice.',
                    timer: 2000,
                    showConfirmButton: false
                });
                this.$router.push('/officer-dashboard'); 
            } else {
                throw new Error(response.data.message || "Payment failed");
            }

        } catch (error) {
            console.error("Payment Error:", error);
            let errorMessage = "An error occurred while processing the payment.";
            
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            // Error Alert
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: errorMessage
            });
        } finally {
            this.isProcessing = false;
        }
    }
  }
};
</script>

<style scoped>
.payment-interface { max-width: 900px; margin: 20px auto; padding: 20px; }
.loading-state, .error-state { text-align: center; padding: 50px; }
.card { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* ✅ NEW STYLES FROM REFERENCE */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
}

.page-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 24px;
}

.back-link {
    color: #42b883;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px; 
}

.back-link:hover {
    text-decoration: underline;
}
</style>