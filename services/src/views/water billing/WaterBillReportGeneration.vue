<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 1. State Variables
const reports = ref([]);
const isLoading = ref(false);
const selectedProject = ref('');
//const currentSabha = ref('');
const projects = ref([])
const currentSabha = ref('') // Re-added this ref as it is needed for API calls

// Fetch project codes on mount
onMounted(async () => {
  const userDataString = sessionStorage.getItem('userData');
  if (userDataString) {
    const userData = JSON.parse(userDataString);
    currentSabha.value = userData.sabha || userData.sabha_code || userData.code;
    
    // Fetch Projects and Reports
    if (currentSabha.value) {
        await fetchProjectCodes();
        await fetchReportData(); // Added report fetching
    }
  }
})

// Fetch project codes
const fetchProjectCodes = async () => {
  try {
      // Fetch real project list from backend
      const response = await axios.get(`/water-project-list/${currentSabha.value}`)
      projects.value = response.data
  } catch (error) {
    console.error('Error fetching project codes:', error)
  }
}

// Fetch Report Data function
const fetchReportData = async () => {
  isLoading.value = true;
  try {
    // ✅ URL එක හරියටම backend route එකට ගැලපෙන්න ඕන
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

// 3. Computed Properties for Filtering
const filteredReports = computed(() => {
  if (!selectedProject.value) {
    return reports.value;
  }
  return reports.value.filter(r => r.project_code === selectedProject.value || r.project_name === selectedProject.value); 
  // Note: Ensure you match the property (code or name) correctly based on select value
});

// 4. Helper Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', { 
    style: 'currency', 
    currency: 'LKR', 
    minimumFractionDigits: 2 
  }).format(amount || 0);
};

const getPercentageColor = (percentage) => {
  const p = parseFloat(percentage);
  if (p >= 75) return 'text-green'; // හොඳ එකතු කිරීමක් නම් කොළ පාට
  if (p >= 40) return 'text-orange'; // මධ්‍යම නම් තැඹිලි
  return 'text-red'; // අඩු නම් රතු
};

</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h2>Project Collection Report</h2>
        <p class="subtitle">Overview of collection progress by water projects</p>
      </div>
      <router-link to="/officer-dashboard" class="back-link">
        <span class="icon">←</span> Back to Dashboard
      </router-link>
    </header>

    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label for="projectSelect">Filter by Project:</label>
          <div class="select-wrapper">
            <select id="projectSelect" v-model="selectedProject" class="filter-select">
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
        <div class="spinner"></div>
        <p>Generating Report...</p>
      </div>

      <div v-else class="table-responsive">
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 50px;">ID</th>
              <th>Project Name</th>
              <th class="text-center">No. of Users</th>
              <th class="text-right">Total Amount to Collect</th>
              <th class="text-right">Collected Amount</th>
              <th class="text-right">Due Amount</th>
              <th class="text-center">Percentage (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in filteredReports" :key="index">
              <td>{{ index + 1 }}</td>
              <td class="fw-bold">{{ row.project_name }}</td>
              <td class="text-center">{{ row.number_of_users }}</td>
              
              <td class="text-right amount-col">
                {{ formatCurrency(row.total_amount_to_collect) }}
              </td>
              <td class="text-right amount-col text-blue">
                {{ formatCurrency(row.collected_amount) }}
              </td>
              <td class="text-right amount-col text-red">
                {{ formatCurrency(row.due_amount) }}
              </td>

              <td class="text-center">
                <div class="percentage-wrapper">
                  <span class="percentage-text" :class="getPercentageColor(row.percentage)">
                    {{ row.percentage }}%
                  </span>
                  <div class="progress-bar-bg">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ width: row.percentage + '%', backgroundColor: row.percentage >= 50 ? '#27ae60' : '#e74c3c' }"
                    ></div>
                  </div>
                </div>
              </td>
            </tr>

            <tr v-if="filteredReports.length === 0">
              <td colspan="7" class="empty-state">
                No data available for the selected criteria.
              </td>
            </tr>
          </tbody>
          <tfoot v-if="filteredReports.length > 0">
            <tr>
              <td colspan="3" class="text-right fw-bold">Grand Total:</td>
              <td class="text-right fw-bold">
                {{ formatCurrency(filteredReports.reduce((sum, r) => sum + Number(r.total_amount_to_collect), 0)) }}
              </td>
              <td class="text-right fw-bold text-blue">
                {{ formatCurrency(filteredReports.reduce((sum, r) => sum + Number(r.collected_amount), 0)) }}
              </td>
              <td class="text-right fw-bold text-red">
                {{ formatCurrency(filteredReports.reduce((sum, r) => sum + Number(r.due_amount), 0)) }}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- General Layout --- */
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: sans-serif;
}

/* --- Header Styles (Matched to Reference) --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.page-header h2 {
  margin: 0;
  color: #2c3e50; /* Matched Color */
  font-size: 20px; /* Slightly larger for main title */
  font-weight: 700;
}

.subtitle {
  margin: 2px 0 0;
  color: #666;
  font-size: 10px; /* Small font */
}

.back-link {
  color: #42b883; /* Green Theme */
  text-decoration: none;
  font-weight: bold;
  font-size: 10px;
}

/* --- Card Styles --- */
.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 15px;
}

/* --- Filter Section --- */
.filter-card {
  background-color: #ffffff;
  border-left: 4px solid #42b883; /* Green Border */
  padding: 15px;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-size: 10px;
  font-weight: bold;
  color: #2c3e50;
}

.select-wrapper {
  position: relative;
  width: 200px;
}

.filter-select {
  width: 100%;
  padding: 6px 6px 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement from Reference */
  background-color: white;
  cursor: pointer;
  box-sizing: border-box;
}

.filter-select:focus {
  outline: none;
  border-color: #42b883;
}

.select-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: #888;
  pointer-events: none;
}

.summary-badge {
  background-color: #e8f8f5;
  color: #2c3e50;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 10px;
  border: 1px solid #42b883;
  font-weight: bold;
}

/* --- Table Styles --- */
.table-responsive {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 7px; /* Strict Requirement from Reference */
  min-width: 800px;
}

.report-table th,
.report-table td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
  vertical-align: top;
}

.report-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  white-space: nowrap;
}

.report-table tbody tr:hover {
  background-color: #f9f9f9;
}

.report-table tfoot {
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

/* --- Typography & Utility --- */
.text-center { text-align: center; }
.text-right { text-align: right; }
.fw-bold { font-weight: 600; }

.amount-col {
  font-family: sans-serif;
  font-weight: 500;
}

/* Colors for Amounts/Status */
.text-blue { color: #2980b9; }
.text-red { color: #c0392b; }
.text-green { color: #27ae60; }
.text-orange { color: #f39c12; }

/* --- Progress Bar (Scaled down for small table) --- */
.percentage-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.percentage-text {
    font-weight: bold;
}

.progress-bar-bg {
  width: 60px;
  height: 3px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 2px;
}

/* --- Loading & Empty States --- */
.loading-state {
  text-align: center;
  padding: 20px;
  font-size: 10px;
  color: #42b883;
  font-weight: bold;
}

.spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #42b883;
  border-radius: 50%;
  width: 15px;
  height: 15px;
  animation: spin 1s linear infinite;
  margin: 0 auto 5px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #888;
  font-style: italic;
  font-size: 10px;
}
</style>