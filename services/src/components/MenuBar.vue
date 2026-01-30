<template>
    <div>
      <div v-if="user.emp_status==1" class="sidebar">
        <router-link @click="scrollToTop()" to="" class="logo">
          <img src="../assets/images/taco.png" alt="" />
          <!-- <h4>{{sabhadetail.sb_name_en}}</h4> -->
          <!-- <h3>LGPMS</h3> -->
        </router-link>

        <nav v-if="user.user_level==5" class="navbar">
          <ul>
            <li style="color:darkgray; font-size:1.4rem;">Admin</li>
            <li> <router-link @click="scrollToTop()" to="/Dashboard">Dashboard</router-link></li>
         <li><router-link @click="scrollToTop()" to="/SabhaProfile">Profile</router-link></li>
             <li> <router-link @click="scrollToTop()" to="/uregister">Register</router-link></li>
         <li><router-link @click="scrollToTop()" to="/incomeheadsnew">Vote</router-link></li>
         <li><router-link @click="scrollToTop()" to="/Assign">Assign</router-link></li>
     
        </ul>
        </nav>

        <nav v-if="user.user_level==7" class="navbar">
          <ul>
            <li style="color:darkgray; font-size:1.2rem; margin-bottom: 10px;">Water Bill Management</li>
            
            <li><router-link @click="scrollToTop()" to="/manage-water-projects">Water Projects</router-link></li>
            <li><router-link @click="scrollToTop()" to="/edit-billing-fees">Billing Fees</router-link></li>
            
            <li><router-link @click="scrollToTop()" to="/add-customer">Register Customer</router-link></li>
            <li><router-link @click="scrollToTop()" to="/manage-water-accounts">Water Accounts</router-link></li>

            <li><router-link @click="scrollToTop()" to="/add-meter-reading">Add Meter Readings</router-link></li>
            <li><router-link @click="scrollToTop()" to="/bill-payment">Bill Payment (PIV)</router-link></li>
            <li><router-link @click="scrollToTop()" to="/print-bill">Print Bill</router-link></li>
            
            <li><router-link @click="scrollToTop()" to="/view-customer-history">Customer History</router-link></li>
            
            <li><router-link @click="scrollToTop()" to="/water-bill-report-generation">Reports</router-link></li>
          </ul>
        </nav>

 
      
      </div>
  
      <div class="header">
        <!-- <router-link @click="scrollToTop()" to="/" class="logo"> -->
          <h4 v-if="userLevel==0">Ministry Of Public Administration, Home Affairs, Provincial Councils And Local Government</h4>
               <!-- <h4 v-if="userLevel==3">{{prodetail.pro_name}} පළාත</h4> -->
               <h4 v-if="prodetail && prodetail[0] && userLevel===3">{{ prodetail[0].pro_name }} පළාත</h4>
               <h4 v-if="prodetail && prodetail[0] && userLevel===2">{{ prodetail[0].pro_name }} පළාත</h4>
                   <h4 v-if="userLevel>=4">{{sabhadetail.sb_name_en}}</h4>
        <!-- </router-link> -->
       
    
  
        <div class="icons">
          <div id="menu-btn" class="fas fa-bars menu-btn" @click="showNav"></div>
          <router-link to="/Profile" v-if="user">
            <div class="fas fa-user account" @click="scrollToTop()">
              <h5>My Profile</h5>
            </div>
          </router-link>
          <router-link @click="handleLogout" to="/" v-if="user">
            <div class="fas fa-sign-out account" @click="scrollToTop()">
              <h5>Sign Out</h5>
            </div>
          </router-link>
          <router-link to="/ChangePassword" v-if="user">
            <div class="fas fa-key account" @click="scrollToTop()">
              <h5>Change Password</h5>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </template>
  <script>
