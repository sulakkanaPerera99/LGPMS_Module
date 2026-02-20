<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2'; 

// Projects State
const projects = ref([]);

// Add Form State
const projectName = ref('');
const projectCode = ref('');
const projectNumber = ref('');
const users = ref('');
const searchQuery = ref('');
const sortBy = ref('name_asc');
const currentSabha = ref('');

// Edit Modal State
const showEditModal = ref(false);
const editForm = ref({
  name: '',
  code: '',
  number: '',
  status: 'Active'
});
// ✅ New: මුල් දත්ත තබා ගැනීමට
const originalEditForm = ref({}); 
const editingId = ref(null);

// ✅ Computed Property: දත්ත වෙනස් වී ඇත්දැයි බැලීමට
const isFormChanged = computed(() => {
  return JSON.stringify(editForm.value) !== JSON.stringify(originalEditForm.value);
});

// Load Data
onMounted(async () => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  
  if (userData && (userData.sabha || userData.sabha_code)) {
    currentSabha.value = userData.sabha || userData.sabha_code;
    await fetchProjects(); 
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Session Expired',
      text: 'Please login again.',
      confirmButtonColor: '#d33'
    });
  }
});

// --- Pagination State ---
const currentPage = ref(1);
const itemsPerPage = 10;

// --- Pagination Computed Properties ---
const totalPages = computed(() => {
  return Math.ceil(projects.value.length / itemsPerPage);
});

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return projects.value.slice(start, end);
});

// --- Pagination Methods ---
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

// Watchers
watch([searchQuery, sortBy], () => {
  currentPage.value = 1;
  fetchProjects();
});

let debounceTimer = null;
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchProjects();
  }, 500); 
});

watch(sortBy, () => {
  fetchProjects();
});

// Fetch Projects
const fetchProjects = async () => {
  try {
    const response = await axios.get(`/water-projects/${currentSabha.value}`, {
      params: { search: searchQuery.value, sort: sortBy.value }
    });

    let processedData = response.data.map(project => ({
      ...project,
      users: project.registered_users
    }));

    if (sortBy.value === 'name_asc') {
        processedData.sort((a, b) => {
            if (b.status !== a.status) {
                return b.status - a.status; 
            }
            return a.name.localeCompare(b.name);
        });
    }

    projects.value = processedData;

  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

// --- Add Project Function ---
const addProject = async () => {
  if (projectName.value.trim() && projectCode.value.trim() && projectNumber.value.trim()) {
    
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    
    const payload = {
      name: projectName.value,
      code: projectCode.value,
      number: projectNumber.value,
      sabha_code: currentSabha.value,
      created_by: userData ? userData.id : null
    };

    try {
      const response = await axios.post('/water-projects', payload);
      
      if(response.data.status === "success") {
        projects.value.unshift(response.data.data); 
        
        projectName.value = '';
        projectCode.value = '';
        projectNumber.value = '';
        users.value = '';
        
        Swal.fire({
          icon: 'success',
          title: 'Project Saved!',
          text: 'New water project has been added successfully.',
          timer: 2000, 
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error("Error saving:", error);
      
      let errorMsg = "Failed to save project due to a server error.";
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: errorMsg,
        confirmButtonColor: '#d33'
      });
    }
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Fields',
      text: 'Please fill in all required fields.',
      confirmButtonColor: '#f39c12'
    });
  }
};

// --- Edit Modal Functions ---
const openEditModal = (project) => {
  editingId.value = project.id;
  
  // දත්ත සකසන විට
  const data = {
    name: project.name,
    code: project.code,
    number: project.number,
    status: project.status === 1 ? 'Active' : 'Inactive'
  };

  editForm.value = { ...data };
  // ✅ මුල් දත්ත වෙනම තබා ගනී (සංසන්දනය කිරීමට)
  originalEditForm.value = JSON.parse(JSON.stringify(data));
  
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingId.value = null;
  editForm.value = { name: '', code: '', number: '', status: 'Active' };
  originalEditForm.value = {}; // Reset original data
};

// --- Update Project Function ---
const updateProject = async () => {
  if (editForm.value.name.trim() && editForm.value.code.trim() && String(editForm.value.number).trim()) {
    
    // ✅ 1. Confirmation එකට කලින් Modal එක Close කිරීම
    showEditModal.value = false;

    // ❓ Confirmation Dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to update this project details?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#42b883',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Update it!'
    });

    if (result.isConfirmed) {
      try {
        const userDataString = sessionStorage.getItem('userData');
        if (!userDataString) {
             Swal.fire('Error', 'Session Expired', 'error');
             return;
        }

        const userData = JSON.parse(userDataString);
        const userId = userData.nic; 
        if (!userId) {
            Swal.fire('Error', 'User NIC not found', 'error');
            return;
        }

        const payload = { 
            ...editForm.value, 
            sabha_code: currentSabha.value,
            userId: userId,
            status: editForm.value.status === 'Active' ? 1 : 0
        };

        const response = await axios.put(`/water-projects/${editingId.value}`, payload);
        
        if (response.data.status === "success") {
          // ✅ Success Alert
          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Project details have been updated.',
            timer: 2000,
            showConfirmButton: false
          });

          // Modal එක කලින්ම close කළ නිසා මෙතන closeEditModal() අවශ්‍ය නැත, නමුත් state clear කිරීමට:
          editingId.value = null;
          editForm.value = { name: '', code: '', number: '', status: 'Active' };
          
          fetchProjects(); 
        }
      } catch (error) {
        console.error("Error updating:", error);

        let errorMsg = "Failed to update project.";
        if (error.response && error.response.data) {
            errorMsg = error.response.data.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: errorMsg,
          confirmButtonColor: '#d33'
        });
      }
    } else {
        closeEditModal();
    }
  } else {
    // Validation Error නම් Modal එක වැසිය යුතු නැත, ඒ නිසා මෙය Swal එකට පසුව තබමු
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Data',
      text: 'Please fill in all required fields.',
      confirmButtonColor: '#f39c12'
    });
  }
};
</script>

