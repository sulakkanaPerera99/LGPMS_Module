<template>
    <vue-basic-alert :duration="400" :closeIn="2000" ref="alert" />

    <div class="shroff-container">
        <div class="shroff-form-container">
            <form id="addIncomeForm" novalidate autocomplete="off">
                <div class="heading">
                    <b>
                        <h3>Assign Subject and Acting Officers</h3>
                    </b>
                </div>
                <div class="form-group">
                    <label for="iHead">Income Head:
                    </label>
                    <select v-model="assignObj.headid" id="iHead" class="form-control">
                        <option value="" selected disabled>
                            Choose
                        </option>
                        <option v-for="ratehead in sabhaIncomeHead" :key="ratehead.sb_rate_head "
                            v-bind:value=ratehead.sb_rate_head>
                            {{ ratehead.sb_rate_head }} - {{ratehead.sb_rate_head_name}}
                        </option>
                    </select>

                    <p class="error-mess" v-if="errAssignObj.iheadErr.length > 0">{{ errAssignObj.iheadErr[0] }}</p>
                </div>
                <div class="form-group">
                    <label for="check">Subject Type:
                    </label>
                    <select v-model="assignObj.subjecttype" id="check" class="form-control">
                        <option value="other" selected>
                            Other වෙනත්
                        </option>
                        <option value="shoprent">Shop Rent කඩ කුලී</option>
                        <option value="assesmenttax">Assesment Tax වරිපනම්</option>
                        <option value="bacho">Bachoe බැකෝ යන්ත්‍ර</option>
                        <option value="gully">Gully Bowser ගලි බවුසර්</option>
                        <option value="stadiums">Stadiums ක්‍රීඩාංගණ</option>
                        <option value="townhall">Town Halls නගර ශාලා</option>
                        <option value="crematoria">Crematoria ආදාහනාගාර</option>
                        <option value="mv">Mechinary & Vehicle යන්ත්‍රෝපකරණ හා වාහන</option>
                        <option value="waterbill">Water Bills ජල බිල්පත් </option>
                    </select>

                    <p class="error-mess" v-if="errAssignObj.subtyErr.length > 0">{{ errAssignObj.subtyErr[0] }}</p>
                </div>

                <div class="form-group">
                    <label for="iHead">Subject Employee:
                    </label>
                    <select v-model="assignObj.emp" id="aEmp" class="form-control">
                        <option value="" selected disabled>
                            Choose
                        </option>
                        <option v-for="employees in sabhaEmployees" :key="employees.emp_nic "
                            v-bind:value=employees.emp_nic>
                            {{ employees.emp_nic }}- {{ employees.emp_name }}
                        </option>
                    </select>

                    <p class="error-mess" v-if="errAssignObj.empErr.length > 0">{{ errAssignObj.empErr[0] }}</p>
                </div>

                <div class="row">
                    <div class="col-sm-6">
                        <label for="iAct1">Acting 1:
                        </label>

                        <select v-model="assignObj.iAct1" id="iAct1" class="form-control">
                            <option value="" selected disabled>
                                Choose
                            </option>
                            <option v-for="employees1 in sabhaEmployees" :key="employees1.emp_nic "
                                v-bind:value=employees1.emp_nic>
                                {{ employees1.emp_nic }}- {{ employees1.emp_name }}
                            </option>
                        </select>

                    </div>
                    <div class="col-sm-6">
                        <label for="iAct2">Acting 2
                        </label>
                        <select v-model="assignObj.iAct2" id="iAct2" class="form-control">
                            <option value="" selected disabled>
                                Choose
                            </option>
                            <option v-for="employees2 in sabhaEmployees" :key="employees2.emp_nic "
                                v-bind:value=employees2.emp_nic>
                                {{ employees2.emp_nic }}- {{ employees2.emp_name }}
                            </option>
                        </select>

                    </div>

                </div>
                <div class="row">


                    <div class="Addbtn col-sm-4">
                        <label for="iRates">
                        </label>
                        <input type="button" value="Assign" id="Addpay" class=" btn" @click="tempsave()">
                    </div>
                </div>
                <br>
                <div class="row tablrow">
                    <table class="ttable">
                        <thead>
                            <tr>
                                <th>Income Head</th>
                                <th>Main Subject</th>
                                <th>Acting 1</th>
                                <th>Acting 2</th>
                                <th>Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for=" a in assignedsubs" :key="a.id">
                                <td>{{ a.emp_sb_rates }}</td>
                                <td>{{ a.sb_emp_name_main }}</td>
                                <td>{{ a.sb_emp_name_ac1 }}</td>
                                <td>{{ a.sb_emp_name_ac2 }}</td>

                                <td>
                                    <router-link to="" @click="deleteAssigned(a.id)" class="fas fa-trash-alt">
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="row col-sm-4">
                    <router-link @click="saveSubjects()" to="" class=" btn">save</router-link>
                </div>
                <br>
                <div class="heading">
                    <h3>Subject & Acting Details</h3>
                </div>
                <div class="row tablrow">

                    <table class="ttable">
                        <thead>
                            <tr>
                                <th>Index</th>
                                <th>Head id</th>
                                <th>Type</th>
                                <th>Income Head</th>
                                <th>Subject</th>
                                <th>Acting 1</th>
                                <th>Acting 2</th>
                                <th>Delete</th>
                                </tr>
                        </thead>
                        <tbody>
                            <tr v-for=" (b,index) in paginatedData" :key="index">

                                <td>{{ (currentPage - 1) * 10 + index + 1 }}</td>
                                <td>{{ b.sb_rate_head_name }}</td>
                                <td>{{ b.subjecttype}}</td>
                                <td>{{ b.emp_sb_rates }}</td>
                                <td>{{ b.sb_emp_name_main }}</td>
                                <td>{{ b.sb_emp_name_ac1 }}</td>
                                <td>{{ b.sb_emp_name_ac2}}</td>
                                <td>
                                    <router-link to="" @click="deleteSubject(b.iid)" class="fas fa-trash-alt">
                                    </router-link>
                                </td>
                                </tr>
                        </tbody>
                    </table>
                </div>
                <div class="row tablrow">
                    <button class="fas fa-backward" @click="prevPage($event)" :disabled="currentPage === 1"></button>
                    <span>{{ currentPage }} / {{ totalPages }}</span>
                    <button class="fas fa-forward" @click="nextPage($event)"
                        :disabled="currentPage === totalPages"></button>
                </div>
            </form>
        </div>
    </div>
    </template>

