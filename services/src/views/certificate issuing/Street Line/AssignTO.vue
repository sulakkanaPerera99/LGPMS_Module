<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const applicationData = ref(null)
const verificationRef = ref(null) // Scroll කිරීමට භාවිතා කරයි

// Mock Data
const technicalOfficers = ref([
  { name: 'Saman Kumara', workId: 'TO-001', assignedCount: 5, lastAssignedDate: '2026-01-02' },
  { name: 'Nimal Perera', workId: 'TO-002', assignedCount: 2, lastAssignedDate: '2026-01-12' },
  { name: 'Kamal Silva', workId: 'TO-003', assignedCount: 8, lastAssignedDate: '2026-01-10' },
  { name: 'Sunil Fernando', workId: 'TO-004', assignedCount: 0, lastAssignedDate: '-' }
])

const inputWorkId = ref('')
const selectedTO = ref(null)
const errorMessage = ref('')

// Dummy Data for UI Testing
const dummyApplicationData = {
  deedOwnerName: 'K. G. Gunapala',
  deedNumber: '98765/2010',
  notaryName: 'S. Perera',
  planNumber: 'P-2023/55',
  lotNumber: 'Lot 4A',
  surveyorName: 'D. M. Bandara',
  burrowingCompanyInfo: 'ABC Constructions Pvt Ltd',
  applicantName: 'W. A. Sunil',
  applicantAddress: 'No 12, Temple Road, Colombo',
  applicantNic: '198512345678',
  applicantContact: '077-1234567',
  otherDetails: [
    { id: 1, category: 'Assessment Number', value: '123/45' },
    { id: 2, category: 'Water Billing Number', value: 'WB-9988' }
  ]
}

onMounted(() => {
  if (history.state && history.state.applicationData) {
    applicationData.value = history.state.applicationData
  } else {
    applicationData.value = dummyApplicationData
  }
})

// මම මේ Function එක වෙනස් කළා Verification එක පෙන්නන්න
const verifyTO = async () => {
  const found = technicalOfficers.value.find(
    to => to.workId.toLowerCase() === inputWorkId.value.trim().toLowerCase()
  )
  
  if (found) {
    selectedTO.value = found
    errorMessage.value = ''
    
    // Summary එක පෙන්වූ විගස එතැනට Scroll කිරීම (UX එකට හොඳයි)
    await nextTick()
    verificationRef.value?.scrollIntoView({ behavior: 'smooth' })
  } else {
    selectedTO.value = null
    errorMessage.value = 'Technical Officer not found with this Work ID.'
  }
}