<template>
  <div id="manage-projects-wrapper" class="manage-projects-container">
    <header class="page-header">
      <h2>Add and Manage Water Projects</h2>
      <router-link to="/officer-dashboard" class="back-link">Back to Dashboard</router-link>
    </header>

    <div class="content-area">
      <div class="card form-card">
        <h4>Add New Project</h4>
        <form @submit.prevent="addProject" class="project-form">
          <div class="form-group">
            <label for="pName">Project Name</label>
            <input id="pName" v-model="projectName" type="text" placeholder="Enter project name" required />
            <p>example : Kandy</p>
          </div>
          
          <div class="form-group">
            <label for="pCode">Project Code</label>
            <input 
                  id="pCode" 
                  v-model="projectCode" 
                  type="text" 
                  placeholder="Enter project code" 
                  required 
                  @input="projectCode = projectCode.toUpperCase()"
                  maxlength="3"/>
            <p>example : KND</p>
          </div>

          <div class="form-group">
            <label for="pNumber">Project Number</label>
            <input id="pNumber" v-model="projectNumber" type="text" placeholder="Enter project number" required />
            <p>example : 12</p>
          </div>

          <button type="submit" class="submit-btn">Add Project</button>
        </form>
      </div>

      <div class="card table-card">
        <h4>Existing Projects</h4>
        <div class="controls-row">
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" v-model="searchQuery" placeholder="Search by project name or code..." class="search-input" />
          </div>
          <div class="sort-wrapper">
            <select v-model="sortBy" class="sort-select">
              <option value="name_asc">Project Name (A-Z)</option>
              <option value="name_desc">Project Name (Z-A)</option>
              <option value="code_asc">Project Code (Asc)</option>
              <option value="code_desc">Project Code (Desc)</option>
              <option value="number_asc">Project Number (Asc)</option>
              <option value="number_desc">Project Number (Desc)</option>
            </select>
          </div>
        </div>
        <table class="project-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Project Code</th>
              <th>Project Number</th>
              <th>Status</th> <th>Users</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in paginatedProjects" :key="project.id">
              <td>{{ project.name }}</td>
              <td>{{ project.code }}</td>
              <td>{{ project.number }}</td>
              <td>
                <span :class="project.status === 1 ? 'status-active' : 'status-inactive'">
                  {{ project.status === 1 ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ project.users }}</td>
              <td>
                <button class="action-btn" @click="openEditModal(project)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination-controls" v-if="projects.length > itemsPerPage">
            <button 
              class="page-btn" 
              @click="prevPage" 
              :disabled="currentPage === 1"
            >
              &laquo; Previous
            </button>
            
            <span class="page-info">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            
            <button 
              class="page-btn" 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
            >
              Next &raquo;
            </button>
        </div>
      </div>
    </div>

    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Edit Project</h4>
        <form @submit.prevent="updateProject" class="edit-form">
          <div class="form-group">
            <label>Project Name</label>
            <input v-model="editForm.name" type="text" required />
          </div>
          <div class="form-group">
            <label>Project Code</label>
            <input v-model="editForm.code" type="text" required />
          </div>
          <div class="form-group">
            <label>Project Number</label>
            <input v-model="editForm.number" type="text" required />
          </div>
          
          <div class="form-group">
            <label>Status</label>
            <select v-model="editForm.status" class="status-select" required>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeEditModal">Cancel</button>
            <button type="submit" class="save-btn" :disabled="!isFormChanged">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
