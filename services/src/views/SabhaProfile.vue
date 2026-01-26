<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />
    <section class="order-section">

        <div class="heading">
            <span>Sabha Profile</span>
            <b><h4>Contact Details</h4></b>
        </div>

        <!-- booking form -->
        <form id="editSabhaForm" @submit="handleSubmit" novalidate autocomplete="off">

            <div class="row">
                <div class="input-box col-md-4">
                    <label for="sFax">Fax Number </label> 
                    <input type="text" name="sFax" id="sFax" v-model="sabhaObj.fax" class="form-control">
                    <p v-if="errorObj.faxErr.length > 0">{{ errorObj.faxErr[0] }}</p>
                </div>
                <div class="input-box col-md-4">
                    <label for="sPhone">Phone number</label>
                    <input type="text" name="uPhone" id="sPhone" v-model="sabhaObj.phone" class="form-control">
                    <p v-if="errorObj.phoneErr.length > 0">{{ errorObj.phoneErr[0] }}</p>
                </div>
                <div class="input-box col-md-4">
                    <label for="sEmail">Email</label>
                    <input type="email" name="sEmail" id="sEmail" v-model="sabhaObj.email" class="form-control">
                    <p v-if="errorObj.emailErr.length > 0">{{ errorObj.emailErr[0] }}</p>
                </div>
            </div>

            <div class="row">
                <div class="input-box col-md-12">
                    <label for="sAddress">Address in English</label>
                    <input type="text" name="sAddress" id="sAddress" v-model="sabhaObj.address" class="form-control">
                    <p v-if="errorObj.addErr.length > 0">{{ errorObj.addErr[0] }}</p>
                </div> 
                 
            </div>
            <div class="row">
                
                 <div class="input-box col-md-12">
                    <label for="sAddress">Address in Sinhala</label>
                    <input type="text" name="sAddress" id="sAddress" v-model="sabhaObj.address_si" class="form-control">
                    <p v-if="errorObj.addsiErr.length > 0">{{ errorObj.addsiErr[0] }}</p>
                </div> 
                
            </div>
            <div class="row">
               
                 <div class="input-box col-md-12">
                    <label for="sAddress">Address in Tamil</label>
                    <input type="text" name="sAddress" id="sAddress" v-model="sabhaObj.address_ta" class="form-control">
                    <p v-if="errorObj.addtaErr.length > 0">{{ errorObj.addtaErr[0] }}</p>
                </div> 
                
            </div>
                <div class="row">
               
                <div class="input-box col-md-6">
                    <label for="sVat">Vat number</label>
                    <input type="text" name="sVat" id="sVat" v-model="sabhaObj.vatnum" class="form-control">
                    <p v-if="errorObj.vatnumErr.length > 0">{{ errorObj.vatnumErr[0] }}</p>
                </div>  
                <div class="input-box col-md-6">
                    <label for="sIpg">Payment Gateway</label>
                    <div><select v-model="sabhaObj.ipg" id="sIpg" class="form-control">
                       
                       <option  value="" selected disabled>Select</option>
                       
                       <option value="people">People's Bank</option>
                       <option value="BOC">BOC</option>
                   </select>
                </div> 
                    <p v-if="errorObj.vatnumErr.length > 0">{{ errorObj.ipgErr[0] }}</p>
                </div>  
            </div>

             <div class="row">
                <div class="input-box col-md-4">
                    <label for="sAddress">Assessment Vote</label>
                     <select v-model="sabhaObj.assess_vote" id="iHead" class="form-control" >
                       <option value="" selected disabled>
                                Choose
                       </option>
                       <option v-for="ratehead in sabhaIncomeHead" :key="ratehead.sb_rate_head "  
                           v-bind:value =ratehead.sb_rate_head >
                             {{ ratehead.sb_rate_head  }} - {{ratehead.sb_rate_head_name}}  
                       </option>
                   </select>
                    <p class="error-mess" v-if="errorObj.assess_voteErr.length > 0">{{ errorObj.assess_voteErr[0] }}</p>
                </div>
                <div class="input-box col-md-4">
                    <label for="sAddress">Assessment Fine Vote</label>
                    <select v-model="sabhaObj.assess_fine_vote" id="iHead" class="form-control" >
                       <option value="" selected disabled>
                                Choose
                       </option>
                       <option v-for="ratehead in sabhaIncomeHead" :key="ratehead.sb_rate_head "  
                           v-bind:value =ratehead.sb_rate_head >
                             {{ ratehead.sb_rate_head  }} - {{ratehead.sb_rate_head_name}}  
                       </option>
                   </select>
                    <p v-if="errorObj.assess_fine_voteErr.length > 0">{{ errorObj.assess_fine_voteErr[0] }}</p>
                </div> 
                <div class="input-box col-md-4">
                    <label for="sAddress">Assessment Arrears Vote</label>
                    <select v-model="sabhaObj.assess_arrears_vote" id="iHead" class="form-control" >
                       <option value="" selected disabled>
                                Choose
                       </option>
                       <option v-for="ratehead in sabhaIncomeHead" :key="ratehead.sb_rate_head "  
                           v-bind:value =ratehead.sb_rate_head >
                             {{ ratehead.sb_rate_head  }} - {{ratehead.sb_rate_head_name}}  
                       </option>
                   </select>

                    <p v-if="errorObj.assess_arrears_voteErr.length > 0">{{ errorObj.assess_arrears_voteErr[0] }}</p>
                </div>  
                
            </div>
            <div class="input-box">
            <input type="submit" value="Update Now" class="btn">
            </div>
        </form>

    </section>
