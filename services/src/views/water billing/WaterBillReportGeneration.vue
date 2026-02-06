<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 1. State Variables
const reports = ref([]);
const isLoading = ref(false);
const selectedProject = ref('');
const projects = ref([]);
const currentSabha = ref('');

// 2. Load Data on Mount
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;
    
    if (currentSabha.value) {
        await fetchProjectCodes();
        await fetchReportData();
    }
  }
});

// Fetch Project List (Dropdown)
const fetchProjectCodes = async () => {
  try {
      const response = await axios.get(`/water-project-list/${currentSabha.value}`);
      projects.value = response.data;
  } catch (error) {
    console.error('Error fetching project codes:', error);
  }
};

// Fetch Main Report Data
const fetchReportData = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/reports/projects/${currentSabha.value}`);
    if(response.data.success) {
        reports.value = response.data.data;
    }
  } catch (error) {
    console.error("Error fetching reports:", error);
  } finally {
    isLoading.value = false;
  }
};

// 3. Filtering Logic
const filteredReports = computed(() => {
  if (!selectedProject.value) return reports.value;
  // Filter by Project Code
  return reports.value.filter(r => r.project_code === selectedProject.value); 
});

// 4. Formatting Helpers
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', { 
    style: 'currency', 
    currency: 'LKR', 
    minimumFractionDigits: 2 
  }).format(amount || 0);
};

const getPercentageColor = (percentage) => {
  const p = parseFloat(percentage);
  if (p >= 75) return 'text-green';
  if (p >= 40) return 'text-orange';
  return 'text-red';
};

// 5. PRINT FUNCTION (Report Generation)
const printReport = () => {
  // Calculate Totals
  const totalCollect = filteredReports.value.reduce((sum, r) => sum + Number(r.total_amount_to_collect), 0);
  const totalCollected = filteredReports.value.reduce((sum, r) => sum + Number(r.collected_amount), 0);
  const totalDue = filteredReports.value.reduce((sum, r) => sum + Number(r.due_amount), 0);

  const printWindow = window.open('', '_blank');
  const sabhaName = `Pradeshiya Sabha (${currentSabha.value})`; 
  const currentDate = new Date().toLocaleDateString('en-GB');

  const htmlContent = `
    <html>
      <head>
        <title>Project Collection Report</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; color: #000; padding: 10px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
          .header h2 { margin: 5px 0; font-size: 18px; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; font-weight: bold;}
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th, td { border: 1px solid #000; padding: 8px 5px; text-align: left; }
          th { background-color: #f0f0f0; text-align: center; font-weight: bold; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .footer-totals { background-color: #f0f0f0; font-weight: bold; }
          .signature-section { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; }
          .sig-line { border-top: 1px dotted #000; width: 200px; margin: 0 auto 5px auto; }
          .sig-box { width: 30%; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${sabhaName}</h1>
          <h2>Water Project Collection Report</h2>
        </div>
        <div class="meta-info">
          <span>Filter: ${selectedProject.value ? selectedProject.value : 'All Projects'}</span>
          <span>Date: ${currentDate}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Project Name</th>
              <th>Users</th>
              <th>Total (LKR)</th>
              <th>Collected (LKR)</th>
              <th>Due (LKR)</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            ${filteredReports.value.map((row, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${row.project_name}</td>
                <td class="text-center">${row.number_of_users}</td>
                <td class="text-right">${formatCurrency(row.total_amount_to_collect).replace('LKR', '')}</td>
                <td class="text-right">${formatCurrency(row.collected_amount).replace('LKR', '')}</td>
                <td class="text-right">${formatCurrency(row.due_amount).replace('LKR', '')}</td>
                <td class="text-center">${row.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="footer-totals">
              <td colspan="3" class="text-right">Grand Total:</td>
              <td class="text-right">${formatCurrency(totalCollect).replace('LKR', '')}</td>
              <td class="text-right">${formatCurrency(totalCollected).replace('LKR', '')}</td>
              <td class="text-right">${formatCurrency(totalDue).replace('LKR', '')}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div class="signature-section">
          <div class="sig-box"><div class="sig-line"></div><p>Prepared By</p></div>
          <div class="sig-box"><div class="sig-line"></div><p>Checked By</p></div>
          <div class="sig-box"><div class="sig-line"></div><p>Authorized Officer</p></div>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); }, 500);
};
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Project Collection Report</h2>
        <p class="subtitle">Overview of collection progress by water projects</p>
      </div>
      <div class="header-actions">
         <router-link to="/officer-dashboard" class="back-link">
           <span class="icon">←</span> Back to Dashboard
         </router-link>
      </div>
    </header>

    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>Filter by Project:</label>
          <div class="select-wrapper">
            <select v-model="selectedProject" class="filter-select">
              <option value="">All Projects</option>
              <option v-for="project in projects" :key="project.code" :value="project.code">
                {{ project.code }} - {{ project.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="summary-badge">
          <span>Total Projects: <strong>{{ projects.length }}</strong></span>
        </div>
      </div>
    </div>

    <div class="card table-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div><p>Generating Report...</p>
      </div>

      <div v-else class="table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 50px;">ID</th>
              <th>Project Name</th>
              <th class="text-center">Users</th>
              <th class="text-right">Total (LKR)</th>
              <th class="text-right">Collected (LKR)</th>
              <th class="text-right">Due (LKR)</th>
              <th class="text-center">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredReports" :key="index">
              <td>{{ index + 1 }}</td>
              <td class="fw-bold">{{ row.project_name }}</td>
              <td class="text-center">{{ row.number_of_users }}</td>
              <td class="text-right amount-col">{{ formatCurrency(row.total_amount_to_collect) }}</td>
              <td class="text-right amount-col text-blue">{{ formatCurrency(row.collected_amount) }}</td>
              <td class="text-right amount-col text-red">{{ formatCurrency(row.due_amount) }}</td>
              <td class="text-center">
                <div class="percentage-wrapper">
                  <span class="percentage-text" :class="getPercentageColor(row.percentage)">{{ row.percentage }}%</span>
                  <div class="progress-bar-bg">
                    <div class="progress-bar-fill" :style="{ width: row.percentage + '%', backgroundColor: row.percentage >= 50 ? '#27ae60' : '#e74c3c' }"></div>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="filteredReports.length === 0">
              <td colspan="7" class="empty-state">No data available.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <button @click="printReport" class="print-btn">🖨️ Print Report</button>
</template>

<style scoped>
/* --- General Layout --- */
.page-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    font-family: sans-serif;
}

/* --- Header Styles --- */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
}

.header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
}

/* --- Print Button Styles (Updated for Centering) --- */
.print-btn {
    background-color: #2c3e50;
    color: white;
    border: none;
    padding: 10px 24px; /* තරමක් ලොකු කළා පෙනුම හොඳ වෙන්න */
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    
    /* Centering Logic */
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 30px auto; /* උඩින්/යටින් 30px ඉඩක් සහ දෙපැත්තෙන් Auto (මැදට ගනී) */
    width: fit-content; /* බටන් එකේ පළල එය ඇතුලේ තියෙන වචන වලට සීමා කරයි */
    
    transition: background 0.3s ease, transform 0.2s ease;
}

.print-btn:hover {
    background-color: #1a252f;
    transform: translateY(-2px); /* Hover කරද්දී පොඩ්ඩක් උඩට එන effect එකක් */
}

.back-link {
    color: #42b883;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px;
}

/* --- Card Styles --- */
.card {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
}

/* --- Filter Section --- */
.filter-card {
    border-left: 4px solid #42b883;
}

.filter-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.filter-group {
    display: flex;
    align-items: center;
    gap: 15px;
}

.filter-select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    min-width: 200px;
}

.summary-badge {
    background-color: #e8f8f5;
    color: #2c3e50;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 13px;
    border: 1px solid #42b883;
    font-weight: bold;
}

/* --- Table Styles --- */
.report-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    min-width: 800px;
}

.report-table th,
.report-table td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
}

.report-table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

/* --- Typography & Colors --- */
.text-center {
    text-align: center;
}

.text-right {
    text-align: right;
}

.fw-bold {
    font-weight: 600;
}

.text-blue {
    color: #2980b9;
}

.text-red {
    color: #c0392b;
}

.text-green {
    color: #27ae60;
}

.text-orange {
    color: #f39c12;
}

/* --- Loading & Empty States --- */
.loading-state,
.empty-state {
    text-align: center;
    padding: 30px;
    color: #888;
}

.spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #42b883;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* --- Progress Bar --- */
.progress-bar-bg {
    width: 80px;
    height: 6px;
    background-color: #eee;
    border-radius: 3px;
    overflow: hidden;
    margin: 0 auto;
}

.progress-bar-fill {
    height: 100%;
    border-radius: 3px;
}
</style>