<script>
import axios from 'axios';
import { mapMutations } from "vuex";
import { mapState } from "vuex";
import VueBasicAlert from 'vue-basic-alert';

export default {
    name: "Assign",

    data() {
        return {
            nic: "",
            sabha: "",
            userLevel: "",
            assignObj: { headid: "", subjecttype: 'other', emp: "", iAct1: "0", iAct2: "0" },
            errAssignObj: { empErr: [], iheadErr: [], subtyErr: [] },
            sabhaIncomeHead: undefined,
            ratehead: '',
            assignedsubs: [],
            arrayy: undefined,
            // employeedetail:[],
            sabhaEmployees: undefined,
            employees: '',
            len: '',
            subName: '',
            subOnename: '',
            subTwoname: '',
            hID: '',
            savedsubs: [],
            itemsPerPage: 10,
            currentPage: 1,
        };
    },
    created() {
        this.getDataFromSessionStorage()

    },
    computed: {
        ...mapState(["user"]),
        paginatedData() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;

            // Check if this.data is an array before using slice method
            if (Array.isArray(this.savedsubs)) {
                return this.savedsubs.slice(startIndex, endIndex);
            } else {
                // Return empty array or handle loading state
                return [];
            }
        },
        totalPages() {
            return Math.ceil(this.savedsubs.length / this.itemsPerPage);
        },
    },

    methods: {
        ...mapMutations(["setUser"]),

        async getDataFromSessionStorage() {
            const data = JSON.parse(sessionStorage.getItem('userData'))
            if (data) {
                this.nic = data.nic
                this.sabha = data.sabha
                this.userLevel = data.userLevel
            }
            let sabhaCode = this.sabha
            
            // Get Income Heads
            this.sabhaIncomeHead = (await axios.get('/allnewvotes/' + this.sabha)).data;
            
            // Get Employees
            let empdata = await axios.get('/sabhaemps/' + sabhaCode)
            this.sabhaEmployees = empdata.data;

            // --- DEBUG START (Initial Load) ---
            let tempResponse = await axios.get('/gettempasign/' + this.sabha);
            console.log("INITIAL TEMP DATA (Page Load):", tempResponse.data);
            if (tempResponse.data.length > 0) {
                console.log("KEYS IN DATA:", Object.keys(tempResponse.data[0]));
            }
            this.assignedsubs = tempResponse.data;
            // --- DEBUG END ---

            this.len = this.assignedsubs.length
            this.savedsubs = (await axios.get('/savedsubs/' + this.sabha + "/" + this.sabha)).data;
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
        matchName(nic) {
            let sabaemps = axios.get('/employee/' + nic)
            let empName = sabaemps.emp_name;
            return empName
        },

        async deleteAssigned(id) {
            this.id = (await axios.get('/gettempasign/' + this.sabha)).data
            await axios.delete("/singlesubdelete/" + id);
            this.$refs.alert.showAlert('success', 'Record deleted!')
            this.assignedsubs = (await axios.get('/gettempasign/' + this.sabha)).data

        },

        async deleteSubject(ssid) {
            let result = confirm("Confirm Delete?")
            if (result == true) {
                // window.alert('Confirm Delete?')
                await axios.delete("/deletasignsub/" + ssid);
                this.$refs.alert.showAlert('success', 'Assigned Subject Deleted!')
                // this.savedsubs= (await axios.get('/savedsubs/'+this.sabha)).data;
                this.savedsubs = (await axios.get('/savedsubs/' + this.sabha + "/" + this.sabha)).data;
            }

        },
        // Save subjects to emp_sb_rates table
        async saveSubjects() {
            this.len = this.assignedsubs.length
            for (let i = 0; i < this.len; i++) {
                let data = {
                    emp_prs_code: this.sabha,
                    system_type: this.assignedsubs[i].h_id,
                    emp_sb_rates: this.assignedsubs[i].emp_sb_rates,
                    sb_emp_nic_main: this.assignedsubs[i].sb_emp_nic_main,
                    sb_emp_name_main: this.assignedsubs[i].sb_emp_name_main,
                    sb_emp_nic_ac1: this.assignedsubs[i].sb_emp_nic_ac1,
                    sb_emp_name_ac1: this.assignedsubs[i].sb_emp_name_ac1,
                    sb_emp_nic_ac2: this.assignedsubs[i].sb_emp_nic_ac2,
                    sb_emp_name_ac2: this.assignedsubs[i].sb_emp_name_ac2,
                    subjecttype: this.assignedsubs[i].subjecttype
                }
                await axios.post("/savesubs/", data)
                this.$refs.alert.showAlert('success', 'Records added Successfully!')
                this.savedsubs = (await axios.get('/savedsubs/' + this.sabha + "/" + this.sabha)).data;

            }
            //delete tempory table records 
            await axios.delete("/deletsubs/");
            this.assignObj.headid = "",
                this.assignObj.emp = "",
                this.assignObj.iAct1 = 0,
                this.assignObj.iAct2 = 0,
                this.assignedsubs = (await axios.get('/gettempasign/' + this.sabha)).data
        },
        //Form handle
        resetCheckErr2: function () {
            this.errAssignObj.empErr = [];
            this.errAssignObj.iheadErr = [];
            this.errAssignObj.subtyErr = [];

        },
        checkEmptyErr2: function () {
            for (var typeErr in this.errAssignObj) {
                if (this.errAssignObj[typeErr].length != 0) {
                    return false;
                }
            }
            return true;
        },
        checkForm2: function () {
            this.resetCheckErr2();

            if (!this.assignObj.emp) {
                this.errAssignObj.empErr.push("Employess is required");
            }
            if (!this.assignObj.subjecttype) {
                this.errAssignObj.subtyErr.push("required");
            }
            if (!this.assignObj.headid) {
                this.errAssignObj.iheadErr.push("Income head is required");
            }


        },
        async tempsave(e) {
            this.checkForm2();

            if (!this.checkEmptyErr2()) {
                e.preventDefault();
                this.$refs.alert.showAlert('error', 'Something Went Wrong')
            } else {
                // e.preventDefault();
                //assign name to subject in temp table
                let one = (await axios.get('/employee/' + this.assignObj.emp)).data
                this.subName = one.emp_name

                //assign name to acting1 subOnename

                let two = (await axios.get('/employee/' + this.assignObj.iAct1)).data
                this.subOnename = two.emp_name

                //assign name to acting2 

                let three = (await axios.get('/employee/' + this.assignObj.iAct2)).data
                this.subTwoname = three.emp_name
                this.hID = 0 //
                let data = {
                    emp_prs_code: this.sabha,
                    emp_sb_rates: this.assignObj.headid,
                    system_type: this.hID,
                    sb_emp_nic_main: this.assignObj.emp,
                    sb_emp_name_main: this.subName,
                    sb_emp_nic_ac1: this.assignObj.iAct1,
                    sb_emp_name_ac1: this.subOnename,
                    sb_emp_nic_ac2: this.assignObj.iAct2,
                    sb_emp_name_ac2: this.subTwoname,
                    subjecttype: this.assignObj.subjecttype,
                }
                await axios.post("/temporyassign/", data)
                
                // --- DEBUG START (After Assign) ---
                console.log("FETCHING UPDATED LIST...");
                let updateResponse = await axios.get('/gettempasign/' + this.sabha);
                console.log("UPDATED TEMP DATA:", updateResponse.data);
                if (updateResponse.data.length > 0) {
                    console.log("KEYS IN UPDATED DATA:", Object.keys(updateResponse.data[0]));
                }
                this.assignedsubs = updateResponse.data;
                // --- DEBUG END ---

                //clear 2nd form values
                this.assignObj.headid = "",
                    this.assignObj.emp = "",
                    this.assignObj.iAct1 = 0,
                    this.assignObj.iAct2 = 0


            }

        },


    },
    components: {
        VueBasicAlert
    }

};

