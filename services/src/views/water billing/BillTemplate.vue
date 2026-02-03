

<template>
  <div class="page-container">
    <div class="invoice-box" v-if="billDetails">
      
      <header class="header-section">
        <div class="logo-area">
          <img src="/gov-logo.png" alt="Gov Logo" class="gov-logo" />
        </div>
        <div class="authority-details">
          <h2>PRADESHIYA SABHA - [NAME]</h2>
          <h3>Water Supply Unit</h3>
          <p>Address: Main Street, City, Sri Lanka | Tel: 011-2345678</p>
        </div>
      </header>

      <hr class="divider">

      <section class="bill-meta">
        <div class="meta-row">
          <div><strong>Bill Number:</strong> {{ billDetails.billNumber }}</div>
          <div><strong>Billing Date:</strong> {{ formatDate(billDetails.billingDate) }}</div>
        </div>
        <div class="meta-row">
          <div><strong>Period:</strong> {{ formatDate(billDetails.periodFrom) }} to {{ formatDate(billDetails.periodTo) }}</div>
          <div><strong>Account No:</strong> {{ billDetails.accountNo }}</div>
        </div>
      </section>

      <section class="customer-box">
        <h4>CUSTOMER DETAILS</h4>
        <div class="customer-grid">
          <div class="label">Name:</div>
          <div class="value">{{ billDetails.fullName }}</div>
          
          <div class="label">NIC:</div>
          <div class="value">{{ billDetails.nic }}</div>
          
          <div class="label">Address:</div>
          <div class="value">{{ billDetails.address }}</div>
        </div>
      </section>

      <section class="readings-box">
        <table class="data-table">
          <thead>
            <tr>
              <th>Previous Reading</th>
              <th>Current Reading</th>
              <th>Units Consumed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ billDetails.previousReading }}</td>
              <td>{{ billDetails.currentReading }}</td>
              <td class="highlight-text">{{ billDetails.currentReading - billDetails.previousReading }} Units</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="charges-box">
        <table class="sums-table">
          <tr>
            <td>Water Consumption Charges</td>
            <td class="amount">LKR {{ formatCurrency(billDetails.waterConsumptionCharge) }}</td>
          </tr>
          <tr>
            <td>Fixed Charges</td>
            <td class="amount">LKR {{ formatCurrency(billDetails.fixedCharge) }}</td>
          </tr>
          <tr class="sub-total">
            <td><strong>Charges for this Month</strong></td>
            <td class="amount"><strong>LKR {{ formatCurrency(calculateMonthTotal) }}</strong></td>
          </tr>
          <tr>
            <td>(+) Dues / Arrears (Previous Bill)</td>
            <td class="amount">LKR {{ formatCurrency(billDetails.previousDues) }}</td>
          </tr>
          </table>
      </section>

      <section class="total-payable">
        <div class="total-label">TOTAL AMOUNT TO PAY</div>
        <div class="total-value">LKR {{ formatCurrency(calculateGrandTotal) }}</div>
      </section>

      <footer class="bill-footer">
        <p>Please make the payment within 14 days to avoid disconnection.</p>
        <p class="system-note">This is a system-generated bill. Signature not required.</p>
        <div class="officer-signature">
            <br><br>
            --------------------------<br>
            Revenue Officer
        </div>
      </footer>

    </div>

    <div v-else class="loading">
      <p>Generating Bill...</p>
    </div>

    <button @click="printBill" class="print-btn no-print">
      <span class="icon">🖨️</span> Print Official Bill
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const billDetails = ref(null);

// --- Computed Properties ---
const calculateMonthTotal = computed(() => {
  if (!billDetails.value) return 0;
  return (parseFloat(billDetails.value.waterConsumptionCharge) || 0) + 
         (parseFloat(billDetails.value.fixedCharge) || 0);
});

const calculateGrandTotal = computed(() => {
  if (!billDetails.value) return 0;
  return calculateMonthTotal.value + (parseFloat(billDetails.value.previousDues) || 0);
});

