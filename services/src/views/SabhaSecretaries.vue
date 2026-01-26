<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />
    <div class="register-container" >
        <div class="register-form-container">
         
            <form id="userRegisterForm" @submit="handleSubmit" novalidate autocomplete="off">
                <div class="heading">
                 <!-- <span>Sabha Admins</span> -->
                 <h3><b>Sabha Secretaries</b></h3>
                </div>

                <div>
                  <p>Inactive employees shown as: <router-link to="" class="fas fa-lock"> </router-link> &nbsp; Active employees shown as: <router-link to="" class="fas fa-lock-open"> </router-link></p>
                  <table class="ttable table-striped table-bordered" >
              <thead>
                  <tr>
                      <th>Index</th>
                      <th>NIC</th>
                      <th>Name</th>
                      <th>Sabha</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>email</th>
                      <th>Inactive</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for=" (b,index) in paginatedData" :key="index">

                        <td>{{ (currentPage - 1) * 10 + index + 1 }}</td>
                      <td>{{ b.emp_nic }}</td>
                      <td>{{ b.emp_name }}</td>
                      <td>{{ b.sb_name_en }}</td>
                      <td>{{ b.emp_contact }}</td>
                      <td>{{ b.emp_address }}</td>
                      <td>{{ b.emp_email }}</td>
                      <td v-if="b.emp_status==0"><router-link to="" @click="inactiveAdmin(b.emp_nic,b.emp_status)"  class="fas fa-lock"> </router-link></td>
                      <td v-else><router-link to="" @click="inactiveAdmin(b.emp_nic,b.emp_status)"   class="fas fa-lock-open"> </router-link></td>
                      
                      <!-- <td><router-link to="" @click="inactiveAdmin(b.emp_nic)"  class="fas fa-trash-alt"> </router-link></td> -->
                  </tr>
              </tbody>
          </table>
          <button class="fas fa-backward" @click="prevPage($event)" :disabled="currentPage === 1"></button>
             <span>{{ currentPage }} / {{ totalPages }}</span>
            <button class="fas fa-forward" @click="nextPage($event)" :disabled="currentPage === totalPages"></button>
              </div>
            </form>
            <!-- table new -->
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapMutations } from "vuex";
import { mapState } from "vuex";
import VueBasicAlert from 'vue-basic-alert'
export default {
    name: "SabhaSecretaries",

    data() {
        return {
           
            matchUser: undefined,
            provinces:[],
            allEmployee:[],
            itemsPerPage: 10,
            currentPage: 1,
        }
    },
    created() {
        
        this.getProvinces()
      
    },
    computed:{
        ...mapState(["user"]),
    paginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Check if this.data is an array before using slice method
    if (Array.isArray(this.allEmployee)) {
      return this.allEmployee.slice(startIndex, endIndex);
    } else {
      // Return empty array or handle loading state
      return [];
    }
  },
  totalPages() {
      return Math.ceil(this.allEmployee.length / this.itemsPerPage);
    },
    },

    methods: {
        ...mapMutations(["setUser"]),

        async getMatchUser(nic) {
            await axios.get('/employee/' + nic);
            // let data = await axios.get('/employee/' + nic);
            //this.matchUser = data.data;
        },
        addZero(num) {

num = num.toString();
    return '19' + num.slice(0, 5) + '0' + num.slice(5, -1);
},
addZeroPadding: function() {
// this.len= this.loginObj.nic.charAt(9).toUpperCase()
// Check if the user input is a valid number
if (!isNaN(parseInt(this.registerObj.nic)) && this.registerObj.nic !== null && (this.registerObj.nic.charAt(9).toUpperCase() === 'V' || this.registerObj.nic.charAt(9).toUpperCase() === 'X')) {

// if (!isNaN(parseInt(this.registerObj.nic)) && this.registerObj.nic !== null && this.registerObj.nic.charAt(9).toUpperCase() === 'V') {
    
    this.paddedNum = this.addZero(this.registerObj.nic);

}else{
    this.paddedNum=parseInt(this.registerObj.nic);
}
return this.paddedNum
},
nextPage(event) {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
        // Prevent default form submission behavior
        event.preventDefault();
        },
        prevPage(event) {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
        // Prevent default form submission behavior
        event.preventDefault();
        },
        async getProvinces() {

            this.provinces = (await axios.get('/provofsabha/' +this.user.emp_pro_code)).data;
            this.allEmployee= (await axios.get('/secrbypro/'+this.user.emp_pro_code)).data;  
        },
        async inactiveAdmin(empnic,upst){
  let result =''
  this.getMatchUser(empnic)
  if(this.matchUser.emp_status==1){
      result = confirm("Confirm Inactivating employee?")
  }
  else{
      this.$refs.alert.showAlert('error', 'Not Permission to activate !')
  }    
      if(result == true){
    
      if(upst == 1){
       
          await axios.put("/inactiveemp/"+empnic,'0' );
          this.$refs.alert.showAlert('success', 'Inactivated !')
      }
      // else{
     
      //     await axios.put("/inactiveemp/"+empnic,'1');
      //     this.$refs.alert.showAlert('success', 'activated !'+upst)
      // }
         
      this.allEmployee= (await axios.get('/secrbypro/'+this.user.emp_pro_code)).data;
         
      }
  },

        scrollToTop() {
            window.scrollTo(0, 0);
        },

    },
    components: {
        VueBasicAlert
    }

};
</script>