const confirmAndSubmit = () => {
  if (!selectedTO.value || !applicationData.value) return
  
  // Database එකට දත්ත යවන API call එක මෙතනට එන්න ඕනේ
  console.log('Submission Ready:', {
    application: applicationData.value,
    assignedTO: selectedTO.value
  })
  
  alert(`Application successfully assigned to ${selectedTO.value.name}!`)
  router.push('/tax/street')
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2 style="font-size: 14px;">Assign Technical Officer (TO)</h2>
      <router-link to="/request-new-application" class="back-link">Back to Request</router-link>
    </header>

    <div class="card table-card">
      <h4>Available Technical Officers</h4>
      <table class="to-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Work ID</th>
            <th>Assigned Count</th>
            <th>Last Assigned</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="to in technicalOfficers" :key="to.workId">
            <td>{{ to.name }}</td>
            <td>{{ to.workId }}</td>
            <td>{{ to.assignedCount }}</td>
            <td>{{ to.lastAssignedDate }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card input-card">
      <h4>Assign TO</h4>
      <div class="input-row">
        <div class="form-group">
          <label>Enter TO Work ID</label>
          <input v-model="inputWorkId" type="text" placeholder="TO-001" @keyup.enter="verifyTO" />
        </div>
        <button @click="verifyTO" class="verify-btn">Assign & Verify</button>
      </div>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </div>

    <div v-if="selectedTO && applicationData" ref="verificationRef" class="card summary-card">
      <h4>Verification Summary</h4>
      
      <div class="summary-grid">
        <!-- Officer Info (Full Width) -->
        <div class="summary-section officer-info">
          <h5>Officer Info</h5>
          <div class="detail-row">
            <span class="label">Selected Officer Name</span>
            <span class="value">{{ selectedTO.name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Work ID</span>
            <span class="value">{{ selectedTO.workId }}</span>
          </div>
        </div>

        <!-- Property & Deed Details -->
        <div class="summary-section">
          <h5>Property & Deed Details</h5>
          <div class="detail-row">
            <span class="label">Deed Owner</span>
            <span class="value">{{ applicationData.deedOwnerName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Deed No</span>
            <span class="value">{{ applicationData.deedNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Notary</span>
            <span class="value">{{ applicationData.notaryName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Plan No</span>
            <span class="value">{{ applicationData.planNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Lot No</span>
            <span class="value">{{ applicationData.lotNumber }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Surveyor</span>
            <span class="value">{{ applicationData.surveyorName }}</span>
          </div>
        </div>

        <!-- Applicant Details -->
        <div class="summary-section">
          <h5>Applicant Details</h5>
          <div class="detail-row">
            <span class="label">Applicant Name</span>
            <span class="value">{{ applicationData.applicantName }}</span>
          </div>
          <div class="detail-row">
            <span class="label">NIC</span>
            <span class="value">{{ applicationData.applicantNic }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Contact Number</span>
            <span class="value">{{ applicationData.applicantContact }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Address</span>
            <span class="value">{{ applicationData.applicantAddress }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Company</span>
            <span class="value">{{ applicationData.burrowingCompanyInfo }}</span>
          </div>
        </div>

        <!-- Other Information -->
        <div class="summary-section">
          <h5>Other Information</h5>
          <div v-if="applicationData.otherDetails && applicationData.otherDetails.length > 0">
            <div v-for="detail in applicationData.otherDetails" :key="detail.id" class="detail-row">
              <span class="label">{{ detail.category }}</span>
              <span class="value">{{ detail.value }}</span>
            </div>
          </div>
          <div v-else class="empty-text">
            No additional details provided.
          </div>
        </div>
      </div>

      <div class="action-row">
        <button @click="confirmAndSubmit" class="confirm-btn full-width-btn">Confirm & Submit Application</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 20px;
  max-width: 900px;
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
  font-size: 10px;
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
  margin-bottom: 15px;
  font-size: 14px; /* Strict Requirement */
}

h5 {
  font-size: 14px; /* Strict Requirement */
  margin: 0 0 10px 0;
  color: #2c3e50;
  border-bottom: 1px solid #42b883;
  padding-bottom: 5px;
  display: inline-block;
}

/* Table Styles */
.to-table {
  width: 90%;
  border-collapse: collapse;
  font-size: 7px; /* Strict Requirement */
  margin: 0 auto;
}

.to-table th,
.to-table td {
  text-align: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
  color: #2c3e50;
}

.to-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 14px; /* Strict Requirement for Headings */
}

.to-table tr:nth-child(even) {
  background-color: #f9f9f9; /* Striped */
}

.to-table tr:hover {
  background-color: #f1f1f1;
}

/* Input Section */
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
  max-width: 300px;
}

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
}

input:focus {
  outline: none;
  border-color: #42b883;
}

.verify-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 7px; /* Strict Requirement */
  height: 28px; /* Match input height roughly */
}

.error-text {
  color: #e74c3c;
  font-size: 7px;
  margin-top: 5px;
}

/* Summary Section */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.summary-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.officer-info {
  grid-column: 1 / -1;
  background-color: #e8f5e9;
  border-color: #c8e6c9;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed #d1d9e0;
  padding-bottom: 4px;
  margin-bottom: 2px;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-weight: 600;
  color: #555;
  font-size: 7px; /* Strict Requirement */
}

.detail-row .value {
  font-weight: bold;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
  text-align: right;
}

.action-row {
  margin-top: 20px;
}

.confirm-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 14px; /* Large button */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: background-color 0.3s;
}

.confirm-btn:hover {
  background-color: #3aa876;
}

.full-width-btn {
  width: 100%;
  padding: 15px;
}

.empty-text {
  font-size: 7px;
  color: #999;
  font-style: italic;
}

</style>