#manage-projects-wrapper .manage-projects-container {
    padding: 20px !important;
    max-width: 1000px !important;
    margin: 40px auto !important;
    font-family: sans-serif !important;
}

#manage-projects-wrapper .page-header {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin: 40px !important;
    border-bottom: 1px solid #e0e0e0 !important;
    padding-bottom: 15px !important;
}

#manage-projects-wrapper .back-link {
    color: #42b883 !important;
    text-decoration: none !important;
    font-weight: bold !important;
    font-size: 14px !important; 
}

#manage-projects-wrapper .content-area {
    display: flex !important;
    flex-direction: column !important;
    gap: 30px !important;
    margin: 30px !important;
}

#manage-projects-wrapper .card {
    background: #ffffff !important;
    border: 1px solid #e0e0e0 !important;
    border-radius: 8px !important;
    padding: 20px !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
}

#manage-projects-wrapper h4 {
    margin-top: 0 !important;
    color: #2c3e50 !important;
    border-bottom: 2px solid #42b883 !important;
    display: inline-block !important;
    padding-bottom: 5px !important;
    margin-bottom: 20px !important;
    font-size: 16px !important; 
}

/* --- Forms & Inputs --- */
#manage-projects-wrapper .project-form {
    display: flex !important;
    gap: 20px !important;
    align-items: flex-end !important;
    flex-wrap: wrap !important;
}

#manage-projects-wrapper .form-group {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    flex: 1 !important;
    min-width: 200px !important;
    font-size: 14px !important;
    padding: 0 !important;
    margin: 0 5px !important; 
}

#manage-projects-wrapper .form-group p {
    padding-left: 7px !important; 
    font-size: 13px !important; 
}

#manage-projects-wrapper label {
    font-weight: 600 !important;
    color: #2c3e50 !important;
    font-size: 13px !important; 
}

#manage-projects-wrapper input,
#manage-projects-wrapper select {
    padding: 10px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    width: 100% !important;
    box-sizing: border-box !important;
}

#manage-projects-wrapper input:focus,
#manage-projects-wrapper select:focus {
    outline: none !important;
    border-color: #42b883 !important;
}

#manage-projects-wrapper .submit-btn {
    background-color: #42b883 !important;
    color: white !important;
    border: none !important;
    padding: 0 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-weight: 600 !important;
    height: 38px !important; 
    font-size: 13px !important; 
}

#manage-projects-wrapper .submit-btn:hover {
    background-color: #3aa876 !important;
}

/* --- Table Styles --- */
#manage-projects-wrapper .project-table {
    width: 100% !important;
    margin: 0 auto !important;
    border-collapse: collapse !important;
    font-size: 13px !important; 
}

#manage-projects-wrapper .project-table th,
#manage-projects-wrapper .project-table td {
    text-align: center !important;
    padding: 12px !important;
    border: 1px solid #4d555c !important; 
    color: #2c3e50 !important;
    font-weight: 600 !important;
}

#manage-projects-wrapper .project-table th {
    background-color: #bcccdc !important;
    font-weight: 600 !important;
}

#manage-projects-wrapper .project-table tbody tr:hover {
    background-color: #f1f8f5 !important;
}

#manage-projects-wrapper .action-btn {
    background: transparent !important;
    border: 1px solid #42b883 !important;
    color: #42b883 !important;
    padding: 6px 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 12px !important; 
}