</template>

<script>
import axios from 'axios';
import VueBasicAlert from 'vue-basic-alert'
export default {
    name: "SabhaProfile",

    data() {
        return {
            sabhaObj: { fax: "", phone: "",email: "" ,  address: "",address_si: "",address_ta: "", vatnum: "0",ipg:"",finedate:"",fineper:"",
                assess_vote:"",assess_fine_vote:"",assess_arrears_vote:""
            },
            errorObj: { faxErr: [], phoneErr: [],  emailErr: [], addErr: [],addsiErr: [],addtaErr: [], vatnumErr:[],ipgErr:[],finedateErr:[],fineperErr:[],
                assess_voteErr:[],assess_fine_voteErr:[],assess_arrears_voteErr:[]
            },
            matchProfile:undefined,
            theSabha:[],
            nic:"",
            sabha: "",
            userLevel:"",
            sabhaIncomeHead : undefined,
        }
    },

    created(){
        this.getDataFromSessionStorage();
       // this.updateProfileByNic(),
        // this.showSabha()
    },
    methods: {

        async getDataFromSessionStorage(){
            const data = JSON.parse(sessionStorage.getItem('userData'))
            if(data){
                            this.nic = data.nic 
                            this.sabha = data.sabha
                            this.userLevel =data.userLevel
                        }
        this.sabhaIncomeHead = (await axios.get('/allnewvotes/'+this.sabha)).data;
        this.theSabha= (await axios.get('/pra_sabha/' +this.sabha)).data;
    
        this.sabhaObj.fax = this.theSabha.fax;
        this.sabhaObj.phone = this.theSabha.sb_contact;
        this.sabhaObj.email = this.theSabha.sb_email;
        this.sabhaObj.address = this.theSabha.sb_address;
        this.sabhaObj.address_si = this.theSabha.sb_address_si;
        this.sabhaObj.address_ta = this.theSabha.sb_address_ta;
        this.sabhaObj.vatnum = this.theSabha.vat_num;
        this.sabhaObj.ipg = this.theSabha.saba_ipg;
        this.sabhaObj.finedate =this.theSabha.fine_date;
        this.sabhaObj.fineper=this.theSabha.fine_rate;
        this.sabhaObj.assess_vote=this.theSabha.assess_vote;
        this.sabhaObj.assess_fine_vote=this.theSabha.assess_fine_vote;
        this.sabhaObj.assess_arrears_vote=this.theSabha.assess_arrears_vote;
        },

//         async showSabha() {
//         // let data = this.code
         
        


     
//    },
        async updateSabhaByCode(sabha) {
           
            let data = await axios.get('/pra_sabha/' + sabha );
            this.matchProfile = data.data;
        },

        resetCheckErr: function () {
            this.errorObj.faxErr = [];
            this.errorObj.phoneErr = [];
            this.errorObj.emailErr = [];
            this.errorObj.addErr = [];
            this.errorObj.vatnumErr=[];
            // this.errorObj.ipgErr=[];
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

            // Fax validate
            if (!this.sabhaObj.fax) {
                this.errorObj.fax.push("required");
            }
            else {
                if (!/[0-9]{10}/.test(this.sabhaObj.fax)) {
                    this.errorObj.faxErr.push('Fax numbers can only contain numbers');
                }
            }

            // Phone validate
            if (!this.sabhaObj.phone) {
                this.errorObj.phoneErr.push('Entering phone number is required');
            }
            else {
                // if (!this.proObj.phone.startsWith('94')) {
                //     this.errorObj.phoneErr.push('Phone numbers must start with 84');
                // }

                if (!/[0-9]{10}/.test(this.sabhaObj.phone)) {
                    this.errorObj.phoneErr.push('Phone numbers should have 10 digits');
                }

                if (this.sabhaObj.phone.length != 10) {
                    this.errorObj.phoneErr.push('Phone numbers must have exactly 10 digits');
                }
            }

            // Email validate
            if (!this.sabhaObj.email) {
                this.errorObj.emailErr.push("Entering a email is required");
            }
            else {
                if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(this.sabhaObj.email)) {
                    this.errorObj.emailErr.push('Email must be valid');
                }
            }
              // Address Validate
              if (!this.sabhaObj.address) {
                this.errorObj.addErr.push("Entering address is required");
            }
            //ipg
            // if (!this.sabhaObj.ipg) {
            //     this.errorObj.ipgErr.push("Selecting a Payment Gateway is required");
            // }

        },

        async handleSubmit(e) {
            this.checkForm();

            if (!this.checkEmptyErr()) {
                e.preventDefault();
            } else {
                e.preventDefault();
                // await this.updateSabhaByCode(this.sabha);
                // if(!this.matchProfile){

                let data = {
                    fax: this.sabhaObj.fax,
                    sb_contact: this.sabhaObj.phone,
                    sb_email: this.sabhaObj.email,
                    sb_address: this.sabhaObj.address,
                    sb_address_si: this.sabhaObj.address_si,
                    sb_address_ta: this.sabhaObj.address_ta,
                    vat_num:this.sabhaObj.vatnum,
                    saba_ipg:this.sabhaObj.ipg,
                    fine_date:"0",
                    fine_rate:"0",
                    assess_vote:this.sabhaObj.assess_vote,
                    assess_fine_vote:this.sabhaObj.assess_fine_vote,
                    assess_arrears_vote:this.sabhaObj.assess_arrears_vote,
                };
                await axios.put("/pra_sabha/" +this.sabha , data, )
                this.$refs.alert.showAlert('success', 'Successfully Updated !')
                // document.getElementById("editSabhaForm").reset();
                
            // } else{
            //     this.$refs.alert.showAlert("Something went wrong")
            // }

                // this.$refs.alert.showAlert('success', 'Successfully Updated !')
                // document.getElementById("editProfileForm").reset();
            }
        }
    },

    components: {
        VueBasicAlert
    }

}
</script>