<style scoped>
.ttable {
   
   width: 100%;
   border-width:1px;
   border-color : #130f40;
   /* border-style: solid; */
   font-size: 1.5rem;
   /* background-color :white; */
   /* padding-left: 3rem; */
    /* height: 3rem; */
    border-collapse: collapse;
}
th  {
   text-align: center;
}
.ttable, th, td {
border: 1px solid;
text-align: center;
}

.register-container {
    padding: 2rem 2%;
     min-height: 72.3vh;
}

.register-container .register-form-container {
    background: #fff;

}

.register-container .register-form-container form {
    position: relative;
    left: 50%;
    transform: translate(-50%, 0%);
    /* max-width: 70rem; */
    width: 100%;
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
    border: 0.1rem solid rgba(0, 0, 0, 0.2);
    padding: 2rem;
    border-radius: 0.5rem;
    animation: fadeUp 0.4s linear;
}

.register-container .register-form-container form h3 {
    padding-bottom: 1rem;
    font-size: 2rem;
    text-transform: uppercase;
    color: #130f40;
    margin: 0;
}

.register-container .register-form-container form .form-control {
    margin: 0.7rem 0;
    border-radius: 0.5rem;
    background: #f7f7f7;
    /* padding: 2rem 1.2rem; */
    font-size: 1.6rem;
    color: #130f40;
    text-transform: none;
    width: 100%;
    /* border: none; */
    border: margin-bottom; 
}

.register-container .register-form-container form label {
    font-size: 1.5rem;
    margin: 0;
    padding: 0;
}

.register-container .register-form-container form span {
    font-size: 18px;
    padding-left: 5px;
    padding-right: 40px;
    color:#620a0a;
}

.register-container .register-form-container form .btn {
    margin: 1rem 0;
    width: 25%;
    text-align: center;
    background: #620a0a;
}

.register-container .register-form-container form p {
    padding-top: 1rem;
    font-size: 1.5rem;
    color: #666;
    margin: 0;
}

.register-container .register-form-container form p a {
    color: #27ae60;
}

.register-container .register-form-container form p a:hover {
    color: #130f40;
    text-decoration: underline;
}

.register-container .register-form-container form .form-group {
    margin: 0;
}

.register-container .register-form-container form .form-group .error-mess {
    font-size: 1.5rem;
    position: relative;
    color: rgb(243, 47, 47);
    margin: 0;
    padding: 0;
}
</style>
