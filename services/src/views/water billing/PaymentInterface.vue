<template>
  <div id="water-payment-interface-container" class="payment-interface">
    
    <div v-if="loading" class="loading-state">
      <p>Loading Account details...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="alert alert-danger">{{ error }}</div>
      <button @click="$router.go(-1)" class="btn btn-secondary mt-3">Go Back</button>
    </div>

    <div v-else-if="accountDetails" class="bill-content">
      <div class="page-header">
        <h2>Account Payment (Add PIV)</h2>
        <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
      </div>
      
      <div class="card mb-3 mt-3"> <div class="card-header">Customer Account Details</div>
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

      <div class="card mb-3" v-if="accountDetails.pendingBills.length > 0"> <div class="card-header bg-light">Pending Bills Breakdown (Oldest First)</div>
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

      <div class="card mb-3"> 
        <div class="card-body">
          <div class="form-group">
            <label for="paymentAmount" class="font-weight-bold">Enter Payment Amount (LKR)</label>
            
            <div class="payment-row-flex">
              <div class="input-wrapper">
                <input 
                  type="number" 
                  id="paymentAmount" 
                  v-model.number="paymentAmount" 
                  class="form-control form-control-lg" 
                  min="1"
                  step="0.01"
                  placeholder="Ex: 5000.00"
                >
              </div>
              
              <div class="payment-actions">
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

            <small class="text-muted">This amount will be used to clear bills starting from the oldest.</small>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';

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
        
        const response = await axios.get(`/water-account-payment-details/${accountId}`);
        
        if (response.data.success) {
          this.accountDetails = response.data.data;
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

    async proceedToPayment() {
        if (this.paymentAmount <= 0) {
            Swal.fire('Invalid Amount', 'Please enter a valid payment amount.', 'warning');
            return;
        }

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
            const userDataString = sessionStorage.getItem('userData');
            let sub_nic = "UNKNOWN";
            
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                sub_nic = userData.nic || userData.emp_nic || userData.id || "UNKNOWN";
            }

            const payload = {
                account_id: this.accountDetails.accountId,
                payment_amount: this.paymentAmount,
                sub_nic: sub_nic, 
                paymonth: new Date().toISOString().slice(0, 7)
            };

            const response = await axios.post('/payments/process', payload);

            if (response.data.success) {
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
/* --- Main Container --- */
#water-payment-interface-container.payment-interface {
    max-width: 950px !important;
    margin: 15px auto !important;
    padding: 15px !important; 
    font-family: sans-serif !important;
}

/* Flexbox Row for Input and Button */
#water-payment-interface-container .payment-row-flex {
    display: flex !important;
    gap: 200px !important;
    align-items: flex-start !important;
    width: 100% !important; 
    margin-top: 5px !important;
}

#water-payment-interface-container .input-wrapper {
    flex: 1 1 auto !important; 
    min-width: 0 !important;
}

/* --- Loading & Error States --- */
#water-payment-interface-container .loading-state, 
#water-payment-interface-container .error-state {
    text-align: center !important;
    padding: 30px !important; 
    font-size: 15px !important;
    font-weight: bold !important;
    color: #555 !important;
}
#water-payment-interface-container .payment-actions {
    flex: 0 0 auto !important;
}

#water-payment-interface-container .card {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
    border: 1px solid #ddd !important;
    border-radius: 10px !important;
    margin-bottom: 15px !important;
}

#water-payment-interface-container .card-header {
    font-size: 16px !important;
    font-weight: bold !important;
    padding: 10px 15px !important;
}

#water-payment-interface-container .card-body {
    padding: 15px !important;
}

#water-payment-interface-container .form-group{
  padding:0 !important;
  margin: 0 !important;
}

/* --- Customer Details Section --- */
#water-payment-interface-container .card-body p {
    font-size: 14px !important; 
    margin-bottom: 5px !important; 
    color: #333 !important;
}

#water-payment-interface-container .text-danger {
    color: #dc3545 !important;
    font-size: 17px !important; 
    font-weight: bold !important;
    margin-bottom: 0 !important;
}

/* --- Table Styles --- */
#water-payment-interface-container .table-responsive {
    overflow-x: auto !important;
}

#water-payment-interface-container .table {
    width: 100% !important;
    margin: 3px !important;
    max-width: 99% !important;
}

#water-payment-interface-container .table th {
    font-size: 15px !important;
    padding: 8px 10px !important;
    background-color: #bcccdc !important;
    text-align: center !important;
    border: 2px solid #99a3b0 !important;
}

#water-payment-interface-container .table td {
    font-size: 15px !important;
    padding: 8px 10px !important;
    vertical-align: middle !important;
    text-align: center !important;
    border: 2px solid #99a3b0 !important;
}

#water-payment-interface-container .text-end {
    text-align: right !important;
}

/* --- Form Input Section --- */
#water-payment-interface-container label {
    font-size: 16px !important;
    font-weight: bold !important;
    color: #1b2630 !important;
    margin-bottom: 5px !important;
    display: block !important;
}

#water-payment-interface-container input.form-control {
    font-size: 16px !important;
    height: 45px !important; 
    padding: 5px 15px !important;
    border: 2px solid #ccc !important;
    border-radius: 8px !important;
    width: 100% !important; 
    max-width: 100% !important;
}

#water-payment-interface-container .text-muted {
    font-size: 13px !important;
    color: #6c757d !important;
    margin-top: 3px !important;
    display: block !important;
}

/* --- Buttons --- */
#water-payment-interface-container .btn {
    font-size: 15px !important;
    padding: 8px 20px !important;
    border-radius: 8px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    white-space: nowrap !important;
    height: 45px !important;
    min-width: 250px !important;
    flex-shrink: 0 !important;
    margin: 0 !important;
}

#water-payment-interface-container .btn-success {
    background-color: #28a745 !important;
    border-color: #28a745 !important;
    color: white !important;
    margin-right: 25px !important;
}

#water-payment-interface-container .btn-secondary {
    background-color: #6c757d !important;
    color: white !important;
}

#water-payment-interface-container .btn:disabled {
    opacity: 0.6 !important;
    cursor: not-allowed !important;
}

/* --- Alerts --- */
#water-payment-interface-container .alert {
    padding: 15px !important;
    font-size: 16px !important;
    border-radius: 8px !important;
    margin-bottom: 15px !important;
}

#water-payment-interface-container .alert-success {
    background-color: #d4edda !important;
    color: #155724 !important;
    border-color: #c3e6cb !important;
}

#water-payment-interface-container .alert-danger {
    background-color: #f8d7da !important;
    color: #721c24 !important;
    border-color: #f5c6cb !important;
}

/* --- Page Header & Back Link --- */
#water-payment-interface-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 15px !important;
    border-bottom: 2px solid #e0e0e0 !important;
    padding-bottom: 10px !important;
}

#water-payment-interface-container .page-header h2 {
    margin: 0 !important;
    color: #2c3e50 !important;
    font-size: 24px !important;
    font-weight: 700 !important;
}

#water-payment-interface-container .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 13px !important; 
    border: none !important; 
    padding: 0 !important;   
    cursor: pointer !important;
}

#water-payment-interface-container .back-link:hover {
    text-decoration: underline !important;
    background-color: transparent !important;
    color: #3aa876 !important;
}
</style>
