<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />
    <section class="order-section">

        <div class="heading">
            <span>My Profile</span>
            <h3>Change Password</h3>
        </div>

        <!-- booking form -->
        <form id="updatePasswordForm" @submit="handleSubmit" novalidate autocomplete="off">


            <div class="row">
                <div class="input-box">
                    <label for="uPass">New Password</label>
                    <input style="border: 1px solid #ccc;" type="password" name="uPass" id="uPass" v-model="proObj.pass">
                    <p v-if="errorObj.passErr.length > 0">{{ errorObj.passErr[0] }}</p>
                    <p> Please do not use # symbol when creating passwords</p>
                </div>
                <div class="input-box">
                    <label for="uPassConfirm">Re-enter Password</label>
                    <input style="border: 1px solid #ccc;" type="password" name="uPassConfirm" id="uPassConfirm" v-model="proObj.confirm">
                    <p v-if="errorObj.confirmErr.length > 0">{{ errorObj.confirmErr[0] }}</p>
                </div>
            </div>
            <br>

            <input type="submit" value="Update Now" class="btn">
      
        </form>

    </section>
</template>

<script>
import axios from 'axios';
import VueBasicAlert from 'vue-basic-alert'
export default {
    name: "ChangePassword",

    data() {
        return {
           proObj: {  pass: "", confirm: ""},
            errorObj: { passErr:[], confirmErr: [] },
            matchUser:undefined,
            nic:"",
            sabha: "",
            userLevel:"",
        }
    },

    created(){
        this.getDataFromSessionStorage()
    
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
        
        async updatePassword(nic) {
           
            let datau = await axios.get('/employee/'+nic );
            this.matchUser = datau.data;
        },

        resetCheckErr: function () {
           
            this.errorObj.passErr = [];
            this.errorObj.confirmErr = [];
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

           
             // Pass validate
             if (!this.proObj.pass) {
                this.errorObj.passErr.push('Password is required');
            }
            else {
                if (!/[!@#$%^&*]/.test(this.proObj.pass)) {
                    this.errorObj.passErr.push('Password must contain at least 1 special character');
                }

                if (this.proObj.pass.length < 8) {
                    this.errorObj.passErr.push('Password must be more than or equal 8 characters');
                }
            }

            // Confirm Pass validate
            if (!this.proObj.confirm) {
                this.errorObj.confirmErr.push('Confirm password is required');
            }
            else {
                if (this.proObj.pass !== this.proObj.confirm) {
                    this.errorObj.confirmErr.push('Confirm password must be match with password');
                }
            }

        },

        async handleSubmit(e) {
            this.checkForm();

            if (!this.checkEmptyErr()) {
                e.preventDefault();
            } else {
                e.preventDefault();
                await this.updatePassword(this.nic);
                if(this.matchUser){
                    let data = {
                        emp_password : this.proObj.pass
                    }
            
                await axios.put("/empuppass/"+this.nic, data )
                this.$refs.alert.showAlert('success', 'Password Successfully Updated !')
                document.getElementById("updatePasswordForm").reset();
            } else{
                this.$refs.alert.showAlert("Something went wrong")
                
            }

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