import axios from 'axios';
import { mapState, mapMutations } from "vuex";
export default {
    name: 'NavBar',
    data() {
        return {
            employeedetail:[],
            subjects:[],
            subjectkey:'',
            sabhadetail:[],
            shoptype:0,
            asstype:0,
            cremato:0,
            gully:0,
            prodetail:[],
            userLevel:""
        };
    },

    computed: {
        ...mapState(["user"])
    },

    mounted() {
        window.addEventListener('scroll', this.handleScroll);
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    created() {
       this.getDataFromSessionStorage()
       this.getemp()
     
   },

    methods: {
        ...mapMutations(["setUser"]),
        async getDataFromSessionStorage(){
           const data = JSON.parse(sessionStorage.getItem('userData'))
           if(data){
                           this.nic = data.nic 
                           this.sabha = data.sabha
                           this.userLevel =data.userLevel
                           this.procode=data.procode
                       }
                       if(this.userLevel==3 ){
                this.prodetail= (await axios.get('/probyid/'+this.procode)).data
            }
            if(this.userLevel==2){
                this.prodetail= (await axios.get('/probyid/'+this.procode)).data
            }
           if(this.userLevel>=4){
            this.sabhadetail= (await axios.get('/pra_sabha/'+this.sabha)).data
           }
          //  let sabhaCode = this.sabha
           let Sabhadata = await axios.get('/subheads/'+ this.nic +"/"+ this.sabha)
           this.subjects = Sabhadata.data
         
            for (let i=0; i<this.subjects.length; i++){
                if (this.subjects[i].subjecttype=='shoprent'){
                    this.subjectkey='shoprent'
                    this.shoptype=1;
                    // break
                } 
                if (this.subjects[i].subjecttype=='assesmenttax'){
                    this.subjectkey='assesmenttax'
                    this.asstype=2;
                    
                }
                if (this.subjects[i].subjecttype=='crematoria'){
                    this.subjectkey='crematoria'
                    this.gully=4;
                    
                }
                if (this.subjects[i].subjecttype=='gully'){
                    this.subjectkey='gully'
                    this.gully=4;
                    
                }
                if (this.subjects[i].subjecttype=='crematoria'){
                    this.subjectkey='crematoria'
                    this.gully=4;
                    
                }
                if (this.subjects[i].subjecttype=='bacho'){
                    this.subjectkey='bacho'
                    this.gully=4;
                    
                }
                if (this.subjects[i].subjecttype=='stadiums'){
                    this.subjectkey='stadiums'
                    this.gully=4;
                    
                }
                if (this.subjects[i].subjecttype=='townhall'){
                    this.subjectkey='townhall'
                    this.gully=4;
                    
                }
                if (this.subjects[i].subjecttype=='mv'){
                    this.subjectkey='mv'
                    this.gully=4;
                    
                }
                // if (this.subjects[i].subjecttype=='bacho' || this.subjects[i].subjecttype=='gully' || this.subjects[i].subjecttype=='bacho'){
                //     this.subjectkey='assesmenttax'
                //     this.asstype=2;
                    
                // }
                // else{
                //     this.subjectkey=0
                // }
            }        
       },


         //get employee table's status
         async getemp(){
            let empStatus =  await axios.get('/employee/' + this.nic)
            this.employeedetail = empStatus.data
            // this.employeedetail =  (await axios.get('/api/employee/' + this.nic)).data
        },
        
        scrollToTop() {
            window.scrollTo(0, 0);
        },

        showNav: function () {
            let navbar = document.querySelector('.header .navbar');
            navbar.classList.toggle('active');
        },

        showLog: function () {
            let mq = window.matchMedia("(max-width: 768px)");
            if (mq.matches) {
                let log = document.querySelector('.drop-down-select');
                log.classList.toggle('active');
            }
        },

        // handleScroll: function () {
        //     let navbar = document.querySelector('.header .navbar');
        //     navbar.classList.remove('active');
        //     let log = document.querySelector('.drop-down-select');
        //     log.classList.remove('active');
        // },

        handleLogout: function () {
            this.setUser("");
            window.sessionStorage.removeItem("userData");
        }
    }
}
</script>
  <style scoped>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 200px; /* Adjust as needed */
    background-color: #550202; /* Adjust as needed */
    color: white;
    padding-top: 5px;
    padding-left: 20px;
  }
  
  .header {
    margin-left: 200px; /* Sidebar width */
    padding: 20px;
    background-color: #550202;
    color: white;
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header .logo h4 {
    font-size: 1.5rem;
    margin: 0;
    /* padding-top: 10px; */
  }
  
  .navbar {
    display: flex;
    align-items: center;
    padding-top: 30px;
  }
  .navbar ul {
    list-style-type: none;
    padding: 0;
  }

  .navbar li {
    list-style-type: none;
    margin-bottom: 3px;
  }
  .navbar a {
    font-size: 1.2rem;
    margin-right: 20px;
    color: white;
    padding-left: 0.7rem;
  }
  
  .navbar a.router-link-exact-active {
    color: rgb(243, 158, 60);
  }
  
  .icons {
    display: flex;
    align-items: center;
  }
  
  .icons div {
    height: 40px;
    width: 40px;
    line-height: 40px;
    font-size: 1.5rem;
    background: #eb8e02;
    color: #f8f7fc;
    border-radius: 50%;
    margin-left: 10px;
    cursor: pointer;
    text-align: center;
  }
  
  .icons div:hover {
    color: #fff;
    background: #f4f5f1;
  }
  
  #menu-btn {
    display: none;
  }
  
  @media (max-width: 768px) {
    .header {
      margin-left: 0;
    }
  
    .sidebar {
      width: 100%; /* Adjust as needed */
      height: auto;
      padding: 20px;
    
    }
  
    .header .logo {
      display: none;
    }
  
    .navbar {
      flex-direction: column;
      align-items: flex-start;
      margin-top: 20px;
      padding-top: 50px;
    }
  
    .navbar a {
      font-size: 1.5rem;
      margin: 10px 0;
    }
  
    #menu-btn {
      display: inline-block;
    }
  }
  </style>
  