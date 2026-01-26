<template>
    <div class="menu-section">
       
<!-- start -->
<vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />

<div class="shroff-container">
       <div class="shroff-form-container">
        <form id="ShopRentForm" @submit="handleSubmit" novalidate autocomplete="off">
         
           <br>
          <div class="row">
             <h4>Select Pradeshiya Sabha to Add Signature keys</h4>
           <div class="col-sm-12">
                    <label id="uProvince"><b>Select Province | පළාත තෝරන්න:</b>
                    </label>
                       
                           <select  @change="changeprovince"   v-model="rentObj.pro"  name="province" id="province" class="form-control">
                                <option value="" selected disabled>Choose</option>
                                <option v-for="f in province" v-bind:key="f.pro_id" v-bind:value="f.pro_code">{{ f.pro_name }} </option>
                                
                                
                            </select>
                
                    <p class="error-mess" v-if="errorObj.proErr.length > 0">{{ errorObj.proErr[0] }}</p>

                    
                </div>
            </div> 
            <div class="row">
                <div class="col-sm-12">
                    <label id="uDistrict"><b>Select District | දිස්ත්‍රික්කය තෝරන්න:</b>
                    </label>
                    
                            <select class="form-control" @change="changedist" name="district" id="district" v-model="rentObj.dis" >
                                <option value="" selected disabled>Choose</option>
                                <option v-for="ds in Districts" :key="ds.dist_code" :value="ds.dist_code">{{ ds.dist_name }} </option>
                            </select>
                                
                          
                                <!-- <p><span>User country: {{ Prs.praddress.DistVal }}</span></p> -->
                    <p class="error-mess" v-if="errorObj.disErr.length > 0">{{ errorObj.disErr[0] }}</p>
                    
                </div>

            </div>
            <div class="row">
                <div class="col-sm-12">
                    <label id="uPradeshiya"><b>Select Pradeshiya Sabha | ප්‍රාදේශීය සභාව තෝරන්න:</b>
                    </label>
                    
                            <select @change=AllShopData class="form-control" name="pradeshiya" id="pradeshiya" v-model="rentObj.pra_sabha" >
                                <option value="" selected disabled>Choose</option>
                                <option v-for="ps in p_sabha" :key="ps.sb_code" :value="ps.sb_code">{{ ps.sb_name_en}}&nbsp;&nbsp;|&nbsp;&nbsp;{{ ps.sb_name_sin }} </option>
                            </select>
                            <p class="error-mess" v-if="errorObj.praErr.length > 0">{{ errorObj.praErr[0] }}</p>
                               
                </div>
                
            </div>
            
            <div class="col-sm-10">
                    <label for="iCode"><b>Profile ID:</b>
                    </label>
                    <input type="text" name="iAcc"  id="iAcc" class="form-control"
                        v-model="rentObj.proid" />
                    <p class="error-mess" v-if="errorObj.proidErr.length > 0">{{ errorObj.accNumErr[0] }}</p>
                </div>
                   
                <div class="col-sm-10">
                    <label for="iCode"><b>Access Key:</b>
                    </label>
                    <input type="text" name="iBank" id="iBank" class="form-control"
                        v-model="rentObj.accessk" />
                    <p class="error-mess" v-if="errorObj.acckErr.length > 0">{{ errorObj.bankErr[0] }}</p>
                </div>
                <div class="col-sm-10">
                    <label for="iCode"><b>Secret Key:</b>
                    </label>
                    <input type="text" name="iBank" id="iBank" class="form-control"
                        v-model="rentObj.secretk" />
                    <p class="error-mess" v-if="errorObj.seckErr.length > 0">{{ errorObj.bankErr[0] }}</p>
                </div>
                <div class="col-sm-10">
                    <input type="submit" value="Save" class="btn"/>
                  
                </div>
            
           <br>
           </form>
       </div>
</div>
<!-- end -->
</div>
</template>

