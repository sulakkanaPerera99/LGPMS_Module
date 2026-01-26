<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />
    <div class="register-container" >
        <div class="register-form-container">
            <form id="userRegisterForm" @submit="handleSubmit" novalidate autocomplete="off">
                <div class="heading">
                 <h3><b>Create New User account</b></h3>
                </div>
                <div class="row">
                <div class="form-group col-md-4">
                    <label for="uPhone">User NIC:
                    </label>
                    <input type="nic" name="uNic" placeholder="Ex: 123456789v / 123456789123"  id="uNic"
                        class="form-control" v-model="registerObj.nic" />
                    <p class="error-mess" v-if="errorObj.nicErr.length > 0">{{ errorObj.nicErr[0] }}</p>
                </div>

                <div class="form-group col-md-4">
                    <label for="uName">Name:
                    </label>
                    <input type="text" name="uName" placeholder="Ex: ABB Perera" id="uName" class="form-control"
                        v-model="registerObj.name" />
                    <p class="error-mess" v-if="errorObj.nameErr.length > 0">{{ errorObj.nameErr[0] }}</p>
                </div>
               
                <div class="form-group col-md-4">
                    <label for="uPhone">User phone number:
                    </label>
                    <input type="tel" name="uPhone" placeholder="Ex: 0712222222" id="uPhone"
                        class="form-control" v-model="registerObj.phone" />
                    <p class="error-mess" v-if="errorObj.phoneErr.length > 0">{{ errorObj.phoneErr[0] }}</p>
                </div>
            </div>
            <div class="row">
                <div class="form-group col-md-4">
                    <label for="uAddress">User Address:
                    </label>
                    <input type="text" name="uAddress" placeholder="Ex: No 1,King's street,Matale" id="uAddress"
                        class="form-control" v-model="registerObj.address" />
                    <p class="error-mess" v-if="errorObj.addressErr.length > 0">{{ errorObj.addressErr[0] }}</p>
                </div>
           
                <div class="form-group col-md-4">
                    <label for="uEmail">User email:
                    </label>
                    <input type="email" name="uEmail" placeholder="Ex: example@gmail.com" id="uEmail" class="form-control"
                        v-model="registerObj.email" />
                    <p class="error-mess" v-if="errorObj.emailErr.length > 0">{{ errorObj.emailErr[0] }}</p>
                </div>
                
                <!-- <div class="form-group">
                    <label for="uPrsCode">Sabha Code:
                    </label>
                    <input type="text" name="uPrsCode" placeholder="sabha code" id="uPrsCode" class="form-control"
                        v-model="registerObj.PrsCode" />
                    <p class="error-mess" v-if="errorObj.PrsCodeErr.length > 0">{{ errorObj.PrsCodeErr[0] }}</p>
                </div> -->
                <div class="form-group col-md-4">
                    <label for="uLevel">User Level:
                    </label>
                    <div><select v-model="registerObj.level" id="iHead" class="form-control" >
                            <option value="" selected disabled>
                                 Choose
                             </option>
                            <option v-for="level in userlevels" :key="level.levei_id  " id="id"  
                            v-bind:value =level.levei_id  >
                            
                               {{ level.level_des }}
                            </option>
                        </select>
                     </div> 
                    <p class="error-mess" v-if="errorObj.levelErr.length > 0">{{ errorObj.levelErr[0] }}</p>
                </div>
                
            </div>
            <div class="row">
                <div class="form-group col-md-4">
                    <label for="uPass">User password:
                    </label>
                    <input type="password" name="uPass" placeholder="Ex: asdf@123" id="uPass"
                        class="form-control" v-model="registerObj.pass" />
                    <p class="error-mess" v-if="errorObj.passErr.length > 0">{{ errorObj.passErr[0] }}</p>
                </div>
                <div class="form-group col-md-4">
                    <label for="uPassConfirm">Enter password again:
                    </label>
                    <input type="password" name="uPassConfirm" id="uPassConfirm"
                        class="form-control" v-model="registerObj.confirm" />
                    <p class="error-mess" v-if="errorObj.confirmErr.length > 0">{{ errorObj.confirmErr[0] }}</p>
                </div>
                <p style="color: crimson;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*Please avoid including the "#" character when creating passwords</p>
                
            </div>
                <div class="form-group">
                    <input type="submit" value="Register" class="btn" />
                  
                </div>
            </form>
        </div>
    </div>
    <!-- table -->
    <div class="admin-container">
        
        <!-- <div class="heading">
            <span>Office Employees</span>
            <h4><b>කාර්යාලීය නිලධාරීන්</b></h4>
        </div> -->
        <div class="table-responsive">
            <!-- PROJECT TABLE -->
            <table class="ttable" >
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>NIC</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Address</th>
                        <th>email</th>
                        <th>User Level</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for=" (b,index) in paginatedData" :key="index">

                        <td>{{ (currentPage - 1) * 10 + index + 1 }}</td>
                        <td>{{ b.emp_nic }}</td>
                        <td>{{ b.emp_name }}</td>
                        <td>{{ b.emp_contact }}</td>
                        <td>{{ b.emp_address }}</td>
                        <td>{{ b.emp_email }}</td>
                        <td>{{ b.user_level === 7 ? 'subject' : 
                                b.user_level === 8 ? 'FR' : 
                                b.user_level === 6 ? 'Cashier' :
                                b.user_level === 9 ? 'Cheque Writer' : 
                                b.user_level }}</td> 
                        <td><router-link to="" @click="openPopup(b.emp_nic)"  class="fas fa-edit" style="color: darkgreen;"> </router-link></td>
                        <td><router-link to="" @click="deleteemp(b.emp_nic)"  class="fas fa-trash-alt" style="color: darkgreen;"> </router-link></td>
                    </tr>
                </tbody>
            </table>
            <button class="fas fa-backward" @click="prevPage($event)" :disabled="currentPage === 1"></button>
             <span>{{ currentPage }} / {{ totalPages }}</span>
            <button class="fas fa-forward" @click="nextPage($event)" :disabled="currentPage === totalPages"></button>
        </div>
    </div>
     <!-- popup edit -->
     <div class="modal" v-if="showPopup">
      <div class="modal-content" ref="modalRef">
        <button class="close-x" @click="closePopup"> X</button>
        <div class="modal-header">
          <h1>Edit Employee</h1>
        </div>
        <div class="modal-body">
            <div class="row">
                <div class="model-group">
                   <label for="sTaxNic"><b>Employee NIC:</b>
                   </label>
                   <input type="text" name="sTaxNic"  id="sTaxNic" class="form-control" 
                   v-model="popObj.empNic" readonly/>
               </div>
               <div class="model-group">
                   <label for="scusName"><b>Employee Name:</b>
                   </label>
                   <input type="text" name="scusName"  id="scusName" class="form-control" 
                   v-model="popObj.cName"/>
                   <p class="error-mess" v-if="errorObject.nameErr.length > 0">{{ errorObject.nameErr[0] }}</p>
                </div>  
                  <div class="model-group">
                   <label for="scusCon"><b>Employee Contact:</b>
                   </label>
                   <input type="text" name="scusCon"  id="scusCon" class="form-control" 
                   v-model="popObj.cContact"/>
                   <p class="error-mess" v-if="errorObject.conErr.length > 0">{{ errorObject.conErr[0] }}</p>
               </div>
               </div>
               <div class="row">
               <div class="model-group">
                   <label for="scusAddr"><b>Employee Address:</b>
                   </label>
                   <input type="text" name="scusAddr"  id="scusAddr" class="form-control" 
                   v-model="popObj.caddress"/>
                   <p class="error-mess" v-if="errorObject.addrErr.length > 0">{{ errorObject.addrErr[0] }}</p>
               </div>
               <div class="model-group">
                   <label for="scusCon"><b>Employee Email:</b>
                   </label>
                   <input type="text" name="scusEm"  id="scusEm" class="form-control" 
                   v-model="popObj.cEmail"/>
                   <p class="error-mess" v-if="errorObject.emErr.length > 0">{{ errorObject.emErr[0] }}</p>
               </div>
               <div class="model-group">
                   <label for="scusCon"><b>Employee Type:</b>
                   </label>
                   <select name="scusTy"  id="scusTy" class="form-control" 
                   v-model="popObj.cType">
                   <option value="" selected disabled>
                                 Choose
                    </option>
                            <option v-for="level in userlevels" :key="level.levei_id  " id="id"  
                            v-bind:value =level.levei_id>
                            
                              {{ level.level_des }}
                            </option>
                            </select>
                   <p class="error-mess" v-if="errorObject.tyErr.length > 0">{{ errorObject.tyErr[0] }}</p>
               </div>
            </div>
        </div>

        <div class="modal-footer">

          <button class="close-button" @click="closePopup">Close</button>
          <button class="save-button" @click="saveModal">Update</button>
        </div>

      </div>
    </div>
