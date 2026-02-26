<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// --- State ---
const sabhaCode = ref('')
const message = ref('')
const recipientType = ref('ALL') 
const customers = ref([]) // Filtered list for the modal
const selectedCustomerIds = ref([])
const isSending = ref(false)
const isLoadingCustomers = ref(false)

// Filter & Search State for Modal
const isFilterDialogOpen = ref(false)
const searchQuery = ref('')
const availableProjectCodes = ref([])
const activeFilters = reactive({
    projectCode: '',
    connectionTypes: [],
    samurdhi: [],
    metered: []
})

// Character count
const charCount = computed(() => message.value.length)
const smsParts = computed(() => Math.ceil(message.value.length / 160) || 1)

onMounted(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData) {
        sabhaCode.value = userData.sabha || userData.sabha_code || userData.code
        fetchCustomers()
        fetchProjects()
    }
})
watch(recipientType, (newValue) => {
    if (newValue === 'SPECIFIC') {
        isFilterDialogOpen.value = true
    } else {
        selectedCustomerIds.value = [] // 'ALL' තේරුවහොත් selections clear කිරීමට (අවශ්‍ය නම් පමණක්)
    }
})

// Watchers for filtering inside modal
watch([searchQuery, activeFilters], () => {
    fetchCustomers()
}, { deep: true })

// Fetch Projects
const fetchProjects = async () => {
    try {
        const response = await axios.get(`/water-payment-projects/${sabhaCode.value}`)
        availableProjectCodes.value = response.data
    } catch (err) { console.error(err) }
}

// Fetch Customers (with filters)
const fetchCustomers = async () => {
    isLoadingCustomers.value = true
    try {
        const params = {
            search: searchQuery.value,
            projectCode: activeFilters.projectCode,
            connectionTypes: activeFilters.connectionTypes.join(','),
            samurdhi: activeFilters.samurdhi.join(','),
            metered: activeFilters.metered.join(',')
        }
        const response = await axios.get(`/water-payment-customers/${sabhaCode.value}`, { params })
        customers.value = response.data
    } catch (error) {
        console.error("Error loading customers:", error)
    } finally {
        isLoadingCustomers.value = false
    }
}

const toggleCustomerSelection = (id) => {
    const index = selectedCustomerIds.value.indexOf(id);
    if (index > -1) selectedCustomerIds.value.splice(index, 1);
    else selectedCustomerIds.value.push(id);
}