<script>
import axios from "axios";
import VueBasicAlert from 'vue-basic-alert'
export default {
   name: "SabhaSignature",

   data() {
        return {
            userNic:'',Nic:'',
            rentObj: { pro:"",dis:"",pra_sabha:"",proid:"",accessk:"",secretk:""},
            errorObj: { disErr: [],proErr: [], praErr: [], proidErr: [], acckErr: [], seckErr: []},
            p_sabha:[],
            SabhaData:undefined,
            Sabha:undefined,
            matchUser:undefined,
           
            Districts: [],
            DistrictsData:undefined,
            sDist:undefined,
           
            // distMatch: undefined,
            province: [],  
            nic:"",
            sabha: "",
            userLevel:"",
        
        }
    },

        created() {
           this.getDataFromSessionStorage();
            this.AllDistricts();
            this.Allprovince();
            this.AllprSabha();
            
        },
     
     
    methods: {
      // ...mapMutations(["setUser"]),
      //    async MatchUser(nic) {
      //          let data = await axios.get('/customersdata/' + nic);
      //          this.matchUser = data.data;
      //    },
         async getDataFromSessionStorage(){
            const data = JSON.parse(sessionStorage.getItem('userData'))
            if(data){
                            this.nic = data.nic 
                            this.sabha = data.sabha
                            this.userLevel =data.userLevel
                        }
        },

        

        async Allprovince() {
           
         this.province = (await axios.get('/provinces/' )).data;
        
        },
        async AllDistricts() {
         this.Districts = (await axios.get('/districts/')).data;
         
        },
        async AllprSabha() {
         this.p_sabha = (await axios.get('/Prasabha/' )).data;
  
        },
   
        async changeprovince() {

                let DistrictsData = (await  axios.get('/districts/' +this.rentObj.pro));
                this.Districts=DistrictsData.data
            
       },
      async changedist() {
            
            let SabhaData = (await axios.get('/Prasabha/' + this.rentObj.dis));
            this.p_sabha=SabhaData.data;
          
            
       },
         
        resetCheckErr: function () {
            this.errorObj.disErr = [];
            this.errorObj.proErr= [];
            this.errorObj.praErr = [];
            this.errorObj.proidErr = [];
            this.errorObj.acckErr = [];
            this.errorObj.seckErr = [];
           
            
        },
        resetObjects: function(){
            this.rentObj.dis="";
            this.rentObj.pro="";
            this.rentObj.pra_sabha="";
            this.rentObj.proid="";
            this.rentObj.accessk="";
            this.rentObj.secretk="";
         
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

        
          
            if (!this.rentObj.pro) {
                this.errorObj.disErr.push("Choose Province");
            }
            if (!this.rentObj.dis) {
                this.errorObj.proErr.push("Choose District");
            }
         if (!this.rentObj.pra_sabha) {
                     this.errorObj.praErr.push("Choose Pra sabha");
                  
               }
               if (!this.rentObj.proid) {
                this.errorObj.proidErr.push("Required");
            }
            if (!this.rentObj.accessk) {
                this.errorObj.acckErr.push("Required");
            }
            if (!this.rentObj.secretk) {
                this.errorObj.seckErr.push("Required");
            }
            
            },

        async handleSubmit(e) {
           this.checkForm();
           
                if (!this.checkEmptyErr()) {
                    e.preventDefault();
                } else {
                 e.preventDefault();
                 
                  let data ={
                        sb_id : this.rentObj.pra_sabha,
                        profile_id : this.rentObj.proid,
                        access_key : this.rentObj.accessk,
                        secret_key : this.rentObj.secretk,
                     }
                     await axios.post("/addseckey/", data)
                    this.$refs.alert.showAlert('success', 'Secret key Added Successfully !')
               
                
            }
        }
        
      
    },
    components: {
        VueBasicAlert
    }

};

</script>

<style scoped>
input[type="button"] {
   background: none;
   color: inherit;
   border: none;
   padding: 0;
   font: inherit;
   cursor: pointer;
   outline: inherit;
}


