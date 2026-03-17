<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

// State Variables
const projectCode = ref('')
const readerId = ref('')
const readingDate = ref(new Date().toISOString().substr(0, 10))
const projects = ref([])
const pendingCustomers = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)

// Extract month and year from reading date
const selectedMonth = ref(new Date().getMonth() + 1)
const selectedYear = ref(new Date().getFullYear())

// Watch for changes in project code and reading date
watch([projectCode, readingDate], () => {
  if (projectCode.value && readingDate.value) {
    const date = new Date(readingDate.value)
    selectedMonth.value = date.getMonth() + 1
    selectedYear.value = date.getFullYear()
    fetchPendingCustomers()
  }
})

// Fetch project codes on mount
onMounted(async () => {
  await fetchProjectCodes()
})

// Fetch project codes
const fetchProjectCodes = async () => {
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData && userData.sabha) {
      // Fetch real project list from backend
      const response = await axios.get(`/water-project-list/${userData.sabha}`)
      projects.value = response.data
    }
  } catch (error) {
    console.error('Error fetching project codes:', error)
  }
}

// Fetch pending customers
// Fetch pending customers
const fetchPendingCustomers = async () => {
  if (!projectCode.value || !readingDate.value) return

  isLoading.value = true
  try {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    const sabhaCode = userData ? userData.sabha : ''
    const response = await axios.get(`/water-readings/pending-customers`, {
      params: {
        sabha_code: sabhaCode,
        project_code: projectCode.value,
        month: selectedMonth.value,
        year: selectedYear.value
      }
    })

    if (response.data.status === 'success') {
  let customers = response.data.data.map(customer => ({
    ...customer,
    last_reading: customer.last_reading || 0,
    current_reading: null,
    is_valid: false
  }))

  // බිල්පත් අංකයේ අවසාන ඉලක්කම් 3 ගෙන එය අංකයක් ලෙස සලකා sort කිරීම
  customers.sort((a, b) => {
    // බිල්පත් අංකයේ අවසාන අක්ෂර 3 වෙන් කර ගන්නවා (slice)
    const valA = String(a.bill_number_ref || "").slice(-3);
    const valB = String(b.bill_number_ref || "").slice(-3);

    // ඒවා ඉලක්කම් (Numbers) ලෙස සලකා අඩු කරනවා (Ascending order)
    return parseInt(valA) - parseInt(valB);
  });

  pendingCustomers.value = customers
}
  } catch (error) {
    console.error('Error fetching pending customers:', error)
    alert('Failed to fetch pending customers')
  } finally {
    isLoading.value = false
  }
}

// Validate reading input
const validateReading = (customer) => {
  if (customer.current_reading === null || customer.current_reading === '') {
    customer.is_valid = false
  } else {
    customer.is_valid = customer.current_reading >= customer.last_reading
  }
}

