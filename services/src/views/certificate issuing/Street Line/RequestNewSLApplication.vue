<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Static Form Data
const form = reactive({
  deedOwnerName: '',
  deedNumber: '',
  notaryName: '',
  planNumber: '',
  lotNumber: '',
  surveyorName: '',
  burrowingCompanyInfo: '',
  applicantName: '',
  applicantAddress: '',
  applicantNic: '',
  applicantContact: ''
})

// Dynamic Fields Logic
const allCategories = [
  'Assessment Number',
  'Water Billing Number',
  'Electricity Number',
  'Telephone Number',
  'Gas Connection Number'
]

const otherDetails = ref([])
const selectedCategory = ref('')

// Filter available categories based on what's already added
const availableCategories = computed(() => {
  const usedCategories = otherDetails.value.map(d => d.category)
  return allCategories.filter(c => !usedCategories.includes(c))
})

const addDetail = () => {
  if (selectedCategory.value) {
    otherDetails.value.push({
      id: Date.now(),
      category: selectedCategory.value,
      value: ''
    })
    selectedCategory.value = '' // Reset selection
  }
}

const removeDetail = (index) => {
  otherDetails.value.splice(index, 1)
}

const submitApplication = () => {
  // Navigate to AssignTO page with form data
  router.push({
    path: '/assign-to',
    state: {
      applicationData: {
        ...form,
        otherDetails: otherDetails.value
      }
    }
  })
}
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h2>Request New Application</h2>
      <router-link to="/tax/street" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="card form-card">
      <h4>Application Details</h4>
      <form @submit.prevent="submitApplication" class="application-form">
        
        <!-- Deed & Land Details -->
        <div class="section-label">Deed & Land Information</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Deed Owner's Full Name</label>
            <input v-model="form.deedOwnerName" type="text" placeholder="Enter owner name" required />
          </div>
          <div class="form-group">
            <label>Deed Number</label>
            <input v-model="form.deedNumber" type="text" placeholder="Enter deed number" required />
          </div>
          <div class="form-group">
            <label>Notary's Name</label>
            <input v-model="form.notaryName" type="text" placeholder="Enter notary name" />
          </div>
          <div class="form-group">
            <label>Plan Number</label>
            <input v-model="form.planNumber" type="text" placeholder="Enter plan number" />
          </div>
          <div class="form-group">
            <label>Lot Number</label>
            <input v-model="form.lotNumber" type="text" placeholder="Enter lot number" />
          </div>
          <div class="form-group">
            <label>Surveyor's Name</label>
            <input v-model="form.surveyorName" type="text" placeholder="Enter surveyor name" />
          </div>
        </div>


        <!-- Applicant Details -->
        <div class="section-label">Applicant Information</div>
        <div class="form-grid">
          <div class="form-group">
            <label>Applicant Name</label>
            <input v-model="form.applicantName" type="text" placeholder="Enter applicant name" required />
          </div>
          <div class="form-group">
            <label>NIC</label>
            <input v-model="form.applicantNic" type="text" placeholder="Enter NIC" required />
          </div>
          <div class="form-group">
            <label>Contact Number</label>
            <input v-model="form.applicantContact" type="text" placeholder="Enter contact number" required />
          </div>
          <div class="form-group full-width-grid">
            <label>Address</label>
            <textarea v-model="form.applicantAddress" rows="2" placeholder="Enter address"></textarea>
          </div>
          <div class="form-row full-width-grid">
          <div class="form-group">
            <label>Address and Name of the Burrowing Company</label>
            <input v-model="form.burrowingCompanyInfo" type="text" placeholder="Enter company details" />
          </div>
        </div>
        </div>

        <!-- Dynamic Other Details Section -->
        <div class="dynamic-section">
          <div class="section-header-row">
            <h4>Other Details</h4>
            <div class="add-controls" v-if="availableCategories.length > 0">
              <select v-model="selectedCategory" class="category-select">
                <option disabled value="">Select Detail Type</option>
                <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <button type="button" @click="addDetail" class="add-btn" :disabled="!selectedCategory">Add</button>
            </div>
            <div v-else class="info-text">All detail types added.</div>
          </div>

          <div class="dynamic-list">
            <div v-for="(detail, index) in otherDetails" :key="detail.id" class="dynamic-row">
              <div class="form-group">
                <label>{{ detail.category }}</label>
                <input v-model="detail.value" type="text" :placeholder="`Enter ${detail.category}`" />
              </div>
              <button type="button" @click="removeDetail(index)" class="remove-btn">Remove</button>
            </div>
            <div v-if="otherDetails.length === 0" class="empty-state">
              No additional details added.
            </div>
          </div>
        </div>

        <div class="action-row">
          <button type="submit" class="submit-btn">Assign TO</button>
        </div>
      </form>
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

.section-label {
  font-size: 10px;
  font-weight: bold;
  color: #42b883;
  margin-top: 10px;
  margin-bottom: 10px;
  text-transform: uppercase;
  border-bottom: 1px solid #eee;
  padding-bottom: 2px;
}

.application-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.full-width {
  width: 100%;
}

.full-width-grid {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 7px; /* Strict Requirement */
}

input, select, textarea {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  width: 100%;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #42b883;
}

/* Dynamic Section Styles */
.dynamic-section {
  margin-top: 10px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #eee;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header-row h4 {
  margin-bottom: 0;
  border-bottom: none;
}

.add-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.category-select {
  width: 150px;
}

.add-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 7px; /* Strict Requirement */
}

.add-btn:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.dynamic-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dynamic-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  background: white;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 7px; /* Strict Requirement */
  height: 24px; /* Align with input height approx */
}

.info-text, .empty-state {
  font-size: 7px;
  color: #7f8c8d;
  font-style: italic;
}

.action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.submit-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 10px 25px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 7px; /* Strict Requirement */
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.submit-btn:hover {
  background-color: #3aa876;
}
</style>