</template>

<script>
import axios from 'axios';
import { mapMutations } from "vuex";
import { mapState } from "vuex";
import VueBasicAlert from 'vue-basic-alert'
export default {
    name: "UserRegister",

    data() {
        return {
            registerObj: { nic:"", name: "", phone: "", address:"",  email: "", PrsCode:"", pass: "", confirm: "", status:"", level:""  },
            errorObj: { nicErr:[], nameErr: [], phoneErr: [], addressErr:[],  emailErr: [], PrsCodeErr:[], passErr: [], confirmErr: [], statusErr:[0], levelErr:[]  },
            matchUser: undefined,
            userlevels:[],
            allEmployee: [],
            itemsPerPage: 10,
            currentPage: 1,
            popObj:{empNic:"",cName:"",cContact:"",caddress:"",cType:"",cEmail:""},
            errorObject:{nameErr:[],conErr:[],addrErr:[],tyErr:[],emErr:[]},
            showPopup:false,
            selectedEmp:'',
            empSelected:[],
        }
    },
    created() {
        
        this.getAllLevels(),
        this.getAllUser()
      
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
        async getAllLevels() {
            let id =5;
             this.userlevels = (await axios.get('/userlevels/' +id )).data;
          
        },
        async getAllUser() {
        
        this.allEmployee= (await axios.get('/graterdanfive/' +this.user.emp_prs_code)).data;
     
   },
   async deleteemp(eid){
        let result = confirm("Confirm delete?")
        if(result == true){

            await axios.delete("/deleteemp/"+eid );
            this.$refs.alert.showAlert('success', 'Employee Deleted!')
            this.allEmployee= (await axios.get('/graterdanfive/' +this.user.emp_prs_code)).data;
        }
        
       },

        scrollToTop() {
            window.scrollTo(0, 0);
        },
                addZero(num) {

        num = num.toString();
            return '19' + num.slice(0, 5) + '0' + num.slice(5, -1);
        },
        addZeroPadding: function() {
        this.len= this.registerObj.nic.charAt(9).toUpperCase()
        // Check if the user input is a valid number
        if (!isNaN(parseInt(this.registerObj.nic)) && this.registerObj.nic !== null && (this.registerObj.nic.charAt(9).toUpperCase() === 'V' || this.registerObj.nic.charAt(9).toUpperCase() === 'X')) {
            
            this.paddedNum = this.addZero(this.registerObj.nic);
        
        }else{
            this.paddedNum=parseInt(this.registerObj.nic);
        }
        return this.paddedNum
        },
        async openPopup(id) {
            this.showPopup = true;
            document.addEventListener('mouseup', this.closeModalOnClickOutside);
            this.empSelected= (await axios.get('/employee/'+id)).data;
            if( this.empSelected){
            this.popObj.empNic= this.empSelected.emp_nic;
            this.popObj.cName =this.empSelected.emp_name;
            this.popObj.cContact =this.empSelected.emp_contact;
            this.popObj.caddress=this.empSelected.emp_address;
            this.popObj.cEmail=this.empSelected.emp_email;
            // this.popObj.cType=this.empSelected.User_level;
            this. selectedEmp=id;
            }
        },
        closePopup() {
            this.showPopup = false;
            document.removeEventListener('mouseup', this.closeModalOnClickOutside);
        },
// -------------popoup save functions 
        resetCheckPopErr: function () {
            this.errorObject.nameErr = [];
            this.errorObject.conErr = [];
            this.errorObject.addrErr = [];    
            // this.errorObject.emErr = [];
            this.errorObject.tyErr = [];
          
        },
        checkPopEmptyErr: function () {
            for (var typeErr in this.errorObject) {
                if (this.errorObject[typeErr].length != 0) {
                    return false;
                }
            }
            return true;
        },
        checkPopup: function () {
            this.resetCheckPopErr();

            if (!this.popObj.cName) {
                this.errorObject.nameErr.push("Name is required");
            }

            if (!this.popObj.cContact){
                this.errorObject.conErr.push("Contact number is required");
            }
            if (!this.popObj.caddress){
                this.errorObject.addrErr.push("Address is required");
            }
            if (!this.popObj.cType){
                this.errorObject.tyErr.push("User Level is required");
            }
        },
        async saveModal(s){
            this.checkPopup();

            if (!this.checkPopEmptyErr()) {
                s.preventDefault();
            }else{
                let popdata ={
                    emp_name : this.popObj.cName,
                    emp_contact : this.popObj.cContact,
                    emp_address : this.popObj.caddress,
                    emp_email: this.popObj.cEmail,
                    user_level:this.popObj.cType
                }
                await axios.put("/adminupemp/"+this.selectedEmp,popdata)
                this.$refs.alert.showAlert('success', 'Employee details updated Successfully !')
                this.allEmployee= (await axios.get('/graterdanfive/' +this.user.emp_prs_code)).data;
                this.closePopup();
               this.popObj.cName=""
                    this.popObj.cContact=""
                    this.popObj.caddress=""
                    this.popObj.cEmail=""
                    this.popObj.cType=""
            }
        },
// -------------end of popup save
        // availableTime: function () {
        //     var now = new Date();
        //     var day = ("0" + now.getDate()).slice(-2);
        //     var currentMonth = ("0" + (now.getMonth() + 1)).slice(-2);
        //     var minRange = (now.getFullYear() - 150) + "-" + currentMonth + "-" + day;
        //     var maxRange = now.getFullYear() + "-" + currentMonth + "-" + day;

        //     document.getElementById("uBirth").setAttribute("min", minRange);
        //     document.getElementById("uBirth").setAttribute("max", maxRange);
        // },

        resetCheckErr: function () {
            this.errorObj.nicErr = [];
            this.errorObj.nameErr = [];
            this.errorObj.phoneErr = [];
            this.errorObj.addressErr =[];
            this.errorObj.emailErr = [];
            this.errorObj.PrsCodeErr =[];
            this.errorObj.passErr = [];
            this.errorObj.confirmErr = [];
            this.errorObj.statusErr = [];
            this.errorObj.levelErr = [];
        },

        checkEmptyErr: function () {
            for (var typeErr in this.errorObj) {
                if (this.errorObj[typeErr].length != 0) {
                    return false;
                }
            }
            return true;
        },

        checkForm: function () {
            this.resetCheckErr();

            // Name validate
            if (!this.registerObj.name) {
                this.errorObj.nameErr.push("Entering a name is required");
            }
            else {
                if (!/^[A-Za-z]+$/.test(this.registerObj.name.replace(/\s/g, ""))) {
                    this.errorObj.nameErr.push('A name can only contain letters');
                }
            }
            // NIC validate

            if (!this.registerObj.nic) {
                this.errorObj.nicErr.push('Entering NIC number is required');
                }else {
                    // if (this.registerObj.nic.length !==12)
                    // {
                    //     if((this.registerObj.nic.charAt(9).toUpperCase() !== 'V') || (this.registerObj.nic.charAt(9).toLowerCase() !== 'v'))
                    //       {
                    //           this.errorObj.nicErr.push('Please Enter Correct Nic Number');
                    //       }
                          
                    // }
                    if ( this.registerObj.nic.length !== 12 &&
                            !(
                                this.registerObj.nic.charAt(9).toUpperCase() === 'V' ||
                                this.registerObj.nic.charAt(9).toLowerCase() === 'v' ||
                                this.registerObj.nic.charAt(9).toUpperCase() === 'X' ||
                                this.registerObj.nic.charAt(9).toLowerCase() === 'x'
                            )
                        ) {
                            this.errorObj.nicErr.push('Please Enter Correct Nic Number');
                        }
            }

            // Email validate
            if (!this.registerObj.email) {
                this.errorObj.emailErr.push("Entering a email is required");
            }
            else {
                if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(this.registerObj.email)) {
                    this.errorObj.emailErr.push('Email must be valid');
                }
            }
            if(!this.registerObj.level){
                this.errorObj.levelErr.push('User level is required')
            }

            // Pass validate
            if (!this.registerObj.pass) {
                this.errorObj.passErr.push('Password is required');
            }
            else {
                if (!/[!@#$%^&*]/.test(this.registerObj.pass)) {
                    this.errorObj.passErr.push('Password must contain at least 1 special character');
                }

                if (this.registerObj.pass.length < 8) {
                    this.errorObj.passErr.push('Password must be more than or equal 8 characters');
                }
            }

            // Confirm Pass validate
            if (!this.registerObj.confirm) {
                this.errorObj.confirmErr.push('Confirm password is required');
            }
            else {
                if (this.registerObj.pass !== this.registerObj.confirm) {
                    this.errorObj.confirmErr.push('Confirm password must be match with password');
                }
            }
            // Phone validate
            if (!this.registerObj.phone) {
                this.errorObj.phoneErr.push('Entering phone number is required');
            }
            else{
                if(!/[0-9]{10}/.test(this.registerObj.phone)) {
                this.errorObj.phoneErr.push('Phone numbers should contain 10 Digits, no spaces allowed');
                }
            }
        },

        async handleSubmit(e) {
            this.checkForm();

            if (!this.checkEmptyErr()) {
                e.preventDefault();
            } else {
                e.preventDefault();
                await this.getMatchUser(this.registerObj.nic);
                if (this.matchUser) {
                    this.errorObj.nicErr.push("NIC already exist")
                }
                else {
                    let Nic12 = this.addZeroPadding();
                    let data = {
                        emp_nic: Nic12,
                        emp_name: this.registerObj.name,
                        emp_contact: this.registerObj.phone,
                        emp_address: this.registerObj.address,
                        emp_email: this.registerObj.email,
                        // emp_prs_code: this.registerObj.PrsCode,
                        emp_prs_code: this.user.emp_prs_code,
                        emp_password: this.registerObj.pass,
                        user_level: this.registerObj.level,
                    }
                    await axios.post("/employee/", data);
                    this.$refs.alert.showAlert('success', 'Successfully Registered !')
                    // document.getElementById("userRegisterForm").reset();
                    this.allEmployee= (await axios.get('/graterdanfive/' +this.user.emp_prs_code)).data;
                    this.registerObj.nic=""
                    this.registerObj.name=""
                    this.registerObj.phone=""
                    this.registerObj.address=""
                    this.registerObj.email=""
                    this.registerObj.pass=""
                    this.registerObj.confirm=""
                   // this.$router.push("/admlogin");

                }
            }
        }
    },
    components: {
        VueBasicAlert
    }

};
</script>