// Batch save readings
const saveBatchReadings = async () => {
  // Validation: Check if Meter Reader ID is entered
  if (!readerId.value || readerId.value.trim() === '') {
    alert("Please enter the Meter Reader ID before saving.")
    return
  }

  // Step 1: Filter rows where user has entered a value (ignore empty/null)
  const filledReadings = pendingCustomers.value.filter(customer => 
    customer.current_reading !== null && 
    customer.current_reading !== '' && 
    customer.current_reading !== undefined
  )

  // Empty batch check
  if (filledReadings.length === 0) {
    alert('Please enter at least one reading')
    return
  }

  // Step 2: Validate (Iterate through filtered list)
  // Invalid: current_reading < previous_reading
  const invalidReadings = filledReadings.filter(customer => {
    const current = Number(customer.current_reading)
    const previous = Number(customer.last_reading)
    return current < previous
  })

  if (invalidReadings.length > 0) {
    const billNumbers = invalidReadings.map(c => c.bill_number_ref).join(', ')
    alert(`Error: Reading cannot be less than previous for Bill No: ${billNumbers}`)
    return
  }

  isSubmitting.value = true
  try {
    // Step 3: Send ONLY the filtered list
    const readings = filledReadings.map(customer => ({
      account_id: customer.account_id,
      bill_number_ref: customer.bill_number_ref,
      sabha_code: customer.sabha_code,
      project_code: customer.project_code,
      reading_date: readingDate.value,
      year: selectedYear.value,
      month: selectedMonth.value,
      previous_reading: customer.last_reading,
      current_reading: customer.current_reading,
      reader_id: readerId.value || null,
      reading_source: 'MobileApp'
    }))

    const response = await axios.post('/water-readings/batch', readings)

    if (response.data.status === 'success') {
      alert(`${response.data.data.insertedCount} readings saved successfully!`)
      // Refresh the list
      await fetchPendingCustomers()
    }
  } catch (error) {
    console.error('Error saving batch readings:', error)
    alert('Failed to save readings')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h3>Batch Meter Reading Entry</h3>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <!-- Header Inputs -->
    <div class="card header-card">
      <h4>Reading Parameters</h4>
      <div class="header-grid">
        <div class="input-item">
          <label class="label">Project Code</label>
          <select v-model="projectCode" class="custom-select">
            <option value="">Select Project</option>
            <option v-for="project in projects" :key="project.code" :value="project.code">
              {{ project.code }} - {{ project.name }}
            </option>
          </select>
        </div>

        <div class="input-item">
          <label class="label">Meter Reader ID</label>
          <input type="text" v-model="readerId" placeholder=" Reader ID" />
        </div>

        <div class="input-item">
          <label class="label">Reading Date</label>
          <input type="date" v-model="readingDate" />
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div v-if="projectCode && readingDate" class="card table-card">
      <h4>Pending Customers for {{ selectedMonth }}/{{ selectedYear }}</h4>

      <div v-if="isLoading" class="loading">Loading customers...</div>

      <div v-else-if="pendingCustomers.length === 0" class="no-data">
        No pending customers found for the selected project and date.
      </div>

      <table v-else class="readings-table">
        <thead>
          <tr>
            <th>Bill Number</th>
            <th>Customer Name</th>
            <th>Previous Reading</th>
            <th>Current Reading</th>
            <th>Validity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customer in pendingCustomers" :key="customer.account_id">
            <td>{{ customer.bill_number_ref }}</td>
            <td>{{ customer.full_name }}</td>
            <td>{{ customer.last_reading }}</td>
            <td>
              <input
                type="number"
                v-model.number="customer.current_reading"
                @input="validateReading(customer)"
                :min="customer.last_reading"
                :placeholder="customer.last_reading"
                class="reading-input"
                :class="{ 'invalid': !customer.is_valid && customer.current_reading !== null && customer.current_reading !== '' }"
              />
            </td>
            <td>
              <span :class="customer.is_valid ? 'status-valid' : 'status-invalid'">
                {{ customer.is_valid ? 'Valid' : 'Invalid' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="action-row">
        <button
          @click="saveBatchReadings"
          class="batch-save-btn"
          :disabled="isSubmitting || pendingCustomers.length === 0"
        >
          {{ isSubmitting ? 'Saving...' : `Save ${pendingCustomers.filter(c => c.current_reading !== null && c.current_reading !== '').length} Readings` }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.back-link {
  color: #42b883;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px !important;
}

.card {
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

h4 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #42b883;
  display: inline-block;
  padding-bottom: 5px;
  margin-bottom: 20px;
}

.header-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.input-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

input, .custom-select {
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

input:focus, .custom-select:focus {
  outline: none;
  border-color: #42b883;
}

.readings-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.readings-table th,
.readings-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.readings-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.reading-input {
  width: 100px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.reading-input.invalid {
  border-color: #e74c3c;
}

.status-valid {
  color: #27ae60;
  font-weight: bold;
}

.status-invalid {
  color: #e74c3c;
  font-weight: bold;
}

.loading, .no-data {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-style: italic;
}

.action-row {
  display: flex;
  justify-content: center;
}

.batch-save-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
}

.batch-save-btn:hover:not(:disabled) {
  background-color: #3aa876;
}

.batch-save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
