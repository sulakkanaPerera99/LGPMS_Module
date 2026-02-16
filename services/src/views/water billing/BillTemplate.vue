<template>
  <div id="bill-template-container" class="page-container">
    <div class="invoice-box" v-if="billDetails">
      
      <header class="header-section relative-content">
        <div class="authority-details">
          <h2>PRADESHIYA SABHA - {{ billDetails.sb_name_en }}</h2>
          <h3>Water Supply Unit</h3>
          <p>
            Address: {{ billDetails.sb_address }} 
            <span class="separator">|</span> 
            Tel: {{ billDetails.sb_contact }}
          </p>
          <p>
            Email: {{ billDetails.sb_email }} 
            <span class="separator">|</span> 
            Fax: {{ billDetails.fax }}
          </p>
        </div>
      </header>

      <hr class="divider relative-content">

      <section class="bill-meta relative-content">
        <div class="meta-row">
          <div><strong>Bill Number:</strong> {{ billDetails.billNumber }}</div>
          <div><strong>Billing Date:</strong> {{ formatDate(billDetails.billingDate) }}</div>
        </div>
        <div class="meta-row">
          <div><strong>Period:</strong> {{ formatDate(billDetails.periodFrom) }} to {{ formatDate(billDetails.periodTo) }}</div>
          <div><strong>Account No:</strong> {{ billDetails.accountNo }}</div>
        </div>
      </section>

      <section class="customer-box relative-content">
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

      <section class="readings-box relative-content">
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

      <section class="charges-box relative-content">
        <table class="sums-table">
          <tbody>
            <tr>
              <td>Water Consumption Charges</td>
              <td class="amount">LKR {{ formatCurrency(billDetails.waterConsumptionCharge) }}</td>
            </tr>
            <tr>
              <td>Fixed Charges</td>
              <td class="amount">LKR {{ formatCurrency(billDetails.fixedCharge) }}</td>
            </tr>
            <tr>
              <td>Other Charges</td>
              <td class="amount">LKR {{ formatCurrency(billDetails.otherCharges) }}</td>
            </tr>
            <tr>
              <td>Discounts</td>
              <td class="amount">LKR {{ formatCurrency(billDetails.discounts) }}</td>
            </tr>
            <tr class="sub-total">
              <td><strong>Charges for this Month</strong></td>
              <td class="amount"><strong>LKR {{ formatCurrency(calculateMonthTotal) }}</strong></td>
            </tr>
            <tr>
              <td>(+) Dues / Arrears (Previous Bill)</td>
              <td class="amount">LKR {{ formatCurrency(billDetails.previousDues) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="total-payable relative-content">
        <div class="total-label">TOTAL AMOUNT TO PAY</div>
        <div class="total-value">LKR {{ formatCurrency(calculateGrandTotal) }}</div>
      </section>

      <footer class="bill-footer relative-content">
        <p class="system-note">This is a system-generated bill. Signature not required.</p>
        
        <div class="footer-row">
            
            <div class="valid-till-box">
                <strong>Valid Till:</strong> {{ validTillDate }}
            </div>

            <div class="officer-signature">
                <br><br>
                --------------------------<br>
                <p>Revenue Officer</p>
            </div>
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
          (parseFloat(billDetails.value.fixedCharge) || 0)+
          (parseFloat(billDetails.value.otherCharges) || 0) -
          (parseFloat(billDetails.value.discounts) || 0);
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
    const response = await axios.get(`/water-bills/${id}`); 
    console.log("Bill Data Received:", response.data); 
    billDetails.value = response.data;

  } catch (error) {
    console.error('Error fetching bill:', error);
    if (error.response) {
        console.error("Server Error:", error.response.data);
    } else if (error.request) {
        console.error("Network Error: Is the backend server running?");
    }
  }
};

const validTillDate = computed(() => {
  const date = new Date(); // අද දිනය
  date.setMonth(date.getMonth() + 6); 
  return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
});

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
#bill-template-container.page-container {
    background: #f4f4f4 !important;
    padding: 20px !important;
    min-height: 100vh !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
}

#bill-template-container .invoice-box {
    background: #fff !important;
    width: 100% !important;
    max-width: 210mm !important; /* A4 Width */
    padding: 40px !important;
    border: 1px solid #ddd !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
    font-family: 'Times New Roman', Times, serif !important;
    color: #333 !important;
    
    /* ✅ Watermark Positioning Context */
    position: relative !important; 
    overflow: hidden !important; 
}

/* ✅ WATERMARK STYLES */
#bill-template-container .invoice-box::before {
    content: "" !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 100% !important;
    height: 100% !important;
    
    /* Log eka methanata link karanna */
    background-image: url('../../assets/images/Sri-Lanka-Government.png') !important; 
    
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: 100% !important;
    opacity: 0.08 !important;
    z-index: 0 !important;
    pointer-events: none !important;
}

/* Ensure Text is ABOVE the watermark */
#bill-template-container .relative-content, 
#bill-template-container .header-section, 
#bill-template-container .bill-meta, 
#bill-template-container .customer-box, 
#bill-template-container .readings-box, 
#bill-template-container .charges-box, 
#bill-template-container .total-payable, 
#bill-template-container .bill-footer {
    position: relative !important;
    z-index: 1 !important; 
}