// --- Helper Functions ---
const formatCurrency = (value) => {
  if (value === undefined || value === null) return "0.00"; // Error handling
  return parseFloat(value).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (dateString) => {
    if(!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
}

const fetchBillDetails = async (id) => {
  try {
    // *** වෙනස්කම: සම්පූර්ණ URL එක භාවිතා කිරීම (BaseURL ප්‍රශ්න මග හැරීමට) ***
    // Backend එක දුවන්නේ Port 3000 න් නම් සහ Route prefix එක '/api' නම්:
    const response = await axios.get(`http://localhost:3000/api/water-bills/${id}`); 
    
    console.log("Bill Data Received:", response.data); // Debugging line
    billDetails.value = response.data;

  } catch (error) {
    console.error('Error fetching bill:', error);
    if (error.response) {
        // Server එකෙන් error එකක් ආවොත් (404, 500)
        console.error("Server Error:", error.response.data);
    } else if (error.request) {
        // Server එකට connect වෙන්න බැරි නම්
        console.error("Network Error: Is the backend server running?");
    }
  }
};

const printBill = () => {
  window.print();
};

onMounted(() => {
  const id = route.params.id;
  if(id) {
      fetchBillDetails(id);
  } else {
      console.error("No Bill ID found in route");
  }
});
</script>

<style scoped>
/* --- General Page Layout --- */
.page-container {
  background: #f4f4f4;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.invoice-box {
  background: #fff;
  width: 100%;
  max-width: 210mm; /* A4 Width */
  padding: 40px;
  border: 1px solid #ddd;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  font-family: 'Times New Roman', Times, serif; /* Official look */
  color: #333;
}

/* --- Header --- */
.header-section {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.logo-area {
  flex: 0 0 80px;
}
.gov-logo {
  width: 70px;
  height: auto;
}
.authority-details {
  flex: 1;
  text-align: center;
}
.authority-details h2 {
  margin: 0;
  font-size: 18px;
  text-transform: uppercase;
  font-weight: 700;
}
.authority-details h3 {
  margin: 2px 0;
  font-size: 14px;
  font-weight: 600;
}
.authority-details p {
  margin: 2px 0;
  font-size: 12px;
}
.divider {
  border: 0;
  border-top: 2px solid #333;
  margin-bottom: 15px;
}

/* --- Bill Meta Data --- */
.bill-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 10px;
}
.meta-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* --- Customer Box --- */
.customer-box {
  border: 1px solid #333;
  padding: 10px;
  margin-bottom: 20px;
}
.customer-box h4 {
  margin: 0 0 8px 0;
  font-size: 12px;
  text-transform: uppercase;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}
.customer-grid {
  display: grid;
  grid-template-columns: 80px 1fr;
  row-gap: 5px;
  font-size: 14px;
}
.label {
  font-weight: bold;
}

/* --- Tables --- */
table {
  width: 100%;
  border-collapse: collapse;
}

/* Readings Table */
.readings-box {
  margin-bottom: 20px;
}
.data-table th {
  background: #eee;
  border: 1px solid #333;
  padding: 8px;
  font-size: 13px;
  text-align: center;
}
.data-table td {
  border: 1px solid #333;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}
.highlight-text {
  font-weight: bold;
}

/* Charges Table */
.sums-table td {
  padding: 6px 0;
  font-size: 14px;
}
.sums-table td:first-child {
  text-align: left;
}
.sums-table td.amount {
  text-align: right;
  width: 150px;
}
.sub-total td {
  border-top: 1px solid #333;
  border-bottom: 1px solid #333;
  padding: 8px 0;
}

/* --- Total Payable --- */
.total-payable {
  margin-top: 20px;
  border: 2px solid #333;
  padding: 10px;
  text-align: center;
  background: #f9f9f9;
}
.total-label {
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
}
.total-value {
  font-size: 24px;
  font-weight: bold;
  margin-top: 5px;
}

/* --- Footer --- */
.bill-footer {
  margin-top: 40px;
  text-align: center;
  font-size: 12px;
}
.officer-signature {
  text-align: right;
  margin-top: 30px;
  margin-right: 20px;
  font-weight: bold;
}
.system-note {
  font-style: italic;
  font-size: 10px;
  color: #666;
}

/* --- Button --- */
.print-btn {
  margin-top: 20px;
  padding: 12px 24px;
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.print-btn:hover {
  background: #004494;
}

/* --- PRINT MEDIA QUERIES --- */
@media print {
  .no-print {
    display: none;
  }
  .page-container {
    background: white;
    padding: 0;
  }
  .invoice-box {
    box-shadow: none;
    border: none;
    max-width: 100%;
    padding: 10px;
  }
  .total-payable {
    background: none !important;
    border: 2px solid #000;
  }
  body {
    -webkit-print-color-adjust: exact;
  }
}
</style>