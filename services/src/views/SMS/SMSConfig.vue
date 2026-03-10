<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const sabhaCode = ref('')
const isSavingConfig = ref(false)
const configForm = ref({
    api_url: 'https://msmsenterpriseapi.mobitel.lk/EnterpriseSMSV3/esmsproxy.php',
    username: '',
    password: '',
    sender_id: ''
})

onMounted(() => {
    const userData = JSON.parse(sessionStorage.getItem('userData'))
    if (userData) {
        sabhaCode.value = userData.sabha || userData.sabha_code || userData.code
        fetchConfig()
    }
})

const fetchConfig = async () => {
    try {
        const response = await axios.get(`/sms/config/${sabhaCode.value}`)
        if (response.data.data) {
            configForm.value = {
                api_url: response.data.data.api_url,
                username: response.data.data.username,
                sender_id: response.data.data.sender_id,
                password: '' 
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
    <div class="page-container" id="SMS-config">
        <header class="page-header">
            <h2>SMS Gateway Configuration</h2>
            <router-link to="/officer-dashboard" class="back-link">Back to SMS Panel</router-link>
        </header>

        <div class="card config-card">
            <h4>Mobitel Enterprise Gateway Details</h4>
            <div class="form-group">
                <label>API URL</label>
                <input type="text" v-model="configForm.api_url" class="form-control" />
            </div>
            <div class="form-group">
                <label>Username</label>
                <input type="text" v-model="configForm.username" class="form-control" />
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" v-model="configForm.password" class="form-control" placeholder="Enter new password to update" />
            </div>
            <div class="form-group">
                <label>Sender ID (Alias)</label>
                <input type="text" v-model="configForm.sender_id" class="form-control" />
            </div>
            
            <div class="actions">
                <button @click="saveConfig" class="save-btn" :disabled="isSavingConfig">
                    {{ isSavingConfig ? 'Saving...' : 'Save Configuration' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
#SMS-config.page-container { 
    padding: 20px !important; 
    padding-top: 70px !important;
    max-width: 600px !important; 
    margin: 0 auto !important; 
}

#SMS-config .page-header { 
    display: flex !important; 
    justify-content: space-between !important; 
    align-items: center !important; 
    margin-bottom: 20px !important; 
    border-bottom: 2px solid #2c3e50 !important; 
    padding-bottom: 10px !important; 
}

#SMS-config .card { 
    background: #fff !important; 
    border: 1px solid #ddd !important; 
    border-radius: 8px !important; 
    padding: 25px !important; 
    box-shadow: 0 4px 6px rgba(0,0,0,0.05) !important; 
}

#SMS-config .form-group { 
    margin-bottom: 20px !important; 
}

#SMS-config .form-group label { 
    display: block !important; 
    margin-bottom: 8px !important; 
    font-weight: bold !important; 
    color: #34495e !important;
    font-size: 14px !important;
}

#SMS-config .form-control { 
    width: 100% !important; 
    padding: 10px !important; 
    border: 1px solid #ccc !important; 
    border-radius: 4px !important; 
    font-size: 16px !important; 
    box-sizing: border-box !important; 
}

#SMS-config .save-btn { 
    background: #42b883 !important; 
    color: white !important; 
    border: none !important; 
    padding: 12px !important; 
    border-radius: 4px !important; 
    width: 100% !important; 
    cursor: pointer !important; 
    font-weight: bold !important; 
    font-size: 16px !important; 
    transition: background 0.3s !important; 
}

#SMS-config .save-btn:hover { 
    background: #33a06f !important; 
}

#SMS-config .back-link { 
    font-size: 14px !important;
    color: #42b883 !important; 
    text-decoration: none !important; 
    font-weight: bold !important; 
}
</style>