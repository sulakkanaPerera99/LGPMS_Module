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
            <span class="select-arrow">▼</span>
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
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* --- Header Styles (Maroon Theme) --- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  border-bottom: 3px solid #800000; /* Maroon Border */
  padding-bottom: 15px;
}

.page-header h2 {
  margin: 0;
  color: #800000; /* Maroon Text */
  font-size: 24px;
  font-weight: 700;
}

.subtitle {
  margin: 5px 0 0;
  color: #666;
  font-size: 13px;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #f8f9fa;
  color: #800000;
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 15px;
  border-radius: 20px;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

.back-link:hover {
  background-color: #800000;
  color: white;
  border-color: #800000;
}

/* --- Card Styles --- */
.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  overflow: hidden;
}

/* --- Filter Section --- */
.filter-card {
  padding: 15px 20px;
  background-color: #fff5f5; /* Light Reddish tint */
  border-left: 4px solid #800000;
}

.filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filter-group label {
  font-weight: 600;
  color: #444;
  font-size: 14px;
}

.select-wrapper {
  position: relative;
  width: 250px;
}

.filter-select {
  width: 100%;
  padding: 8px 30px 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  appearance: none;
  background-color: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #800000;
  box-shadow: 0 0 0 2px rgba(128, 0, 0, 0.1);
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #666;
  pointer-events: none;
}

.summary-badge {
  background-color: #fff;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  border: 1px solid #ddd;
  color: #555;
}

/* --- Table Styles --- */
.table-responsive {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.report-table th,
.report-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

.report-table th {
  background-color: #f3f3f3;
  color: #333;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.report-table tbody tr:hover {
  background-color: #fdfdfd;
}

.report-table tfoot {
  background-color: #fafafa;
  border-top: 2px solid #ddd;
}

/* --- Typography & Utility --- */
.text-center { text-align: center; }
.text-right { text-align: right; }
.fw-bold { font-weight: 600; }

.text-blue { color: #2980b9; font-weight: 600; }
.text-red { color: #c0392b; font-weight: 600; }
.text-green { color: #27ae60; font-weight: 600; }
.text-orange { color: #f39c12; font-weight: 600; }

.amount-col {
  font-family: 'Consolas', 'Monaco', monospace; /* Monospace for numbers alignment */
}

/* --- Progress Bar --- */
.percentage-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.progress-bar-bg {
  width: 80px;
  height: 4px;
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
  padding: 40px;
  color: #666;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #800000;
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

.empty-state {
  text-align: center;
  padding: 30px;
  color: #888;
  font-style: italic;
}
</style>