</script>


<style scoped>
h4 {
    font-size: medium;
}

input[type="button"] {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
}

.tablrow {
    padding-left: 1%;
}

.ttable {

    width: 98%;
    border-width: 2px;
    border-color: #130f40;
    /* border-style: solid; */
    font-size: 1.2rem;
    /* background-color :white; */
    /* padding-left: 3rem; */
    /* height: 3rem; */

}

th {
    text-align: center;
}

.ttable,
th,
td {
    border: 1px solid;
}

.unselect-btn:active,
.unselect-btn:focus,
.action-btn:active,
.action-btn:focus {
    border: none;
    outline: none;
}

hr {
    border-top: 3px solid #057835fa;
    width: 100%;
}

.unselect-btn {
    background: transparent;
    padding-right: 10px;
    cursor: pointer;
    color: inherit;
    display: none;
}


.filter-section {
    width: inherit;
}

.filter-heading {
    padding-top: 30px;
}

.filter-heading h1 {
    color: #27ae60;
}

.filter-option {
    list-style-type: none;
    width: inherit;
}

.filter-option label {
    width: 100%;
    font-size: 15px;
    padding: 3px 0px;

}


.search-box {
    width: 100%;
    justify-content: center;
    position: relative;
    display: flex;
}

/* customer tab below */
.search-input {
    margin: 0;
    width: 100%;
    height: 40px;
    font-size: 20px;
    color: white;
    background: #5e5c5cda;
    text-align: center;
    /* background: #27ae60; #8b307fda; */

}

