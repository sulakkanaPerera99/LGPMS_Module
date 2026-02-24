<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

// --- State ---
const sabhaCode = ref('')
const message = ref('')
const recipientType = ref('ALL') 
const customers = ref([])
const selectedCustomerIds = ref([])
const isSending = ref(false)
const isLoadingCustomers = ref(false)

// --- Settings Modal State ---
const showConfigModal = ref(false)
const configForm = ref({
    api_url: 'https://msmsenterpriseapi.mobitel.lk/EnterpriseSMSV3/esmsproxy.php',
    username: '',
    password: '',
    sender_id: ''
})
const isSavingConfig = ref(false)

// Character count
const charCount = computed(() => message.value.length)
const smsParts = computed(() => Math.ceil(message.value.length / 160) || 1)

onMounted(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData) {
        sabhaCode.value = userData.sabha || userData.sabha_code || userData.code
        fetchCustomers()
    }
})

// Fetch Customers
const fetchCustomers = async () => {
    isLoadingCustomers.value = true
    try {
        const response = await axios.get(`/water-customers/${sabhaCode.value}`)
        customers.value = response.data
    } catch (error) {
        console.error("Error loading customers:", error)
    } finally {
        isLoadingCustomers.value = false
    }
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

// --- CONFIGURATION LOGIC ---
const openConfigModal = async () => {
    showConfigModal.value = true
    try {
        // Load existing config
        const response = await axios.get(`/sms/config/${sabhaCode.value}`)
        if (response.data.data) {
            configForm.value = {
                api_url: response.data.data.api_url,
                username: response.data.data.username,
                sender_id: response.data.data.sender_id,
                password: '' // Don't show password for security
            }
        }
    } catch (error) {
        console.error("Error fetching config:", error)
    }
}

const saveConfig = async () => {
    if (!configForm.value.username || !configForm.value.sender_id) {
        Swal.fire('Error', 'Username and Sender ID are required.', 'error')
        return
    }

    isSavingConfig.value = true
    try {
        const payload = {
            sabha_code: sabhaCode.value,
            ...configForm.value
        }
        const response = await axios.post('/sms/config', payload)
        if (response.data.status === 'success') {
            Swal.fire('Saved!', 'Gateway configuration updated successfully.', 'success')
            showConfigModal.value = false
        }
    } catch (error) {
        console.error("Save Config Error:", error)
        Swal.fire('Error', 'Failed to save configuration.', 'error')
    } finally {
        isSavingConfig.value = false
    }
}
</script>

<template>
    <div id="sms-panel-container" class="page-container">
        <header class="page-header">
            <h2>SMS Announcement Panel</h2>
            <div class="header-actions">
                <button @click="openConfigModal" class="config-btn">⚙️ Gateway Settings</button>
                <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
            </div>
        </header>

        <div class="content-area">
            <div class="card mb-4">
                <h4>1. Select Recipients</h4>
                <div class="radio-group">
                    <label class="radio-item">
                        <input type="radio" value="ALL" v-model="recipientType"> 
                        All Active Customers ({{ customers.length }})
                    </label>
                    <label class="radio-item">
                        <input type="radio" value="SPECIFIC" v-model="recipientType"> 
                        Specific Customers
                    </label>
                </div>

                <div v-if="recipientType === 'SPECIFIC'" class="customer-selector">
                    <div class="scroll-box">
                        <div v-for="c in customers" :key="c.id" class="check-item">
                            <input type="checkbox" :value="c.id" v-model="selectedCustomerIds" :id="'cust-'+c.id">
                            <label :for="'cust-'+c.id">{{ c.newBillNumber }} - {{ c.fullName }}</label>
                        </div>
                    </div>
                    <p class="selection-count">Selected: {{ selectedCustomerIds.length }}</p>
                </div>
            </div>

            <div class="card">
                <h4>2. Compose Message</h4>
                <div class="form-group">
                    <textarea v-model="message" rows="6" class="sms-textarea" placeholder="Type your announcement here..."></textarea>
                    <div class="sms-info">
                        <span>Characters: <strong>{{ charCount }}</strong></span>
                        <span>Parts: <strong>{{ smsParts }}</strong></span>
                    </div>
                </div>
                <button @click="sendBulkSMS" class="send-btn" :disabled="isSending || !message.trim()">
                    <span v-if="isSending">Sending...</span>
                    <span v-else>🚀 Broadcast Message</span>
                </button>
            </div>
        </div>

        <div v-if="showConfigModal" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h4>SMS Gateway Setup (Mobitel)</h4>
                    <button @click="showConfigModal = false" class="close-btn">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>API URL</label>
                        <input type="text" v-model="configForm.api_url" class="form-control" />
                    </div>
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" v-model="configForm.username" class="form-control" placeholder="Mobitel Username" />
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" v-model="configForm.password" class="form-control" placeholder="Leave empty to keep current password" />
                    </div>
                    <div class="form-group">
                        <label>Sender ID (Alias)</label>
                        <input type="text" v-model="configForm.sender_id" class="form-control" placeholder="e.g. PRADESHIYA" />
                    </div>
                    <button @click="saveConfig" class="save-btn" :disabled="isSavingConfig">
                        {{ isSavingConfig ? 'Saving...' : 'Save Configuration' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.page-container { padding: 20px; max-width: 900px; margin: 0 auto; font-family: sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #42b883; padding-bottom: 10px; }
.header-actions { display: flex; gap: 15px; align-items: center; }

.card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 20px; }
h4 { margin: 0 0 15px 0; color: #2c3e50; }

.radio-group { display: flex; gap: 20px; margin-bottom: 15px; }
.radio-item { cursor: pointer; font-weight: 600; }

.scroll-box { max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; background: #f9f9f9; border-radius: 4px; }
.check-item { display: flex; gap: 10px; padding: 5px 0; font-size: 13px; }

.sms-textarea { width: 100%; padding: 10px; border: 2px solid #eee; border-radius: 6px; resize: none; }
.sms-info { display: flex; justify-content: flex-end; gap: 15px; font-size: 12px; color: #666; margin-top: 5px; }

.send-btn { background: #42b883; color: white; border: none; padding: 12px; border-radius: 6px; width: 100%; font-weight: bold; cursor: pointer; margin-top: 15px; }
.config-btn { background: #2c3e50; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; }
.back-link { color: #42b883; text-decoration: none; font-weight: bold; }

/* Modal Styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; padding: 25px; border-radius: 8px; width: 400px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.form-group { margin-bottom: 15px; }
.form-group label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px; }
.form-control { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
.save-btn { background: #42b883; color: white; border: none; padding: 10px; border-radius: 4px; width: 100%; cursor: pointer; font-weight: bold; }
</style>