hr {
   border-top: 3px solid #057835fa;
   width: 100%;
}



/* customer tab below */

::placeholder {
   color: white;
}

.menu-section {
   padding: 1rem 9%;
   min-height: 75vh;
   /* background-image: url("../assets/images/background3.jpg"); */
  background-repeat: no-repeat;
  background-size:cover;
  
  
   
}

.menu-section .menu-tabs {
   /* margin-bottom: 30px; */
   flex: 0 0 100%;
   max-width: 100%;
   text-align: center;
   background: #5e5c5cda;
   /* background-color: #27ae60; Income Topic */
}

.menu-section .menu-tabs .menu-tab-item {
   display: inline-block;
   cursor: pointer;
   padding: 5px 30px;
   border-radius: 30%;
   font-size: 20px;
   /* color: rgb(19, 18, 18); heading color */
   color: whitesmoke;
   font-weight: 500;
   text-transform: capitalize;
   transition: all 0.3s ease;
   margin: 0;
}


/* new */
.project-list>tbody>tr>td {
   padding: 12px 8px;
   font-size: small;
}



h4{
   padding-left: 2%;
}

/* newly added from income heads */
.register-container {
   padding: 2rem 9%;
}

.register-container .register-form-container {
   background: #fff;
   /* width: 100% !important; */
}

.register-container .register-form-container form {
   /* position: relative; */
   /* left: 40%; */
   /* transform: translate(-50%, 0%); */
   /* max-width: 70rem; */
   width: 100%;
   box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
   border: 0.1rem solid rgba(0, 0, 0, 0.2);
   padding: 1rem;
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
    font-size: 1.3rem; 
   color: #130f40;
   text-transform: none;
   width: 100%;
   border: bottom 1px solid; 
} 
.project-list>tbody>tr>td .input-box {
    /* margin: 0.7rem 0; */
   border-radius: 0.5rem;
   background: #e4e3e3;
   /* padding: 2rem 1.2rem; */
    font-size: 1.5rem; 
   color: #130f40;
   /* text-transform: none; */
   width: 100%;
   border: 1px solid; 
  
} 

.register-container .register-form-container form .form-control1 {
    margin: 0.7rem 0;
   border-radius: 0.5rem;
   background: #f7f7f7;
   /* padding: 2rem 1.2rem; */
    font-size: 1.3rem; 
   color: #130f40;
   text-transform: none;
   width: 100%;
   border: bottom 1px solid; 
} 

.register-container .register-form-container form label {
   font-size: 5rem;
   margin: 0;
   padding: 0;
   float:left;
}

.register-container .register-form-container form span {
   font-size: 18px;
   padding-left: 5px;
   padding-right: 40px;
   display: block; 
   overflow: hidden; 
   
}

.register-container .register-form-container form .btn {
   margin: 1rem 0;
   width: 10%;
   text-align: center;
   background-color : #620a0a;
   height: 30px;
   font-size: 1rem; 
   color: #000;
}

.register-container .register-form-container form p {
   padding-top: 1rem;
   font-size: 1.5rem;
   color: #666;
   margin: 0;
   text-align: justify;
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
   font-size: 5.5rem;
}

.register-container .register-form-container form .form-group .error-mess {
   font-size: 1.5rem;
   position: relative;
   color: rgb(243, 47, 47);
   margin: 0;
   padding: 0;
}
/* shroff form container */
.shroff-container {
   background-color: #ffffff09;
   height: auto;
   /* padding: 2rem 9%; */
   font-size: 16px;
   
}

.project-list>tbody>tr>td {
   padding: 12px 8px;
}

.project-list>tbody>tr>td .avatar {
   width: 22px;
   border: 1px solid #CCC;
}

.table-responsive {
   margin-top: 8vh;
   height: 500px;
}

.action-btn,
.cancel-btn,


.action-btn {
   background-color: #0da9ef;
   margin-right: 10px;
}