::placeholder {
    color: white;
}



.filter-drop-down {
    display: none;
}

@media (min-width: 576px) {

    .filter-heading,
    .filter-section {
        display: block !important;
    }
}



@media (max-width: 576px) {

    .search-box,
    .filter-heading,
    .filter-section {
        width: auto;
    }

    .filter-option {
        width: 100%;
    }

    .filter-drop-down {
        display: block;
        background-color: #27ae60;
        color: white;
        font-weight: 400;
        margin-bottom: 15px;
        margin-top: 15px;

    }

    .filter-drop-down p {
        font-size: 20px;
        padding: 5px 0px;
        margin: 0;
        display: flex;
        justify-content: space-between;
    }

    .filter-drop-down p span {
        font-size: 20px;
        padding-right: 10px;
        text-transform: lowercase;
        font-weight: 300;
    }

    .filter-heading,
    .filter-section {
        display: none;
    }

    .menu-tabs .menu-tab-item {
        font-size: 12px !important;
        padding: 5px 20px !important;
    }

    .menu-section .action-row {
        font-size: 16px !important;
    }

    .menu-section .action-row span {
        margin-right: 5px;
    }

    .menu-section .box-container .box .image img {
        height: 10rem;
    }

    .menu-section .box-container .box .desc p,
    .menu-section .box-container .box .content .stars {
        font-size: 10px !important;
    }

    .menu-section .box-container .box .content h3 {
        font-size: 14px !important;
        height: 28px;
    }
}

