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
        <router-link to="/bill-payment" class="back-link">Back to bill payment</router-link>
      </div>
      
      <div class="card mb-3 mt-3"> 
        <div class="card-header">Customer Account Details</div>
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

      <div class="card mb-3" v-if="accountDetails.pendingBills.length > 0"> 
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
            <tr v-for="bill in paginatedBills" :key="bill.bill_number">
              <td>{{ formatDate(bill.billing_date) }}</td>
              <td>{{ bill.bill_number }}</td>
              <td class="text-end">{{ formatCurrency(bill.monthly_charge) }}</td>
              <td class="text-end">{{ formatCurrency(bill.paid_amount) }}</td>
              <td class="text-end text-danger font-weight-bold">{{ formatCurrency(bill.due_amount) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="d-flex justify-content-center mt-2 pb-2 pt-2 border-top">
          <nav aria-label="Page navigation">
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click.prevent="currentPage--">Previous</button>
              </li>
              <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                <button class="page-link" @click.prevent="currentPage = page">{{ page }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click.prevent="currentPage++">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      </div>
      <div v-else class="alert alert-success">No pending bills! Account is clear.</div>

      <div class="card mb-3 config-card"> 
        <div class="card-body">
          
          <div class="row mb-3 config-row">
            <div class="col-md-6 form-group">
              <label>Applicable Discounts</label>
              <select class="form-control" v-model="selectedConfig.discount" @change="applyCalculations">
                <option :value="null">-- Select Discount --</option>
                <option v-for="(discount, index) in availableTariffConfigs.discounts" :key="'d-'+index" :value="discount">
                  {{ discount.name }} - ({{ discount.type === 'percentage' ? discount.amount + '%' : 'Rs.' + discount.amount }})
                </option>
              </select>
            </div>
            <div class="col-md-6 form-group">
              <label>Bill Amount for Discount</label>
              <div class="form-control read-only-box">
                LKR {{ formatCurrency(selectedBillAmounts.discount) }}
              </div>
            </div>
          </div>

          <div class="row mb-4 config-row">
            <div class="col-md-6 form-group">
              <label>Applicable Fines</label>
              <select class="form-control" v-model="selectedConfig.fine" @change="applyCalculations">
                <option :value="null">-- Select Fine --</option>
                <option v-for="(fine, index) in availableTariffConfigs.fines" :key="'f-'+index" :value="fine">
                  {{ fine.name }} - ({{ fine.type === 'percentage' ? fine.amount + '%' : 'Rs.' + fine.amount }})
                </option>
              </select>
            </div>
            <div class="col-md-6 form-group">
              <label>Select Bill Amount for Fine</label>
              <select class="form-control" v-model="selectedBillAmounts.fine" @change="applyCalculations">
                <option :value="0">-- Select Due Amount --</option>
                <option v-for="(bill, index) in accountDetails.pendingBills" :key="'bf-'+index" :value="parseFloat(bill.due_amount)">
                  {{ formatCurrency(bill.due_amount) }}
                </option>
              </select>
            </div>
          </div>

          <div class="payment-input-section mt-4 mb-4">
             <label for="totalPaymentInput" class="text-primary font-weight-bold">Enter Payment Amount (LKR)</label>
             <input 
                id="totalPaymentInput"
                type="number" 
                class="form-control form-control-lg payment-highlight" 
                v-model.number="enteredPaymentAmount" 
                @input="distributePayment"
                placeholder="Enter amount here..."
                min="0"
                step="0.01"
             >
          </div>

          <div class="breakdown-section p-3" v-if="enteredPaymentAmount > 0">
            <div class="d-flex justify-content-between align-items-center mb-3 pb-2" style="border-bottom: 2px solid #ddd;">
              <h5 style="margin: 0; color: #2c3e50;">Amount Breakdown & Account Allocation</h5>
              <h4 class="text-success m-0">Total Payment: LKR {{ formatCurrency(enteredPaymentAmount) }}</h4>
            </div>
            
            <div class="table-responsive">
              <table class="table table-sm table-bordered mb-0" style="background: white;">
                <thead style="background-color: #bcccdc;">
                  <tr>
                    <th style="text-align: left;">Category</th>
                    <th class="text-end">Required Amount</th>
                    <th class="text-end">Allocated (Paying)</th>
                    <th style="text-align: left;">Select Rate Head</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="requiredAmounts.fine > 0">
                    <td class="align-middle" style="text-align: left;"><strong>Fine / Penalty</strong></td>
                    <td class="text-end align-middle text-muted">{{ formatCurrency(requiredAmounts.fine) }}</td>
                    <td class="text-end align-middle">
                      <input type="number" v-model.number="breakdownInputs.fine" class="form-control text-end text-danger fw-bold readonly-input" readonly>
                    </td>
                    <td>
                      <select v-model="selectedRateHeads.fine" class="form-control small-select">
                        <option value="" disabled>Select Rate Head</option>
                        <option v-for="rate in empSbRates" :key="'r-fine-'+rate.sb_rate_head" :value="rate.sb_rate_head">
                          {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                        </option>
                      </select>
                    </td>
                  </tr>

                  <tr v-if="requiredAmounts.arrears > 0">
                    <td class="align-middle" style="text-align: left;"><strong>Arrears</strong></td>
                    <td class="text-end align-middle text-muted">{{ formatCurrency(requiredAmounts.arrears) }}</td>
                    <td class="text-end align-middle">
                      <input type="number" v-model.number="breakdownInputs.arrears" class="form-control text-end readonly-input" style="color: #d35400; font-weight: bold;" readonly>
                    </td>
                    <td>
                      <select v-model="selectedRateHeads.arrears" class="form-control small-select">
                        <option value="" disabled>Select Rate Head</option>
                        <option v-for="rate in empSbRates" :key="'r-arr-'+rate.sb_rate_head" :value="rate.sb_rate_head">
                          {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                        </option>
                      </select>
                    </td>
                  </tr>

                  <tr v-if="requiredAmounts.current > 0">
                    <td class="align-middle" style="text-align: left;"><strong>Current Bill</strong></td>
                    <td class="text-end align-middle text-muted">{{ formatCurrency(requiredAmounts.current) }}</td>
                    <td class="text-end align-middle">
                      <input type="number" v-model.number="breakdownInputs.current" class="form-control text-end readonly-input" style="color: #27ae60; font-weight: bold;" readonly>
                    </td>
                    <td>
                      <select v-model="selectedRateHeads.current" class="form-control small-select">
                        <option value="" disabled>Select Rate Head</option>
                        <option v-for="rate in empSbRates" :key="'r-cur-'+rate.sb_rate_head" :value="rate.sb_rate_head">
                          {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                        </option>
                      </select>
                    </td>
                  </tr>

                  <tr v-if="breakdownInputs.excess > 0">
                    <td class="align-middle" style="text-align: left;" colspan="2"><strong>Excess Payment</strong></td>
                    <td class="text-end align-middle">
                      <input type="number" v-model.number="breakdownInputs.excess" class="form-control text-end readonly-input" style="color: #2980b9; font-weight: bold;" readonly>
                    </td>
                    <td>
                      <select v-model="selectedRateHeads.excess" class="form-control small-select">
                        <option value="" disabled>Select Rate Head</option>
                        <option v-for="rate in empSbRates" :key="'r-exc-'+rate.sb_rate_head" :value="rate.sb_rate_head">
                          {{ rate.sb_rate_head }} - {{ rate.rate_head_name || 'Rate Head' }}
                        </option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-4" style="text-align: right;">
            <button 
              @click="proceedToPayment" 
              class="btn btn-success btn-lg" 
              style="margin-right: 0;"
              :disabled="enteredPaymentAmount <= 0 || isProcessing"
            >
              <span v-if="isProcessing">Processing...</span>
              <span v-else>Confirm Payment ({{ formatCurrency(enteredPaymentAmount) }})</span>
            </button>
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
      isProcessing: false,

      currentSabha: '',
      currentUserNIC: '',
      empSbRates: [],
      
      availableTariffConfigs: {
        discounts: [],
        fines: []
      },

      selectedConfig: {
        discount: null,
        fine: null
      },
      selectedBillAmounts: {
        discount: 0,
        fine: 0
      },

      enteredPaymentAmount: 0,

      requiredAmounts: {
        fine: 0,
        arrears: 0,
        current: 0
      },

      breakdownInputs: {
        fine: 0,
        arrears: 0,
        current: 0,
        excess: 0
      },
      
      originalCurrentAmount: 0,

      selectedRateHeads: {
        fine: '',
        arrears: '',
        current: '',
        excess: ''
      },
      currentPage: 1,
      itemsPerPage: 9
    };
  },
  async mounted() {
    const userDataString = sessionStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      this.currentSabha = userData.sabha || userData.sabha_code;
      this.currentUserNIC = userData.nic || userData.emp_nic;
    }

    const accountId = this.$route.params.accountId;
    if (accountId) {
      await this.fetchAccountDetails(accountId);
      
      if (this.currentSabha && this.currentUserNIC) {
        await this.fetchEmpRates();
        await this.fetchTariffConfigs(accountId); 
      }
    } else {
      this.error = "Invalid request: No Account ID provided.";
      this.loading = false;
    }
  },
  methods: {
    async fetchTariffConfigs(accountId) {
      try {
        const response = await axios.get(`/account-tariff-details/${accountId}`);
        if (response.data.status === 'success') {
          this.availableTariffConfigs.discounts = response.data.data.discounts;
          this.availableTariffConfigs.fines = response.data.data.fines;
        }
      } catch (err) {
        console.error("Error fetching tariff configs:", err);
      }
    },

    async fetchAccountDetails(accountId) {
      try {
        this.loading = true;
        this.error = null;
        const response = await axios.get(`/water-account-payment-details/${accountId}`);
        
        if (response.data.success) {
          this.accountDetails = response.data.data;
          let pending = this.accountDetails.pendingBills;
          
          if (pending.length > 0) {
            let lastBill = pending[pending.length - 1];
            let currMonthlyCharge = parseFloat(lastBill.monthly_charge || 0);
            
            this.selectedBillAmounts.discount = currMonthlyCharge;

            let totalOutstanding = parseFloat(this.accountDetails.totalOutstanding || 0);
            let totalArrears = totalOutstanding - currMonthlyCharge;

            this.originalCurrentAmount = currMonthlyCharge;
            
            this.requiredAmounts.current = currMonthlyCharge;
            this.requiredAmounts.arrears = totalArrears > 0 ? totalArrears : 0;
            this.requiredAmounts.fine = 0;
          }

          this.applyCalculations();

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

    applyCalculations() {
      if (this.selectedConfig.discount && this.selectedBillAmounts.discount > 0) {
        let discObj = this.selectedConfig.discount;
        let baseAmount = this.selectedBillAmounts.discount;
        let calculatedDiscount = 0;

        if (discObj.type === 'percentage') {
          calculatedDiscount = (baseAmount * parseFloat(discObj.amount)) / 100;
        } else {
          calculatedDiscount = parseFloat(discObj.amount);
        }

        let newCurrent = this.originalCurrentAmount - calculatedDiscount;
        this.requiredAmounts.current = newCurrent > 0 ? newCurrent : 0; 
      } else {
        this.requiredAmounts.current = this.originalCurrentAmount; 
      }

      if (this.selectedConfig.fine && this.selectedBillAmounts.fine > 0) {
        let fineObj = this.selectedConfig.fine;
        let baseAmount = this.selectedBillAmounts.fine;
        let calculatedFine = 0;

        if (fineObj.type === 'percentage') {
          calculatedFine = (baseAmount * parseFloat(fineObj.amount)) / 100;
        } else {
          calculatedFine = parseFloat(fineObj.amount);
        }

        this.requiredAmounts.fine = calculatedFine;
      } else {
        this.requiredAmounts.fine = 0; 
      }

      this.distributePayment();
    },

    distributePayment() {
      let remainingPayment = parseFloat(this.enteredPaymentAmount) || 0;

      this.breakdownInputs.fine = 0;
      this.breakdownInputs.arrears = 0;
      this.breakdownInputs.current = 0;
      this.breakdownInputs.excess = 0;

      if (remainingPayment > 0 && this.requiredAmounts.fine > 0) {
        let alloc = Math.min(remainingPayment, this.requiredAmounts.fine);
        this.breakdownInputs.fine = alloc;
        remainingPayment -= alloc;
      }

      if (remainingPayment > 0 && this.requiredAmounts.arrears > 0) {
        let alloc = Math.min(remainingPayment, this.requiredAmounts.arrears);
        this.breakdownInputs.arrears = alloc;
        remainingPayment -= alloc;
      }

      if (remainingPayment > 0 && this.requiredAmounts.current > 0) {
        let alloc = Math.min(remainingPayment, this.requiredAmounts.current);
        this.breakdownInputs.current = alloc;
        remainingPayment -= alloc;
      }

      if (remainingPayment > 0) {
        this.breakdownInputs.excess = remainingPayment;
      }
    },
    
    async fetchEmpRates() {
      try {
        const res = await axios.get(`/emp-rates/${this.currentSabha}/${this.currentUserNIC}`);
        if (res.data && res.data.data) {
          this.empSbRates = res.data.data;
        }
      } catch (error) {
        console.error("Error fetching emp rates:", error);
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
        if (this.enteredPaymentAmount <= 0) {
            Swal.fire('Invalid Amount', 'Please ensure payment amount is valid.', 'warning');
            return;
        }

        const breakdownsArray = [
            { category: 'Fine', amount: this.breakdownInputs.fine, sb_rate_head: this.selectedRateHeads.fine },
            { category: 'Arrears', amount: this.breakdownInputs.arrears, sb_rate_head: this.selectedRateHeads.arrears },
            { category: 'Current Bill', amount: this.breakdownInputs.current, sb_rate_head: this.selectedRateHeads.current },
            { category: 'Excess', amount: this.breakdownInputs.excess, sb_rate_head: this.selectedRateHeads.excess }
        ];

        const invalidSelection = breakdownsArray.find(b => parseFloat(b.amount) > 0 && !b.sb_rate_head);
        if (invalidSelection) {
            return Swal.fire("Required", `Please select a Rate Head for ${invalidSelection.category}`, "warning");
        }

        const result = await Swal.fire({
            title: 'Confirm Payment?',
            text: `Are you sure you want to process LKR ${this.formatCurrency(this.enteredPaymentAmount)}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#42b883',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Process it!'
        });

        if (!result.isConfirmed) return;

        this.isProcessing = true;

        try {
            let sub_nic = this.currentUserNIC || "UNKNOWN";
            const payload = {
                account_id: this.accountDetails.accountId,
                account_number: this.accountDetails.accountNumber,
                payment_amount: this.enteredPaymentAmount,
                sub_nic: sub_nic, 
                paymonth: new Date().toISOString().slice(0, 7),
                breakdowns: breakdownsArray 
            };

            const response = await axios.post('/payments/process', payload);

            if (response.data.success || response.data.status === 'success') {
                await Swal.fire({
                    icon: 'success',
                    title: 'Payment Recorded!',
                    timer: 2000,
                    showConfirmButton: false
                });
                this.$router.push('/officer-dashboard'); 
            } else {
                throw new Error(response.data.message || "Payment failed");
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Payment Failed',
                text: error.message
            });
        } finally {
            this.isProcessing = false;
        }
    }
  },computed: {
  paginatedBills() {
    if (!this.accountDetails || !this.accountDetails.pendingBills) return [];

    // සම්පූර්ණ බිල්පත් ලැයිස්තුව (Oldest to Newest)
    let bills = [...this.accountDetails.pendingBills];

    // අලුත්ම බිල්පත් 10 පමණක් තෝරා ගැනීම
    let latestTen = bills.slice(-10);

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    
    return latestTen.slice(start, end);
  },
  totalPages() {
    if (!this.accountDetails || !this.accountDetails.pendingBills) return 0;
    
    // බිල්පත් 10කට සීමා කර ඇත්නම්:
    const count = Math.min(this.accountDetails.pendingBills.length, 10);
    return Math.ceil(count / this.itemsPerPage);
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

/* --- Loading & Error States --- */
#water-payment-interface-container .loading-state, 
#water-payment-interface-container .error-state {
    text-align: center !important;
    padding: 30px !important; 
    font-size: 15px !important;
    font-weight: bold !important;
    color: #555 !important;
}

#water-payment-interface-container .card {
    box-shadow: 0 4px 8px rgba(0,0,0,0.05) !important;
    border: 1px solid #e1e8ed !important;
    border-radius: 10px !important;
    margin-bottom: 15px !important;
}

#water-payment-interface-container .card-header {
    font-size: 16px !important;
    font-weight: bold !important;
    padding: 12px 15px !important;
    background-color: #f8fafd !important;
    border-bottom: 1px solid #e1e8ed !important;
}

#water-payment-interface-container .card-body {
    padding: 20px !important;
}

/* FIXED: Spacing in form groups to prevent cluster */
#water-payment-interface-container .form-group {
    padding: 0 10px !important; 
    margin-bottom: 15px !important;
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
    margin: 0 !important;
}

#water-payment-interface-container .table th {
    font-size: 14px !important;
    padding: 10px !important;
    background-color: #bcccdc !important;
    text-align: center !important;
    border: 1px solid #99a3b0 !important;
}

#water-payment-interface-container .table td {
    font-size: 14px !important;
    padding: 10px !important;
    vertical-align: middle !important;
    text-align: center !important;
    border: 1px solid #99a3b0 !important;
}

#water-payment-interface-container .text-end {
    text-align: right !important;
}

/* --- Form Input Section --- */
#water-payment-interface-container label {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #2c3e50 !important;
    display: block !important;
    margin-bottom: 8px !important; /* FIXED: Added space below label */
}

#water-payment-interface-container select.form-control,
#water-payment-interface-container input.form-control {
    font-size: 15px !important;
    font-weight: 600 !important;
    height: 45px !important; 
    padding: 8px 15px !important;
    border: 1px solid #ced4da !important;
    border-radius: 6px !important;
    width: 100% !important;
    background-color: #fff !important;
    transition: border-color 0.2s ease-in-out !important;
}

#water-payment-interface-container select.form-control:focus,
#water-payment-interface-container input.form-control:focus {
    border-color: #80bdff !important;
    outline: none !important;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25) !important;
}

/* NEW STYLES: Configuration Rows & Payment Input */
#water-payment-interface-container .config-card {
    background-color: #ffffff !important;
}

#water-payment-interface-container .config-row {
    background-color: #f8fafd !important;
    padding: 20px 10px 5px 10px !important; /* FIXED: Proper inner padding */
    border-radius: 8px !important;
    border: 1px solid #e1e8ed !important;
    display: flex !important;
    flex-wrap: wrap !important;
}

#water-payment-interface-container .read-only-box {
    background-color: #e9ecef !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    color: #495057 !important;
    display: flex !important;
    align-items: center !important;
    cursor: not-allowed !important;
    height: 45px !important; /* FIXED: Matched select box height */
    padding: 8px 15px !important;
    border: 1px solid #ced4da !important;
    border-radius: 6px !important;
}

#water-payment-interface-container .payment-input-section {
    background-color: #e3f2fd !important;
    padding: 25px !important;
    border-radius: 10px !important;
    border: 2px dashed #90caf9 !important;
    text-align: center !important;
}

#water-payment-interface-container .payment-input-section label {
    font-size: 18px !important;
    margin-bottom: 15px !important;
    color: #0d47a1 !important;
}

#water-payment-interface-container .payment-highlight {
    font-size: 24px !important;
    font-weight: bold !important;
    height: 60px !important;
    text-align: center !important;
    color: #1565c0 !important;
    border: 2px solid #64b5f6 !important;
    border-radius: 10px !important;
    max-width: 400px !important;
    margin: 0 auto !important;
}

#water-payment-interface-container .breakdown-section {
    background: #f9f9f9 !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
}

#water-payment-interface-container .readonly-input {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    height: auto !important;
    text-align: right !important;
    cursor: default !important;
}
#water-payment-interface-container .readonly-input:focus {
    outline: none !important;
}

#water-payment-interface-container .small-select {
    height: 38px !important;
    padding: 5px 10px !important;
    font-size: 14px !important;
}

/* --- Buttons --- */
#water-payment-interface-container .btn {
    font-size: 15px !important;
    padding: 8px 25px !important;
    border-radius: 6px !important;
    font-weight: bold !important;
    cursor: pointer !important;
    height: 45px !important;
    margin: 0 !important;
}

#water-payment-interface-container .btn-success {
    background-color: #28a745 !important;
    border-color: #28a745 !important;
    color: white !important;
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
    font-size: 15px !important;
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
    margin-bottom: 20px !important;
    border-bottom: 2px solid #e0e0e0 !important;
    padding-bottom: 12px !important;
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
    font-weight: 600 !important;
    font-size: 14px !important; 
}
#water-payment-interface-container .back-link:hover {
    text-decoration: underline !important;
}
#water-payment-interface-container .pagination .page-link {
    color: #11211a !important;
    font-size: 15px !important;
    font-weight: 600 !important;
    padding: 5px 15px !important;
    cursor: pointer !important;
}
#water-payment-interface-container .pagination .page-item.active .page-link {
    background-color: #42b883 !important;
    border-color: #42b883 !important;
    color: white !important;
}
</style>