.cancel-btn,
.paid-btn {
   background-color: red;
}

.action-btn:hover {
   background-color: #27ae60;
}
.order-section form .row .input-box {
   width: 49%;
   padding: 1.8rem 0;
} 
/* newly added from income heads */
.shroff-container {
   padding: 2rem 9%;
}
/* ongoing */
.shroff-container .shroff-form-container {
   background: #fff;
   /* width: 100% !important; */
   
}

.shroff-container .shroff-form-container form {
   /* position: relative;
   left: 40%;
   transform: translate(-50%, 0%); */
   /* max-width: 70rem; */
   width: 100%;
   box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
   border: 0.1rem solid rgba(0, 0, 0, 0.2);
   padding: 2rem;
   border-radius: 0.5rem;
   animation: fadeUp 0.4s linear;
}

.shroff-container .shroff-form-container form h3 {
   padding-bottom: 1rem;
   font-size: 2rem;
   text-transform: uppercase;
   color: #130f40;
   margin: 0;
}

.shroff-container .shroff-form-container form .form-control {
    margin: 0.7rem 0;
   border-radius: 0.5rem;
   background: #f7f7f7;
   /* padding: 2rem 1.2rem; */
    font-size: 1.3rem; 
   color: #130f40;
   text-transform: none;
   width: 100%;
   border: margin-bottom; 
} 

.shroff-container .shroff-form-container form label {
    font-size: 1.2rem;
   margin: 0;
   padding: 0;
   float:left;
}

.shroff-container .shroff-form-container form span {
   font-size: 18px;
   padding-left: 5px;
   padding-right: 40px;
}

.shroff-container .shroff-form-container form .btn {
   /* margin: 1rem 0; */
   width: 25%;
   text-align: center;
   font-size: small;
   background-color : #620a0a;
    height: 3rem;
    color: #f4efef;
  
   
}
.shroff-container .shroff-form-container form .table {
   /* margin: 1rem 0; */
   width: 80%;
   text-align: center;
   font-size: small;
   background-color : #f7f7f7;
   /* padding-left: 5rem; */
    /* height: 3rem; */
   
}
.shroff-container .shroff-form-container form .Addbtn {
   /* margin: 1rem 0; */
   width: 5rem;
   /* height: 2rem; */
   /* text-align: center; */
   /* background-color : #af74a7; */
   /* vertical-align: bottom; */
   /* align-items: bottom; */
   padding-top: 1.9rem;
   padding-left: 3rem;
   
}

.shroff-container .shroff-form-container form p {
   padding-top: 1rem;
   font-size: 1.5rem;
   color: #666;
   margin: 0;
}
.shroff-container .shroff-form-container form  .error-mess {
   font-size: 1.2rem;
   position: relative;
   color: rgb(243, 47, 47);
   margin: 0;
   padding: 0;
}

.shroff-container .shroff-form-container form p a {
   color: #27ae60;
}

.shroff-container .shroff-form-container form p a:hover {
   color: #130f40;
   text-decoration: underline;
}

.shroff-container .shroff-form-container form .form-group {
   margin: 0;
}

.shroff-container .shroff-form-container form .form-group .error-mess {
   font-size: 1.5rem;
   position: relative;
   color: rgb(243, 47, 47);
   margin: 0;
   padding: 2rem 1.2rem;
}
.project-list>tbody>tr>td {
   padding: 12px 8px;
}

.project-list>tbody>tr>td .avatar {
   width: 22px;
   border: 1px solid #CCC;
}

.table-responsive {
   margin-top: 8vh;
}

.action-btn,
.cancel-btn,
.paid-btn {
   width: 100px;
   height: 25px;
   color: white;
   text-transform: capitalize;
}

.action-btn {
   background-color: #0da9ef;
   margin-right: 10px;
}

.cancel-btn,
.paid-btn {
   background-color: red;
}

.action-btn:hover {
   background-color: #27ae60;
}

</style>
