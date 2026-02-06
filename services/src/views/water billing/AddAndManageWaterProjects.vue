<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

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
const editingId = ref(null);

// Load Data
onMounted(async () => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  
  if (userData && (userData.sabha || userData.sabha_code)) {
    currentSabha.value = userData.sabha || userData.sabha_code;
    await fetchProjects(); 
  } else {
    alert("Session Error: Please login again.");
  }
});

// --- Pagination State ---
const currentPage = ref(1); // දැනට සිටින පිටුව
const itemsPerPage = 10;    // එක පිටුවක පෙන්වන පේළි ගණන

// --- Pagination Computed Properties ---
import { computed } from 'vue'; // මෙය උඩින්ම import කරන්න

// මුළු පිටු ගණන ගණනය කිරීම
const totalPages = computed(() => {
  return Math.ceil(projects.value.length / itemsPerPage);
});

// වත්මන් පිටුවට අදාළ දත්ත පමණක් තෝරා ගැනීම (Slice කිරීම)
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

// Search කරනකොට හෝ Sort කරනකොට මුල් පිටුවට යන්න ඕන නිසා මෙය Watcher එකට දාන්න
watch([searchQuery, sortBy], () => {
  currentPage.value = 1;
  fetchProjects();
});

// Watchers
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
// Fetch Projects
const fetchProjects = async () => {
  try {
    const response = await axios.get(`/water-projects/${currentSabha.value}`, {
      params: { search: searchQuery.value, sort: sortBy.value }
    });

    // 1. මුලින්ම Backend එකෙන් එන දත්ත ටික සකසා ගන්න (Map Users)
    let processedData = response.data.map(project => ({
      ...project,
      users: project.registered_users
    }));

    // 2. ✅ CUSTOM SORTING LOGIC (Drop down එකේ 'name_asc' තියෙනකොට විතරක් මෙය වැඩ කරයි)
    if (sortBy.value === 'name_asc') {
        processedData.sort((a, b) => {
            // පියවර 1: Status එක බලන්න. (Active=1, Inactive=0)
            // Active (1) ඒවා උඩට ගන්න නම්: b.status - a.status කරන්න.
            if (b.status !== a.status) {
                return b.status - a.status; 
            }
            
            // පියවර 2: Status සමාන නම්, නම අනුව A-Z පිළිවෙලට හදන්න
            return a.name.localeCompare(b.name);
        });
    }

    // 3. සකස් කරගත් දත්ත ටික projects variable එකට දාන්න
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
        
        alert("Project Saved Successfully!");
      }
    } catch (error) {
      console.error("Error saving:", error);
      
      // ✅ Handle Duplicate Error Message
      if (error.response && error.response.data) {
        // Backend එකෙන් එවන message එක කෙලින්ම පෙන්වන්න
        alert("Save Failed: " + error.response.data.message);
      } else {
        alert("Failed to save project due to a server error.");
      }
    }
  } else {
    alert("Please fill in the required fields.");
  }
};

// --- Edit Modal Functions ---

const openEditModal = (project) => {
  editingId.value = project.id;
  
  editForm.value = {
    name: project.name,
    code: project.code,
    number: project.number,
    // ✅ 1 නම් Active, නැත්නම් Inactive ලෙස set කරන්න
    status: project.status === 1 ? 'Active' : 'Inactive'
  };
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editingId.value = null;
  editForm.value = { name: '', code: '', number: '', status: 'Active' };
};

// --- Update Project Function ---
const updateProject = async () => {
  if (editForm.value.name.trim() && editForm.value.code.trim() && String(editForm.value.number).trim()) {
    
    if (confirm("Are you sure you want to update this project?")) {
      try {
        const userDataString = sessionStorage.getItem('userData');
        if (!userDataString) return alert("Session Expired.");

        const userData = JSON.parse(userDataString);
        const userId = userData.nic; 
        if (!userId) return alert("User NIC not found.");

        const payload = { 
            ...editForm.value, 
            sabha_code: currentSabha.value,
            userId: userId,
            status: editForm.value.status === 'Active' ? 1 : 0
        };

        const response = await axios.put(`/water-projects/${editingId.value}`, payload);
        
        if (response.data.status === "success") {
          alert("Project Updated Successfully!");
          closeEditModal();
          fetchProjects(); 
        }
      } catch (error) {
        console.error("Error updating:", error);

        // ✅ Handle Duplicate Error Message for Updates
        if (error.response && error.response.data) {
            // Backend එකෙන් එවන message එක කෙලින්ම පෙන්වන්න
            alert("Update Failed: " + error.response.data.message);
        } else {
            alert("Failed to update project due to a server error.");
        }
      }
    }
  } else {
    alert("Please fill in all required fields.");
  }
};
</script>