// --- SMS SENDING LOGIC ---
const sendBulkSMS = async () => {
    if (!message.value.trim()) {
        Swal.fire('Empty Message', 'Please enter a message to send.', 'warning')
        return
    }
    if (recipientType.value === 'SPECIFIC' && selectedCustomerIds.value.length === 0) {
        Swal.fire('No Recipients', 'Please select at least one customer.', 'warning')
        return
    }

    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: `Sending SMS to ${recipientType.value === 'ALL' ? 'ALL' : selectedCustomerIds.value.length} customers.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#42b883',
        confirmButtonText: 'Yes, Send Now!'
    })

    if (!confirm.isConfirmed) return

    isSending.value = true
    try {
        const payload = {
            sabha_code: sabhaCode.value,
            message: message.value,
            recipient_type: recipientType.value,
            specific_ids: recipientType.value === 'SPECIFIC' ? selectedCustomerIds.value : []
        }
        const response = await axios.post('/sms/send-custom', payload)
        if (response.data.status === 'success') {
            Swal.fire('Queued!', response.data.message, 'success')
            message.value = ''
            selectedCustomerIds.value = []
        }
    } catch (error) {
        console.error("SMS Error:", error)
        Swal.fire('Error', 'Failed to initiate SMS sending.', 'error')
    } finally {
        isSending.value = false
    }
}
    const selectAllCustomers = () => {
    selectedCustomerIds.value = customers.value.map(c => c.id)
}

const deselectAllCustomers = () => {
    selectedCustomerIds.value = []
}
</script>

<template>
    <div id="sms-panel-container" class="page-container">
        <header class="page-header">
            <div class="header-title">
                <h2>SMS Announcement Panel</h2>
                <p>Broadcast messages to your water consumers</p>
            </div>
            <router-link to="/officer-dashboard" class="back-link"> Back to Dashboard</router-link>
        </header>

        <div class="card">
            <div class="card-header-icon">
                <h4>Select Recipients</h4>
            </div>

            <div class="segmented-control">
                <label :class="{ 'active': recipientType === 'ALL' }">
                    <input type="radio" value="ALL" v-model="recipientType">
                    <span><i class="fas fa-globe"></i> All Customers</span>
                </label>
                <label :class="{ 'active': recipientType === 'SPECIFIC' }">
                    <input type="radio" value="SPECIFIC" v-model="recipientType">
                    <span><i class="fas fa-user-check"></i> Specific Group</span>
                </label>
            </div>

            <div v-if="recipientType === 'SPECIFIC'" class="info-banner clickable-banner" @click="isFilterDialogOpen = true">
                <i class="fas fa-check-circle"></i>
                Selected Recipients: <strong>{{ selectedCustomerIds.length }}</strong> (Click to change)
            </div>
            
            <div v-else class="info-banner">
                <i class="fas fa-info-circle"></i>
                Message will be sent to all active consumers in {{ sabhaCode }}.
            </div>
        </div>

        <div class="card">
            <h4>Compose Message</h4>
            <div class="form-group">
                <textarea v-model="message" rows="6" class="sms-textarea" placeholder="Type your announcement here..."></textarea>
                <div class="sms-info">
                <span style="margin-right: 20px;">Characters: <strong>{{ charCount }}</strong></span>
                <span>Parts: <strong>{{ smsParts }}</strong></span>
            </div>
            </div>
            <button @click="sendBulkSMS" class="send-btn" :disabled="isSending || !message.trim()">
                <span v-if="isSending">Sending...</span>
                <span v-else>Broadcast Message</span>
            </button>
        </div>

        <div v-if="isFilterDialogOpen" class="modal-overlay">
            <div class="modal-content selection-modal">
                <div class="modal-header">
                    <h4>Select Customers</h4>
                </div>

                <div class="modal-filters flex-filters">
                    <div class="search-bar search-bar-custom">
                        <i class="fas fa-search"></i>
                        <input type="text" v-model="searchQuery" placeholder="Search name or bill no..." class="modal-input-field">
                    </div>

                    <div class="filter-controls select-controls">
                        <select v-model="activeFilters.projectCode" class="modal-select-field">
                            <option value="">All Projects</option>
                            <option v-for="p in availableProjectCodes" :key="p.code" :value="p.code">
                                {{ p.name }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="table-wrapper">
                    <div class="filter-controls table-action-margin">
                        <div class="filter-controls-actions">
                            <button @click="selectAllCustomers" class="apply-btn-select">Select All</button>
                            <button @click="deselectAllCustomers" class="apply-btn-disselect">Clear All</button>
                        </div>
                    </div>
                    <table class="selection-table">
                        <thead>
                            <tr>
                                <th width="40">Select</th>
                                <th>Bill No</th>
                                <th>Customer Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="c in customers" :key="c.id" @click="toggleCustomerSelection(c.id)" :class="{ 'row-selected': selectedCustomerIds.includes(c.id) }">
                                <td><input type="checkbox" :checked="selectedCustomerIds.includes(c.id)"></td>
                                <td>{{ c.newBillNumber }}</td>
                                <td>{{ c.fullName }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="modal-footer">
                    <span>Selected: <strong>{{ selectedCustomerIds.length }}</strong></span>
                    <button class="apply-btn" @click="isFilterDialogOpen = false">Done</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Main Container */
#sms-panel-container.page-container {
    padding: 40px 20px !important; 
    max-width: 1100px !important; 
    margin: 40px auto !important;
    background: #f4f7f6 !important;
    min-height: calc(100vh - 80px) !important;
    border-radius: 15px !important; 
    box-shadow: 0 4px 20px rgba(0,0,0,0.05) !important;
}

#sms-panel-container .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: flex-start !important;
    margin-bottom: 30px !important;
}

#sms-panel-container .header-title h2 {
    margin: 0 !important;
    color: #2c3e50 !important;
    font-size: 24px !important;
}

#sms-panel-container .sms-info {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 20px !important;
    margin-top: 10px !important;
    font-size: 13px !important;
    color: #64748b !important;
}

#sms-panel-container .header-title p {
    margin: 5px 0 0 0 !important;
    color: #7f8c8d !important;
    font-size: 14px !important;
}

#sms-panel-container .back-link {
    background: #fff !important;
    padding: 8px 15px !important;
    border-radius: 6px !important;
    text-decoration: none !important;
    color: #42b883 !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05) !important;
}

/* Card Styles */
#sms-panel-container .card {
    background: #fff !important;
    border-radius: 12px !important;
    padding: 25px !important;
    box-shadow: 0 10px 25px rgba(0,0,0,0.02) !important;
    border: 1px solid #eef2f1 !important;
    margin-bottom: 25px !important;
}

#sms-panel-container .card-header-icon {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    margin-bottom: 20px !important;
    color: #42b883 !important;
}

#sms-panel-container .card-header-icon h4 {
    margin: 0 !important;
    color: #34495e !important;
    font-size: 17px !important;
}

/* Segmented Control (Radio buttons) */
#sms-panel-container .segmented-control {
    display: flex !important;
    background: #f0f2f1 !important;
    padding: 5px !important;
    border-radius: 10px !important;
    margin-bottom: 20px !important;
}

#sms-panel-container .segmented-control label {
    flex: 1 !important;
    text-align: center !important;
    padding: 10px !important;
    cursor: pointer !important;
    border-radius: 8px !important;
    transition: 0.3s !important;
    color: #7f8c8d !important;
    font-weight: 600 !important;
    font-size: 14px !important;
}

#sms-panel-container .segmented-control input {
    display: none !important;
}

#sms-panel-container .segmented-control label.active {
    background: #fff !important;
    color: #42b883 !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05) !important;
}

/* Buttons & Inputs */
#sms-panel-container .manage-btn {
    width: 100% !important;
    padding: 12px !important;
    border: 2px dashed #cbd5e0 !important;
    background: #f8fafc !important;
    border-radius: 8px !important;
    color: #4a5568 !important;
    cursor: pointer !important;
    font-weight: 600 !important;
    transition: 0.2s !important;
}

#sms-panel-container .manage-btn:hover {
    border-color: #42b883 !important;
    color: #42b883 !important;
    background: #f0fff4 !important;
}

#sms-panel-container .sms-textarea {
    width: 100% !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    padding: 15px !important;
    font-family: inherit !important;
    font-size: 15px !important;
    line-height: 1.5 !important;
    outline: none !important;
    transition: 0.3s !important;
}

#sms-panel-container .sms-textarea:focus {
    border-color: #42b883 !important;
    box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1) !important;
}

#sms-panel-container .sms-stats {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 20px !important;
    margin-top: 10px !important;
    font-size: 12px !important;
    color: #94a3b8 !important;
    font-weight: 600 !important;
}

#sms-panel-container .sms-stats span {
    color: #334155 !important;
}

#sms-panel-container .send-btn {
    width: 100% !important;
    margin-top: 20px !important;
    padding: 15px !important;
    background: #42b883 !important;
    color: white !important;
    border: none !important;
    border-radius: 10px !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    cursor: pointer !important;
    transition: 0.5s !important;
    box-shadow: 0 4px 12px rgba(66, 184, 131, 0.2) !important;
}

#sms-panel-container .send-btn:hover:not(:disabled) {
    background: #38a169 !important;
    transform: translateY(-2px) !important;
}

#sms-panel-container .send-btn:disabled {
    background: #d95e4d !important;
    cursor: not-allowed !important;
    box-shadow: none !important;
}

/* Modal Styles */
#sms-panel-container .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(0,0,0,0.4) !important;
    backdrop-filter: blur(4px) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 2000 !important;
}

#sms-panel-container .selection-modal {
    width: 600px !important;
    max-height: 90vh !important;
    display: flex !important;
    flex-direction: column !important;
    padding: 0 !important;
    overflow: hidden !important;
    border-radius: 8px !important;
}

#sms-panel-container .modal-header {
    padding: 20px 25px !important;
    border-bottom: 1px solid #eee !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
}

#sms-panel-container .modal-filters {
    padding: 15px 25px !important;
    background: #f8fafc !important;
    display: flex !important;
    gap: 10px !important;
    border-bottom: 1px solid #eee !important;
}

#sms-panel-container .search-bar {
    position: relative !important;
    flex: 1 !important;
}

#sms-panel-container .search-bar i {
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    color: #94a3b8 !important;
}

#sms-panel-container .search-bar input {
    width: 100% !important;
    padding: 8px 8px 8px 35px !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 6px !important;
    font-size: 13px !important;
}

#sms-panel-container .table-wrapper {
    flex: 1 !important;
    overflow-y: auto !important;
    padding: 0 25px !important;
}

#sms-panel-container .selection-table {
    width: 100% !important;
    border-collapse: collapse !important;
    font-size: 13px !important;
}

#sms-panel-container .selection-table th {
    position: sticky !important;
    top: 0 !important;
    background: #bcccdc !important;
    padding: 12px 10px !important;
    text-align: left !important;
    border: 1px solid #99a3b0 !important;
    color: #181c24 !important;
}

#sms-panel-container .selection-table td {
    padding: 10px !important;
    border: 1px solid #99a3b0 !important;
    cursor: pointer !important;
    font-size: 14px !important;
    font-weight: 600 !important;
}

#sms-panel-container .row-selected {
    background: #f0fff4 !important;
}

#sms-panel-container .modal-footer {
    padding: 15px 25px !important;
    border-top: 1px solid #eee !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    background: #fff !important;
}

#sms-panel-container .apply-btn {
    background: #1e9610 !important;
    color: white !important;
    border: none !important;
    padding: 8px 20px !important;
    border-radius: 6px !important;
    font-weight: 600 !important;
    cursor: pointer !important;
    font-size: 15px !important;
}

#sms-panel-container .info-banner {
    background: #e3f2fd !important;
    color: #1976d2 !important;
    padding: 12px !important;
    border-radius: 8px !important;
    font-size: 13px !important;
    display: flex !important;
    gap: 10px !important;
    align-items: center !important;
}

#sms-panel-container .filter-controls-actions {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 12px !important;
    margin-top: 15px !important;
    padding: 0 15px !important;
}

#sms-panel-container .apply-btn-select, 
#sms-panel-container .apply-btn-disselect {
    font-size: 14px !important;
    font-weight: 600 !important;
    padding: 10px 18px !important;
    border-radius: 8px !important;
    border: none !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    margin-bottom: 10px !important;
}

#sms-panel-container .apply-btn-select {
    background-color: #0a79e7 !important;
    color: #ffffff !important;
}

#sms-panel-container .apply-btn-select:hover {
    background-color: #354554 !important;
    transform: translateY(-1px) !important;
}

#sms-panel-container .apply-btn-disselect {
    background-color: #ff0505 !important;
    color: #ffffff !important;
}

#sms-panel-container .apply-btn-disselect:hover {
    background-color: #bb4f4f !important;
    transform: translateY(-1px) !important;
}

#sms-panel-container .apply-btn-select:active, 
#sms-panel-container .apply-btn-disselect:active {
    transform: translateY(0) !important;
}

#sms-panel-container .clickable-banner {
    cursor: pointer !important;
    background: #e6fffa !important;
    color: #2d3748 !important;
    border: 1px solid #38a169 !important;
}

#sms-panel-container .clickable-banner i {
    color: #38a169 !important;
}

#sms-panel-container .flex-filters {
    display: flex !important;
    gap: 15px !important;
    align-items: center !important;
    width: 100% !important;
}

#sms-panel-container .search-bar-custom {
    flex: 0 0 60% !important;
    position: relative !important;
}

#sms-panel-container .search-bar-custom i {
    position: absolute !important;
    left: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    color: #64748b !important;
    font-size: 14px !important;
}

#sms-panel-container .modal-input-field {
    width: 100% !important;
    padding: 12px 12px 12px 40px !important;
    border: 1px solid #cbd5e0 !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    color: #1e293b !important;
    font-size: 14px !important;
}

#sms-panel-container .select-controls {
    flex: 0 0 40% !important;
}

#sms-panel-container .modal-select-field {
    width: 100% !important;
    padding: 12px !important;
    border: 1px solid #cbd5e0 !important;
    border-radius: 8px !important;
    cursor: pointer !important;
    font-weight: 600 !important;
    color: #1e293b !important;
    font-size: 14px !important;
}

#sms-panel-container .modal-select-field option {
    font-weight: 600 !important;
    font-size: 14px !important;
}

#sms-panel-container .table-action-margin {
    margin-top: 15px !important;
    display: flex !important;
    justify-content: flex-end !important;
    gap: 12px !important;
    margin: 10px !important;
}
</style>