#manage-projects-wrapper .action-btn:hover {
    background: #42b883 !important;
    color: white !important;
}

/* --- Search & Sort Controls --- */
#manage-projects-wrapper .controls-row {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 20px !important;
    gap: 15px !important;
    flex-wrap: wrap !important;
}

#manage-projects-wrapper .search-wrapper {
    flex: 0.8 !important;
    min-width: 200px !important;
    position: relative !important;
}

#manage-projects-wrapper .sort-wrapper {
    flex: 0.2 !important;
    min-width: 150px !important;
    position: relative !important;
}

#manage-projects-wrapper .search-icon {
    position: absolute !important;
    left: 10px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    font-size: 14px !important; 
    color: #888 !important;
    pointer-events: none !important;
}

#manage-projects-wrapper .search-input {
    width: 100% !important;
    padding: 8px 8px 8px 30px !important; 
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    box-sizing: border-box !important;
}

#manage-projects-wrapper .sort-select {
    width: 100% !important;
    padding: 8px !important;
    border: 1px solid #ccc !important;
    border-radius: 4px !important;
    font-size: 13px !important; 
    background-color: white !important;
    cursor: pointer !important;
}

/* --- Status Styles --- */
#manage-projects-wrapper .status-active {
    color: #27ae60 !important;
    font-weight: bold !important;
}

#manage-projects-wrapper .status-inactive {
    color: #e74c3c !important;
    font-weight: bold !important;
}

#manage-projects-wrapper .status-select {
    background-color: white !important;
}

/* --- Modal Styles --- */
#manage-projects-wrapper .modal-overlay {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    background: rgba(0, 0, 0, 0.5) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 9999 !important; /* Top layer */
    animation: fadeIn 0.3s ease !important;
}

#manage-projects-wrapper .modal-content {
    background: white !important;
    padding: 25px !important;
    border-radius: 12px !important;
    width: 450px !important; 
    max-width: 90% !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
    animation: slideUp 0.3s ease !important;
}

#manage-projects-wrapper .edit-form {
    display: flex !important;
    flex-direction: column !important;
    gap: 15px !important;
}

#manage-projects-wrapper .modal-actions {
    display: flex !important;
    justify-content: flex-end !important;
    gap: 10px !important;
    margin-top: 20px !important;
}

#manage-projects-wrapper .cancel-btn {
    background: #f1f1f1 !important;
    border: 1px solid #ccc !important;
    padding: 8px 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 13px !important; 
}

#manage-projects-wrapper .save-btn {
    background: #42b883 !important;
    color: white !important;
    border: none !important;
    padding: 8px 15px !important;
    border-radius: 4px !important;
    cursor: pointer !important;
    font-size: 13px !important; 
}

#manage-projects-wrapper .pagination-controls {
  display: flex !important;
  justify-content: flex-end !important; 
  align-items: center !important;
  margin-top: 15px !important;
  gap: 15px !important;
  padding: 10px !important;
  font-size: 13px !important;
}

#manage-projects-wrapper .page-btn {
  background-color: #ffffff !important;
  border: 1px solid #ddd !important;
  padding: 6px 12px !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  color: #2c3e50 !important;
  font-weight: bold !important;
  transition: all 0.2s !important;
}

#manage-projects-wrapper .page-btn:hover:not(:disabled) {
  background-color: #42b883 !important;
  color: white !important;
  border-color: #42b883 !important;
}

#manage-projects-wrapper .page-btn:disabled {
  background-color: #f5f5f5 !important;
  color: #aaa !important;
  cursor: not-allowed !important;
}

#manage-projects-wrapper .page-info {
  font-weight: 600 !important;
  color: #2c3e50 !important;
}
#manage-projects-wrapper .save-btn:disabled {
    background-color: #a5d4c0 !important; 
    color: #ffffff !important;
    cursor: not-allowed !important;     
    opacity: 0.9 !important;         
    border: 1px solid #a5d4c0 !important;
}
/* --- Animations --- */
@keyframes fadeIn {
    from { opacity: 0 !important; }
    to { opacity: 1 !important; }
}

@keyframes slideUp {
    from { transform: translateY(20px) !important; opacity: 0 !important; }
    to { transform: translateY(0) !important; opacity: 1 !important; }
}
</style>