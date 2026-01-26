<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />
    <section class="order-section">

        <div class="heading">
            <span>My Profile</span>
            <h3>Edit your Profile</h3>
        </div>

        <!-- booking form -->
        <form id="editProfileForm" @submit="handleSubmit" novalidate autocomplete="off">

            <div class="row">
                <div class="input-box">
                    <label for="uName">your name</label> 
                    <input type="text" name="uName" id="uName" v-model="proObj.name" >
                    <p v-if="errorObj.nameErr.length > 0">{{ errorObj.nameErr[0] }}</p>
                </div>
                <div class="input-box">
                    <label for="uPhone">your phone number</label>
                    <input type="text" name="uPhone" id="uPhone" v-model="proObj.phone">
                    <p v-if="errorObj.phoneErr.length > 0">{{ errorObj.phoneErr[0] }}</p>
                </div>
            </div>

            <div class="row">
                <div class="input-box">
                    <label for="uAddress">Your address</label>
                    <input type="text" name="uAddress" id="uAddress" v-model="proObj.address">
                    <p v-if="errorObj.addErr.length > 0">{{ errorObj.addErr[0] }}</p>
                </div>
                <div class="input-box">
                    <label for="uEmail">Your email</label>
                    <input type="email" name="uEmail" id="uEmail" v-model="proObj.email">
                    <p v-if="errorObj.emailErr.length > 0">{{ errorObj.emailErr[0] }}</p>
                </div>
            </div>
            <!-- <div class="row">
                <div class="input-box">
                    <label for="uPass">New Password</label>
                    <input type="password" name="uPass" id="uPass" v-model="proObj.pass">
                    <p v-if="errorObj.passErr.length > 0">{{ errorObj.passErr[0] }}</p>
                </div>
                <div class="input-box">
                    <label for="uPassConfirm">Re-enter Password</label>
                    <input type="password" name="uPassConfirm" id="uPassConfirm" v-model="proObj.confirm">
                    <p v-if="errorObj.confirmErr.length > 0">{{ errorObj.confirmErr[0] }}</p>
                </div>
            </div> -->
            <!-- <p>{{ this.nic }}</p> -->
            
            <input type="submit" value="Update Now" class="btn">
        </form>

    </section>
</template>

<script>
import axios from 'axios';
import VueBasicAlert from 'vue-basic-alert'
export default {
    name: "Profile",

    data() {
        return {
           proObj: { name: "", phone: "", address: "", email: "" , pass: "", confirm: ""},
            errorObj: { nameErr: [], phoneErr: [], addErr: [], emailErr: [], passErr:[], confirmErr: [] },
            matchProfile:undefined,
            theProfile:[],
            //nic: window.sessionStorage.getItem("key"),
            nic:"",
            sabha: "",
            userLevel:"",
        }
    },

    created(){
       // this.updateProfileByNic(),
       this.getDataFromSessionStorage(),
        this.showAUser()
       
    },
    methods: {

        async getDataFromSessionStorage(){
            const data = JSON.parse(sessionStorage.getItem('userData'))
            if(data){
                            this.nic = data.nic 
                            this.sabha = data.sabha
                            this.userLevel =data.userLevel
                        }
        },

        async showAUser() {
        // let data = this.nic
        this.theProfile= (await axios.get('/employee/' +this.nic)).data;
        
        //this.proObj.name = this.nic;
        this.proObj.name = this.theProfile.emp_name;
        this.proObj.phone = this.theProfile.emp_contact;
        this.proObj.address = this.theProfile.emp_address;
        this.proObj.email = this.theProfile.emp_email;
     
   },
   
        async updateProfileByNic(nic) {
           
            let data = await axios.get('/employee/' + nic );
            this.matchProfile = data.data;
        },

        resetCheckErr: function () {
            this.errorObj.nameErr = [];
            this.errorObj.phoneErr = [];
            this.errorObj.addErr = [];
            this.errorObj.emailErr = [];
            // this.errorObj.passErr = [];
            // this.errorObj.confirmErr = [];
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
            if (!this.proObj.name) {
                this.errorObj.nameErr.push("Entering a name is required");
            }
            else {
                if (!/^[A-Za-z]+$/.test(this.proObj.name.replace(/\s/g, ""))) {
                    this.errorObj.nameErr.push('A name can only contain letters');
                }
            }

            // Phone validate
            if (!this.proObj.phone) {
                this.errorObj.phoneErr.push('Entering phone number is required');
            }
            else {
                // if (!this.proObj.phone.startsWith('94')) {
                //     this.errorObj.phoneErr.push('Phone numbers must start with 84');
                // }

                if (!/[0-9]{10}/.test(this.proObj.phone)) {
                    this.errorObj.phoneErr.push('Phone numbers can only contain numbers');
                }

                if (this.proObj.phone.length != 10) {
                    this.errorObj.phoneErr.push('Phone numbers must have exactly 10 digits');
                }
            }
            // Address Validate
            if (!this.proObj.address) {
                this.errorObj.addErr.push("Entering a name is required");
            }

            // Email validate
            if (!this.proObj.email) {
                this.errorObj.emailErr.push("Entering an email is required");
            }
            else {
                if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$/.test(this.proObj.email)) {
                    this.errorObj.emailErr.push('Email must be valid');
                }
            }
             // Pass validate
            //  if (!this.proObj.pass) {
            //     this.errorObj.passErr.push('Password is required');
            // }
            // else {
            //     if (!/[!@#$%^&*]/.test(this.proObj.pass)) {
            //         this.errorObj.passErr.push('Password must contain at least 1 special character');
            //     }

            //     if (this.proObj.pass.length < 8) {
            //         this.errorObj.passErr.push('Password must be more than or equal 8 characters');
            //     }
            // }

            // Confirm Pass validate
            // if (!this.proObj.confirm) {
            //     this.errorObj.confirmErr.push('Confirm password is required');
            // }
            // else {
            //     if (this.proObj.pass !== this.proObj.confirm) {
            //         this.errorObj.confirmErr.push('Confirm password must be match with password');
            //     }
            // }

        },

        async handleSubmit(e) {
            this.checkForm();

            if (!this.checkEmptyErr()) {
                e.preventDefault();
            } else {
                e.preventDefault();
                await this.updateProfileByNic(this.proObj.nic);
                if(!this.matchProfile){

                let data = {
                    emp_name: this.proObj.name,
                    emp_contact: this.proObj.phone,
                    emp_address: this.proObj.address,
                    emp_email: this.proObj.email,
                    // emp_password : this.proObj.pass
                };
                await axios.put("/employee/" +this.nic , data, )
                this.$refs.alert.showAlert('success', 'Successfully Updated !')
                // document.getElementById("editProfileForm").reset();
            } else{
                this.$refs.alert.showAlert("Something went wrong")
            }

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
    padding: 2rem 9%;
     min-height: 72.3vh;
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
.order-section .icons-container .btn {
   background-color: #620a0a;
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
    width: 49%;
    padding: 1.8rem 0;
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