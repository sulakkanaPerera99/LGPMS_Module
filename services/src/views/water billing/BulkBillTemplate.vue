<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const bills = ref([]);
const isLoading = ref(true);

// --- Helper Functions ---
const formatCurrency = (value) => {
    if (value === undefined || value === null) return "0.00";
    return parseFloat(value).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
}

// අද දින සිට මාස 6ක් ඉදිරියට
const validTillDate = computed(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date.toLocaleDateString('en-GB');
});

onMounted(async () => {
    const { sabhaCode, projectCode, year, month } = route.query;

    if (!sabhaCode || !projectCode || !year) {
        alert("Missing parameters for bulk printing.");
        router.push({ name: 'PrintBill' });
        return;
    }

    try {
        const response = await axios.get('/bulk-water-bills', {
            params: { sabhaCode, projectCode, year, month }
        });

        if (response.data.success) {
            bills.value = response.data.data;
            // දත්ත load වූ පසු ස්වයංක්‍රීයව print dialog එක පෙන්වීමට
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    } catch (error) {
        console.error("Error loading bulk bills:", error);
    } finally {
        isLoading.value = false;
    }
});

const goBack = () => router.back();
</script>

<template>
    <div id="bulk-template-container" class="page-container">
        <div class="no-print actions-bar">
            <button @click="goBack" class="back-btn">Go Back</button>
            <p v-if="isLoading">Generating Bills, please wait...</p>
        </div>

        <div v-if="!isLoading && bills.length > 0">
            <div v-for="(bill, index) in bills" :key="bill.bill_id" class="bill-page invoice-box">
                
                <header class="header-section relative-content">
                    <div class="authority-details">
                        <span class="no-print bill-counter">Bill No: {{ index + 1 }}</span>
                        <h2>PRADESHIYA SABHA - {{ bill.sb_name_en || 'SABHA NAME' }}</h2>
                        <h3>Water Supply Unit</h3>
                        <p>
                            Address: {{ bill.sb_address }} 
                            <span class="separator">|</span> 
                            Tel: {{ bill.sb_contact }}
                        </p>
                    </div>
                </header>

                <hr class="divider relative-content">

                <section class="bill-meta relative-content">
                    <div class="meta-row">
                        <div><strong>Bill Number:</strong> {{ bill.bill_number }}</div>
                        <div><strong>Billing Date:</strong> {{ formatDate(bill.billing_date) }}</div>
                    </div>
                    <div class="meta-row">
                        <div><strong>Project:</strong> {{ route.query.projectCode }}</div>
                        <div><strong>Account No:</strong> {{ bill.account_no }}</div>
                    </div>
                </section>

                <section class="customer-box relative-content">
                    <h4>CUSTOMER DETAILS</h4>
                    <div class="customer-grid">
                        <div class="label">Name:</div>
                        <div class="value">{{ bill.full_name }}</div>
                        <div class="label">Address:</div>
                        <div class="value">{{ bill.address || 'N/A' }}</div>
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
                                <td>{{ bill.previous_reading || 0 }}</td>
                                <td>{{ bill.current_reading || 0 }}</td>
                                <td class="highlight-text">{{ (bill.current_reading || 0) - (bill.previous_reading || 0) }} Units</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section class="charges-box relative-content">
                    <table class="sums-table">
                        <tbody>
                            <tr>
                                <td>Current Monthly Charge</td>
                                <td class="amount">LKR {{ formatCurrency(bill.account_balance) }}</td>
                            </tr>
                            <tr>
                                <td>(+) Arrears / Previous Dues</td>
                                <td class="amount">LKR {{ formatCurrency(bill.previous_dues || 0) }}</td>
                            </tr>
                            <tr class="sub-total">
                                <td><strong>TOTAL AMOUNT TO PAY</strong></td>
                                <td class="amount"><strong>LKR {{ formatCurrency(bill.account_balance) }}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <footer class="bill-footer relative-content">
                    <p class="system-note">This is a system-generated bulk bill. Signature not required.</p>
                    <div class="footer-row">
                        <div class="valid-till-box">
                            <strong>Valid Till:</strong> {{ validTillDate }}
                        </div>
                        <div class="officer-signature">
                            <br>
                            --------------------------<br>
                            <p>Revenue Officer</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>

        <div v-else-if="!isLoading" class="no-data">
            <p>No bills found for the selected criteria.</p>
        </div>
    </div>
</template>

<style scoped>
/* --- Layout Styles (Single Bill එකේ ඒවාමයි) --- */
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
    width: 210mm; 
    padding: 30px 40px;
    border: 1px solid #ddd;
    margin-bottom: 30px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    font-family: 'Times New Roman', Times, serif;
    color: #333;
    position: relative;
    overflow: hidden;
    min-height: 140mm; /* බිල්පතක අවම උස */
}

/* Watermark */
.invoice-box::before {
    content: "";
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 80%; height: 80%;
    background-image: url('../../assets/images/Sri-Lanka-Government.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    opacity: 0.06;
    z-index: 0;
}

.relative-content { position: relative; z-index: 1; }

.header-section { text-align: center; margin-bottom: 10px; }
.header-section h2 { font-size: 18px; margin: 0; text-transform: uppercase; }
.header-section h3 { font-size: 15px; margin: 5px 0; }

.divider { border-top: 2px solid #333; margin-bottom: 15px; }

.bill-meta { display: flex; justify-content: space-between; font-size: 14px; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 15px; }

.customer-box { border: 1px solid #333; padding: 10px; margin-bottom: 15px; }
.customer-box h4 { margin: 0 0 5px 0; font-size: 12px; border-bottom: 1px solid #eee; }
.customer-grid { display: grid; grid-template-columns: 100px 1fr; font-size: 14px; row-gap: 3px; }
.label { font-weight: bold; }

.data-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
.data-table th, .data-table td { border: 1px solid #333; padding: 8px; text-align: center; font-size: 14px; }
.data-table th { background: #eee; }

.sums-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.sums-table td { padding: 8px 0; font-size: 15px; }
.amount { text-align: right; font-weight: bold; }
.sub-total td { border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 10px 0; }

.bill-footer { margin-top: 30px; font-size: 12px; border-top: 1px solid #eee; padding-top: 10px; }
.footer-row { display: flex; justify-content: space-between; align-items: flex-end; }
.officer-signature { text-align: right; }
.system-note { font-style: italic; color: #666; font-size: 10px; }

.actions-bar { margin-bottom: 20px; }
.back-btn {
    padding: 10px 20px;
    cursor: pointer;
    background-color: #27ae60 !important; 
    color: white !important;  
    border: none !important;   
    border-radius: 4px !important;  
    font-weight: bold !important;  
    transition: background-color 0.3s ease !important; 
}

.back-btn:hover {
    background-color: #219150 !important; 
}
.print-btn { padding: 10px 20px; background: #27ae60; color: white; border: none; cursor: pointer; font-weight: bold; }

.bill-counter { background: #333; color: #fff; padding: 2px 8px; font-size: 11px; float: left; border-radius: 3px; }

/* 🖨️ PRINT MEDIA QUERIES */
@media print {
    .no-print { display: none !important; }
    body { background: white !important; }
    .page-container { padding: 0 !important; background: white !important; }
    
    .invoice-box {
        margin: 0 !important;
        box-shadow: none !important;
        border: 1px solid #000 !important;
        page-break-after: always !important; /* හැම බිල් එකක්ම අලුත් පිටුවකින් */
        width: 100% !important;
    }

    .invoice-box::before {
        print-color-adjust: exact !important;
        -webkit-print-color-adjust: exact !important;
    }
}
</style>