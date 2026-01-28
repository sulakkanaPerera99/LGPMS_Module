<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

// Projects තියාගන්න Array එක
const projects = ref([]);

const projectName = ref('');
const projectCode = ref('');
const projectNumber = ref(''); // 1. අලුත් variable එක
const users = ref('');
const searchQuery = ref('');
const sortBy = ref('name_asc');
const currentSabha = ref('');

// Page එක Load වෙනකොටම Data ටික Backend එකෙන් ගන්නවා
onMounted(async () => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  
  if (userData && (userData.sabha || userData.sabha_code)) {
    // Session එකෙන් Sabha Code එක ගන්නවා
    currentSabha.value = userData.sabha || userData.sabha_code;
    await fetchProjects(); 
  } else {
    alert("Session Error: Please login again.");
  }
});

// Debounce Timer
let debounceTimer = null;

// Watchers
watch(searchQuery, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchProjects();
  }, 500); 
});

watch(sortBy, () => {
  fetchProjects();
});

// Projects ගෙන්වා ගන්නා Function එක
const fetchProjects = async () => {
  try {
    const response = await axios.get(`/water-projects/${currentSabha.value}`, {
      params: { search: searchQuery.value, sort: sortBy.value }
    });
    projects.value = response.data.map(project => ({
      ...project,
      users: project.registered_users
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};

// අලුත් Project එකක් Add කරන Function එක
const addProject = async () => {
  // 2. Validation එකට projectNumber එකත් එකතු කළා
  if (projectName.value.trim() && projectCode.value.trim() && projectNumber.value.trim()) {
    
    const payload = {
      name: projectName.value,
      code: projectCode.value,
      number: projectNumber.value, // 3. Backend එකට 'number' නමින් යවනවා
      sabha_code: currentSabha.value
    };

    try {
      const response = await axios.post('/water-projects', payload);
      
      if(response.data.status === "success") {
        projects.value.unshift(response.data.data); 
        
        // Form එක හිස් කරනවා
        projectName.value = '';
        projectCode.value = '';
        projectNumber.value = ''; // 4. Reset කරනවා
        users.value = '';
        
        alert("Project Saved Successfully!");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save project.");
    }
  } else {
    alert("Please fill in the required fields.");
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
              <th>Users</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in projects" :key="project.id">
              <td>{{ project.name }}</td>
              <td>{{ project.code }}</td>
              <td>{{ project.number }}</td>
              <td>{{ project.users }}</td>
              <td>
                <button class="action-btn">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
}

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
  font-size: 7px;
}

label {
  font-weight: 600;
  color: #2c3e50;
}

input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px;
}

input:focus {
  outline: none;
  border-color: #42b883;
}

.submit-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 8px 10px 10px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  height: 30px;
}

.submit-btn:hover {
  background-color: #3aa876;
}

.project-table {
  width: 90%;
  margin: 0 auto;
  border-collapse: collapse;
  font-size: 7px;
}

.project-table th,
.project-table td {
  text-align: center;
  padding: 12px;
  border-bottom: 1px solid #ffffff;
  color: #2c3e50;
}

.project-table th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

.action-btn {
  background: transparent;
  border: 1px solid #42b883;
  color: #42b883;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 7px;
}

.action-btn:hover {
  background: #42b883;
  color: white;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #888;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 6px 6px 6px 25px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  box-sizing: border-box;
}

.sort-select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 7px; /* Strict Requirement */
  background-color: white;
  cursor: pointer;
}
</style>