<template>
  <div class="manage-projects-container">
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
          </div>
          
          <div class="form-group">
            <label for="pCode">Project Code</label>
            <input id="pCode" v-model="projectCode" type="text" placeholder="Enter project code" required />
          </div>

          <div class="form-group">
            <label for="pNumber">Project Number</label>
            <input id="pNumber" v-model="projectNumber" type="text" placeholder="Enter project number" required />
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
            <button type="submit" class="save-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* --- Page Layout --- */
.manage-projects-container {
    padding: 20px;
    max-width: 1000px;
    margin: 0 auto;
    font-family: sans-serif;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 15px;
}

.back-link {
    color: #42b883;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px; /* Increased from default */
}

.content-area {
    display: flex;
    flex-direction: column;
    gap: 30px;
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
    margin-bottom: 20px;
    font-size: 16px; /* Increased */
}

/* --- Forms & Inputs --- */
.project-form {
    display: flex;
    gap: 20px;
    align-items: flex-end;
    flex-wrap: wrap;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 200px;
    font-size: 14px; /* Increased from 7px/12px */
}

label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 13px; /* Increased */
}

input,
select {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px; /* Increased from 7px */
    width: 100%;
    box-sizing: border-box;
}

input:focus,
select:focus {
    outline: none;
    border-color: #42b883;
}

.submit-btn {
    background-color: #42b883;
    color: white;
    border: none;
    padding: 0 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    height: 38px; /* Slightly taller */
    font-size: 13px; /* Increased */
}

.submit-btn:hover {
    background-color: #3aa876;
}

/* --- Table Styles --- */
.project-table {
    width: 100%;
    margin: 0 auto;
    border-collapse: collapse;
    font-size: 13px; /* Increased from 7px */
}

.project-table th,
.project-table td {
    text-align: center;
    padding: 12px;
    border-bottom: 1px solid #eee;
    color: #2c3e50;
}

.project-table th {
    background-color: #f8f9fa;
    font-weight: 600;
}

.action-btn {
    background: transparent;
    border: 1px solid #42b883;
    color: #42b883;
    padding: 6px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px; /* Increased from 7px/11px */
}

.action-btn:hover {
    background: #42b883;
    color: white;
}

/* --- Search & Sort Controls --- */
.controls-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
    flex-wrap: wrap;
}

.search-wrapper,
.sort-wrapper {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.search-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px; /* Increased */
    color: #888;
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 8px 8px 8px 30px; /* Adjusted padding for larger icon */
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px; /* Increased from 7px */
    box-sizing: border-box;
}

.sort-select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px; /* Increased from 7px */
    background-color: white;
    cursor: pointer;
}

/* --- Status Styles --- */
.status-active {
    color: #27ae60;
    font-weight: bold;
}

.status-inactive {
    color: #e74c3c;
    font-weight: bold;
}

.status-select {
    background-color: white;
}

/* --- Modal Styles --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    padding: 25px;
    border-radius: 12px;
    width: 450px; /* Slightly wider */
    max-width: 90%;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    animation: slideUp 0.3s ease;
}

.edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.cancel-btn {
    background: #f1f1f1;
    border: 1px solid #ccc;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px; /* Increased */
}

.save-btn {
    background: #42b883;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px; /* Increased */
}

.pagination-controls {
  display: flex;
  justify-content: flex-end; /* දකුණු පැත්තට ගන්න */
  align-items: center;
  margin-top: 15px;
  gap: 15px;
  padding: 10px;
  font-size: 13px;
}

.page-btn {
  background-color: #ffffff;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  color: #2c3e50;
  font-weight: bold;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background-color: #42b883;
  color: white;
  border-color: #42b883;
}

.page-btn:disabled {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

.page-info {
  font-weight: 600;
  color: #2c3e50;
}

/* --- Animations --- */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>