<style scoped>
.order-section {
    padding: 2rem 2%;
      min-height: 75vh;
}
 
 .order-section span{
   color:#4e0707 
}

.order-section .icons-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  
}

.order-section .icons-container .icons {
    border-radius: .5rem;
    padding: 2rem;
    text-align: center;
    background: #f7f7f7;
}

.order-section .icons-container .icons img {
    height: 10rem;
}

.order-section .icons-container .icons h3 {
    font-size: 2rem;
    color: #130f40;
    margin-top: .5rem;
}

.order-section form {
    background: #f7f7f7;
    padding: 2rem;
    border-radius: .5rem;
}
.order-section form .row {
    justify-content: space-between;
}


.order-section form .row .input-box {
    /* width: 30%; */
    padding: 1.8rem 0;
    
}
.order-section form .row .input-box .form-control{
    margin: 0.7rem 0;
    border-radius: 0.5rem;
    background: #f7f7f7;
    /* padding: 2rem 1.2rem; */
     font-size: 1.6rem; 
    color: #130f40;
    text-transform: none;
    width: 90%;
    border: margin-bottom; 
    
}
.order-section form .btn {
    background-color: #4e0707;
}

.order-section form .row label {
    font-size: 1.7rem;
    color: #666;
}

.order-section form .row p {
    font-size: 1.5rem;
    position: absolute;
    color: rgb(243, 47, 47);
    margin: 0;
    padding-top: 5px;
}

.order-section form .row input,
.order-section form .row textarea {
    width: 100%;
    margin-top: .5rem;
    padding: 1rem 1.2rem;
    width: 100%;
    border-radius: .5rem;
    font-size: 1.6rem;
    text-transform: none;
    color: #130f40;
}

.order-section form .row textarea {
    height: 20rem;
    resize: none;
}

.order-section form .row .map {
    height: 100%;
    width: 100%;
    border-radius: .5rem;
}

@media (max-width: 768px) {
    .order form .row .input-box {
        width: 100%;
    }

    .order-section form .row {
        display: block;
        max-width: 100%;
        width: 100%;
        margin: 0;
    }

    .order-section form .row .input-box {
        width: 100%;
        
    }

}

@media (max-width: 576px) {
    .order-section .icons-container {
        grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr));
    }
}
</style>