<style scoped>
 .ttable {
     
     width: 100%;
     border-width:2px;
     border-color : #130f40;
     /* border-style: solid; */
     font-size: 1.2rem;
     /* background-color :white; */
     /* padding-left: 3rem; */
      /* height: 3rem; */
 }
 th  {
     text-align: center;
}
.ttable, th, td {
border: 1px solid;
}
.register-container {
    padding: 2rem 2%;
    /* min-height: 72.3vh; */
}

.register-container .register-form-container {
    background: #fff;
    margin-bottom: 1.0rem;

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
     border: margin-bottom; 
}

.register-container .register-form-container form label {
    font-size: 1.3rem;
    margin: 0;
    padding: 0;
}

.register-container .register-form-container form span {
    font-size: 18px;
    padding-left: 5px;
    padding-right: 40px;
    color:#022e2a;
}

.register-container .register-form-container form .btn {
    /* margin: 1rem 0; */
    width: 25%;
    text-align: center;
    background: #022e2a;
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
/* for table */
span{
    font-size: 2.0rem;
}
.admin-container {
    background-color: #fff;
    /* height: 100vh; */
    padding: 2rem 2%;
    font-size: 1.5rem;
    /* min-height: 72.3vh; */
}
.admin-container span {
    color: #4e0707;
   
}

.project-list>tbody>tr>td {
    padding: 12px 8px;
}

.project-list>tbody>tr>td .avatar {
    width: 22px;
    border: 1px solid #CCC;
}


.modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
  }

  .modal-content {
      background-color: white;
      padding: 5px;
      border-radius: 1px;
      /* max-width: 500px; */
      width: 60%;
      position: relative;
      font-size: 1.3rem;
  }

  .close x {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px;
      background-color: transparent;
      border: none;
      cursor: pointer;
      font-size: 18px;
      color: #555;
  }

  .close-x:hover {
      color: #ff0000;
      /* Change to your desired hover color */
  }


  .modal-header {
      padding-bottom: 2px;
      border-bottom: 1px solid #ccc;
  }

  .modal-body {
      /* padding: 10px 20px 20px 20px; */
      padding-left: 5%; 

  }
  .model-group {
      padding: 10px ;
      /* padding-left: 10%;
      padding-right: 10%;
      padding-bottom: 10%; */
      /* margin: 10px; */
      /* justify-content: left; */
      margin-right: 10px;
  }
  .modal-body.model-group .error-mess {
    font-size: 1rem;
    position: relative;
    color: rgb(243, 47, 47);
    margin: 10%;
    padding: 0;
    width: 90%;

} 
.error-mess {
    font-size: 1.5rem;
    position: relative;
    color: rgb(243, 47, 47);
    margin: 0;
    padding: 0;
}
.modal-body.row {
    display: flex;
    margin: 10%;
  }
  .modal-footer {
      padding-top: 5px;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: flex-end;
  }

  .close-button,
  .save-button {
      padding: 5px 10px;
      border: none;
      cursor: pointer;
      font-weight: bold;
      border-radius: 4px;
      transition: background-color 0.3s ease;
  }

  .close-button {
      background-color: #f44336;
      color: white;
  }

  .save-button {
      background-color: #4CAF50;
      color: white;
      margin-left: 5px;
  }

  .close-button:hover {
      background-color: #d32f2f;
  }

  .save-button:hover {
      background-color: #45a049;
  }
  .form-control {
    margin: 0.7rem 0;
    border-radius: 0.5rem;
    background: #f7f7f7;
    /* padding: 2rem 1.2rem; */
    font-size: 1.5rem;
    color: #130f40;
    text-transform: none;
    width: 100%;
    border: margin-bottom; 
}


</style>