/* new */

.admin-container {
    background-color: #fff;
    height: 100vh;
    padding: 2rem 9%;
    font-size: 16px;
}

.project-list>tbody>tr>td {
    padding: 12px 8px;
    font-size: small;
}

.project-list>tbody>tr>td .avatar {
    width: 22px;
    border: 1px solid #CCC;
}

.table-responsive {
    margin-top: 20vh;
    height: auto;
    padding: 8px 90px;
}

.action-btn,
.cancel-btn,

.order-section form .row .input-box {
    width: 49%;
    padding: 1.8rem 0;
}

.order-section form .row .p {
    font-size: 1rem;
    color: rgb(243, 47, 47);

}

/* newly added from income heads */
.register-container {
    padding: 2rem 2%;
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
    font-size: 1.2rem;
    margin: 0;
    padding: 0;
    float: left;
}

.register-container .register-form-container form span {
    font-size: 18px;
    padding-left: 5px;
    padding-right: 40px;
    display: block;
    overflow: hidden;

}

.register-container .register-form-container form .btn {
    /* margin: 1rem 0; */
    width: 100%;
    text-align: center;
    background-color: #4e0707;
    height: 30px;
    font-size: 1.0rem;
}

.register-container .register-form-container form p {
    padding-top: 1rem;
    font-size: 1.5rem;
    color: #e23838;
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

.register-container .register-form-container form .row .error-mess {
    font-size: 1.5rem;
    position: relative;
    color: rgb(243, 47, 47);
    margin: 0;
    padding: 0;
}

/* shroff form container */
.shroff-container {
    background-color: #ffffff09;
    /* height: 50vh; */
    padding: 2rem 2%;
    font-size: 16px;
    min-height: 72.3vh;
    padding-top: 0%;
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
    float: left;
}

.shroff-container .shroff-form-container form span {
    font-size: 18px;
    padding-left: 5px;
    padding-right: 40px;
}

.shroff-container .shroff-form-container form .btn {
    margin: 1rem 0;
    width: 100%;
    text-align: center;
    font-size: small;
    background-color: #4e0707;
    height: 3.1rem;
    color: #f7f7f7;


}

.shroff-container .shroff-form-container form .table {
    /* margin: 1rem 0; */
    width: 100%;
    text-align: center;
    font-size: small;
    /* background-color : #e9e4e9; */
    height: auto;

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
    /* padding-left: 3rem; */

}

.shroff-container .shroff-form-container form p {
    padding-top: 1rem;
    font-size: 1.5rem;
    color: rgb(243, 47, 47);
    margin: 0;
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