/* --- Header --- */
#bill-template-container .header-section {
    display: flex !important;
    align-items: center !important;
    margin-bottom: 10px !important;
}
#bill-template-container .logo-area {
    flex: 0 0 80px !important;
}
#bill-template-container .authority-details {
    flex: 1 !important;
    text-align: center !important;
}
#bill-template-container .authority-details h2 {
    margin: 0 !important;
    font-size: 18px !important;
    text-transform: uppercase !important;
    font-weight: 700 !important;
}
#bill-template-container .authority-details h3 {
    margin: 2px 0 !important;
    font-size: 14px !important;
    font-weight: 600 !important;
}
#bill-template-container .authority-details p {
    margin: 2px 0 !important;
    font-size: 12px !important;
}
#bill-template-container .divider {
    border: 0 !important;
    border-top: 2px solid #333 !important;
    margin-bottom: 15px !important;
}

/* --- Bill Meta Data --- */
#bill-template-container .bill-meta {
    display: flex !important;
    justify-content: space-between !important;
    margin-bottom: 20px !important;
    font-size: 14px !important;
    border-bottom: 1px dashed #ccc !important;
    padding-bottom: 10px !important;
}
#bill-template-container .meta-row {
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
}

/* --- Customer Box --- */
#bill-template-container .customer-box {
    border: 1px solid #333 !important;
    padding: 10px !important;
    margin-bottom: 20px !important;
}
#bill-template-container .customer-box h4 {
    margin: 0 0 8px 0 !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    border-bottom: 1px solid #eee !important;
    padding-bottom: 4px !important;
}
#bill-template-container .customer-grid {
    display: grid !important;
    grid-template-columns: 80px 1fr !important;
    row-gap: 5px !important;
    font-size: 14px !important;
}
#bill-template-container .label {
    font-weight: bold !important;
}

/* --- Tables --- */
#bill-template-container table {
    width: 100% !important;
    border-collapse: collapse !important;
}

/* Readings Table */
#bill-template-container .readings-box {
    margin-bottom: 20px !important;
}
#bill-template-container .data-table th {
    background: #eee !important;
    border: 1px solid #333 !important;
    padding: 8px !important;
    font-size: 13px !important;
    text-align: center !important;
}
#bill-template-container .data-table td {
    border: 1px solid #333 !important;
    padding: 8px !important;
    text-align: center !important;
    font-size: 14px !important;
}
#bill-template-container .highlight-text {
    font-weight: bold !important;
}

/* Charges Table */
#bill-template-container .sums-table {
    margin-bottom: 40px !important;
}
#bill-template-container .sums-table td {
    padding: 6.5px 0 !important;
    font-size: 14px !important;
    border: none !important;
}

#bill-template-container .sums-table td:first-child {
    text-align: left !important;
}
#bill-template-container .sums-table td.amount {
    text-align: right !important;
    width: 150px !important;
}
#bill-template-container .sub-total td {
    border-top: 1px solid #333 !important;
    border-bottom: 1px solid #333 !important;
    padding: 8px 0 !important;
}

/* --- Total Payable --- */
#bill-template-container .total-payable {
    margin-top: 20px !important;
    border: 2px solid #333 !important;
    padding: 10px !important;
    text-align: center !important;
    background: #f9f9f9 !important;
}
#bill-template-container .total-label {
    font-size: 20px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
}
#bill-template-container .total-value {
    font-size: 22px !important;
    font-weight: bold !important;
    margin-top: 5px !important;
}

/* --- Footer --- */
#bill-template-container .bill-footer {
    margin-top: 40px !important;
    text-align: center !important;
    font-size: 12px !important;
}
#bill-template-container .officer-signature {
    text-align: right !important;
    margin-top: 30px !important;
    margin-right: 20px !important;
    margin-bottom: 10px !important;
    font-weight: bold !important;
}

#bill-template-container .officer-signature p {
    margin-right: 40px !important;
}
#bill-template-container .system-note {
    font-style: italic !important;
    font-size: 10px !important;
    color: #666 !important;
}

/* --- Button --- */
#bill-template-container .print-btn {
    margin-top: 20px !important;
    padding: 12px 24px !important;
    background: #0056b3 !important;
    color: white !important;
    border: none !important;
    border-radius: 5px !important;
    cursor: pointer !important;
    font-size: 16px !important;
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
}
#bill-template-container .print-btn:hover {
    background: #004494 !important;
}

#bill-template-container .separator {
    margin: 0 7px !important; 
    font-weight: bold !important;
    color: #555 !important; 
}

/* --- PRINT MEDIA QUERIES --- */
@media print {
  /* 1. මුළු පිටුවේම තියෙන හැමදේම හංගන්න */
  body * {
    visibility: hidden !important;
  }

  /* 2. Invoice Box එක සහ ඒක ඇතුලේ තියෙන දේවල් විතරක් පෙන්නන්න */
  #bill-template-container .invoice-box, 
  #bill-template-container .invoice-box * {
    visibility: visible !important;
  }

  /* 3. Invoice Box එක පිටුවේ උඩටම ගන්න (absolute positioning) */
  #bill-template-container .invoice-box {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 10px !important;
    box-shadow: none !important;
    border: 2px solid #000 !important; /* බෝඩර් එක තදින් පෙනෙන්න */
  }

  /* 4. Page Settings */
  @page {
    size: auto !important;   /* Auto size දාන්න, එතකොට content එක විතරක් ගනියි */
    margin: 5mm !important;  
  }

  /* 5. අනවශ්‍ය බොත්තම් සම්පූර්ණයෙන්ම අයින් කරන්න */
  #bill-template-container .no-print {
    display: none !important;
  }

  /* 6. Watermark සහ අනෙකුත් සැකසුම් */
  #bill-template-container .invoice-box::before {
    opacity: 0.08 !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    background-size: 80% !important;
  }

  #bill-template-container .total-payable {
    background: transparent !important; /* Watermark පෙනෙන්න */
    border: 2px solid #000 !important;
  }
}
</style>