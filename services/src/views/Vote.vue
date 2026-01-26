<template>
    <vue-basic-alert :duration="300" :closeIn="2000" ref="alert" />
    <div class="register-container">
        <div class="register-form-container">
            <form id="addIncomeHeadForm" @submit="handleSubmit" novalidate autocomplete="off">
                <div class="heading">
                    <!-- <span></span>
                    <h4><b>ආදායම් ශීර්ෂ</b></h4> -->
                 <h3><b>Create New Income Heads</b></h3>
                </div>
            
                    <!-- Load income heads here to get heid id -->
            <div >
                <div class="form-group">
                    <label for="iHead"><b>Program:</b>
                    </label>

                       <div><select v-model="registerObj.prog" id="iHead" class="form-control" >
                            <option value="" selected disabled>
                                 Choose
                             </option>
                            <option v-for="p in progs" :key="p.program_id" id="Hid"  
                            v-bind:value =p.program_id>

                              {{ p.program_en}} - {{p.program_sin}}
                            </option>
                        </select>
                     </div> 
                    <p class="error-mess" v-if="errorObj.proErr.length > 0">{{ errorObj.proErr[0] }}</p>
                </div>
                <div class="row">
                    <div class="col-sm-4">
                <div class="form-group" id="mmc">
                    <label for="iHeadt"><b>Project:</b>
                    </label>

                       <div><select @click="showProjName()" v-model="registerObj.proj" id="iHeadt" class="form-control">
                       
                            <option  selected>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                            <option>9</option>
                        </select>
                     </div> 
                    <!-- <p class="error-mess" v-if="errorObj.projErr.length > 0">{{ errorObj.projErr[0] }}</p> -->
                </div>
                </div>
                <div class="col-sm-8">
                <div class="form-group" id="proname">
                    <label for="iCode"><b>Project Name:</b>
                    </label>
                    <input type="text" name="proName" placeholder="Project Name" id="proName" class="form-control"
                        v-model="registerObj.projname" />
                    <p class="error-mess" v-if="errorObj.proNameErr.length > 0">{{ errorObj.proNameErr[0] }}</p>
                </div>
                </div>
                </div>
                <div class="form-group">
                    <label for="iHead"><b>Program Head:</b>
                    </label>

                       <div><select v-model="registerObj.proghead" id="iHead" class="form-control" @change="getIncomeHradID()">
                            <option value="" selected disabled>
                                 Choose
                             </option>
                            <option v-for="p in progheads" :key="p.id" id="pid"  
                            v-bind:value =p.id>

                               {{ p.p_head_des_en}} - {{p.p_head_des_sin}}
                            </option>
                        </select>
                     </div> 
                    <p class="error-mess" v-if="errorObj.proheadErr.length > 0">{{ errorObj.proheadErr[0] }}</p>
                </div>
            </div>
                <div class="form-group">
                    <div class="row">
                        <div class="col-sm-4">
                       
                    <label for="iCode"><b>Income Head Code:</b>
                    </label>
                    <input type="text" name="iCode" placeholder="your code for Income Head" id="iCode" class="form-control"
                        v-model="registerObj.sb_rate_head" />
                    <p class="error-mess" v-if="errorObj.headErr.length > 0">{{ errorObj.headErr[0] }}</p>
                        </div>
                        <div class="col-sm-8">
                            <label for="iCode"><b>Income Head Name:</b>
                    </label>
                    <input type="text" name="iCodes" placeholder="Income Head Name" id="iCode" class="form-control"
                        v-model="registerObj.rname" />
                    <p class="error-mess" v-if="errorObj.nameerr.length > 0">{{ errorObj.nameerr[0] }}</p>
                        </div>
                        </div>

                    
                </div>
             

                <div class="form-group">
                            <div class="row">
                        <div class="col-sm-4">
                            <input type="submit" value="Save" class="btn" />
                            </div>
                            </div>       
                </div>
           <!-- table -->
           <br>
 <div class="heading">
           <b><h3>Sabha Votes</h3></b>
         </div>
        <div class="row tablrow">
        
            <table class="ttable" >
                <thead>
                    <tr>
                        <th>Index</th>
                        <th>Income Head</th>
                        <th>Sabha Vote</th>
                        <th>Type</th>
                        <th>Remove</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for=" (b,index) in paginatedData" :key="index">
                        <td>{{ (currentPage - 1) * 20 + index + 1 }}</td>
                        <td style="text-align: left;">&nbsp;{{ b.sb_rate_head }}</td>
                        <td style="text-align: left;">&nbsp;{{ b.sb_rate_head_name }}</td>
                        <td>{{ b.revenue_type }}</td>
                        <td><router-link to="" @click="deleteIncomehead(b.id)"  class="fas fa-trash-alt"> </router-link></td>
                        <!-- <td><input type="button" @click="deleteIncomehead(b.rate_sb_code,b.rate_head_id,b.sb_rate_head)"  class="fas fa-trash-alt"></td> -->
                    </tr>
                </tbody>
            </table>
           
        </div>
        <button class="fas fa-backward" @click="prevPage($event)" :disabled="currentPage === 1"></button>
             <span>{{ currentPage }} / {{ totalPages }}</span>
            <button class="fas fa-forward" @click="nextPage($event)" :disabled="currentPage === totalPages"></button>
            </form>
        </div>
    </div>

</template>

<script>
import axios from "axios";
import VueBasicAlert from 'vue-basic-alert'
//import { ref } from 'vue'
export default {

    name: "Vote",

    data() {
        return {

            allIncomeHead: [],matchHeadID:[],
            registerObj: { prog:"",proj:100,proghead:"",projname:"", sb_rate:"" ,rname:""},
            errorObj: { proErr:[],projErr:[],proheadErr:[],proNameErr:[], headErr: [] , nameerr:[] },
            matchHead: [],
            ratehead : '',
            nic:"",
            sabha: "",
            userLevel:"",
            sabhaheads:[],
            progs:[],
            progheads:[],
            revenueType:'',
            checktype:'',
            pid:'',
            sabhadetail:[],
            rrr:[],
            itemsPerPage: 20,
            currentPage: 1,
        }
    },

    created() {
        this.getDataFromSessionStorage()
        // this.getAllIncomeHeads()
        
      
    },
    computed:{
        paginatedData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    // Check if this.data is an array before using slice method
    if (Array.isArray(this.sabhaheads)) {
      return this.sabhaheads.slice(startIndex, endIndex);
    } else {
      // Return empty array or handle loading state
      return [];
    }
  },
  totalPages() {
      return Math.ceil(this.sabhaheads.length / this.itemsPerPage);
    },
    },
   
    methods: {
        async getDataFromSessionStorage(){
            const data = JSON.parse(sessionStorage.getItem('userData'))
            if(data){
                            this.nic = data.nic 
                            this.sabha = data.sabha
                            this.userLevel =data.userLevel
                        }
        this.sabhaheads = (await axios.get('/allvotes/'+this.sabha)).data;
        this.progs = (await axios.get('/allprogs/')).data;
        this.progheads = (await axios.get('/allprogheads/')).data;
        // this.checktype =this.progheads[0].revenue_type
        this.sabhadetail= (await axios.get('/pra_sabha/' +this.sabha)).data

        if(this.sabhadetail.council_type=="PRS"){
            document.getElementById("mmc").style.display="none"
            document.getElementById("proname").style.display="none"
        }else{
            document.getElementById("mmc").style.display="block"
            }

            // this.rrr=(await axios.get('/revtype/'+this.registerObj.proghead)).data;
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
        // async getAllIncomeHeads() {
        //      this.allIncomeHead = (await axios.get('/income_heads/')).data;
          
        // },
        async getMatchHead(code,headid,head) {
            let data = await axios.get('/sb_rates/'+code+"/"+headid +"/"+head );
            this.matchHead = data.data;
        },
        async getMatchUser(nic) {
            let data = await axios.get('/employee/' + nic);
            this.matchUser = data.data;
        },
        showProjName(){
         if(this.registerObj.proj==0){
            document.getElementById("proname").style.display="none"
        }else{
            document.getElementById("proname").style.display="block"
            }
        },
       
        async deleteIncomehead(id){
        let result = confirm("Confirm Delete?")
        if(result == true){
// window.alert('Confirm Delete?')
        try{
            await axios.delete("/deletevotenw/"+id);
            this.$refs.alert.showAlert('success', 'Vote Deleted Successfully !')
            this.sabhaheads = (await axios.get('/allvotes/'+this.sabha)).data;
        }
            catch (error) {
             console.error('Error during invoice insertion:', error);

        }
            
        } 
        
       },
        async getIncomeHradID(){
           
            // this.registerObj.sb_rate_head =this.registerObj.prog.concat(this.registerObj.proghead,)
            this.registerObj.proghead
            let rtypearray = (await axios.get('/revtype/'+this.registerObj.proghead)).data;
        this.checktype =rtypearray[0].revenue_type
        this.pid =rtypearray[0].p_head_id
            const prog = this.registerObj.prog ? String(this.registerObj.prog) : '';
    const proghead = this.pid ? String(this.pid) : '';
    let rtype =0; let prtype='';
    if(this.checktype=='income'){
        rtype =3;
        prtype=''
    }else{
        rtype =4;
        prtype='0'
    }
    this.revenueType = rtype ? String(rtype) : '';
    let projectid =''
    if(this.registerObj.proj==100){
        projectid =''
    }else{
        projectid =this.registerObj.proj
    }
    
    if(this.sabhadetail.council_type=="PRS"){
        this.revenueType ="-"
        this.registerObj.sb_rate_head = prog.concat(this.revenueType,prtype,proghead);
    }else if(this.sabhadetail.council_type=="MMC"){
    // Concatenate the values
        this.registerObj.sb_rate_head = prog.concat(projectid,this.revenueType,proghead);
    }else if(this.sabhadetail.council_type=="MC"){
        this.registerObj.sb_rate_head = prog.concat(projectid,this.revenueType,proghead);
    }else{
        this.registerObj.sb_rate_head = "";
    }
        },
        resetCheckErr: function () {
            this.errorObj.proErr = [];
            this.errorObj.proheadErr = [];
            this.errorObj.headErr = [];
            this.errorObj.nameerr = [];
            this.errorObj.projErr=[]

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

            
            if (!this.registerObj.prog) {
                this.errorObj.proErr.push("required");
            }
            if (!this.registerObj.proj) {
                this.errorObj.projErr.push("required");
            }
          
            if (!this.registerObj.proghead){
                this.errorObj.proheadErr.push("required");
            }
            if (!this.registerObj.sb_rate_head){
                this.errorObj.headErr.push("required");
            }
            if (!this.registerObj.rname){
                this.errorObj.nameerr.push("required");
            }

        },
        
        async handleSubmit(e) {
            this.checkForm();


            if (!this.checkEmptyErr()) {
                e.preventDefault();
            } else {
                e.preventDefault();
   
                let headdata = await axios.get('/sb_rates/'+this.sabha+'/'+this.registerObj.sb_rate_head)
                this.matchHeadID=headdata.data
                if (this.matchHeadID.length>0) {
                    // this.errorObj.codeErr.push("Head id already exist")
                    this.$refs.alert.showAlert('error', 'Head id already exist !')
                }
                else {
                    let data = {
                       
                        rate_sb_code : this.sabha ,
                        prog_id:this.registerObj.prog,
                        project_id: this.registerObj.proj,
                        project_name: this.registerObj.projname,
                        program_head: this.registerObj.proghead,
                        sb_rate_head: this.registerObj.sb_rate_head,
                        sb_rate_head_name:this.registerObj.rname,
                        sb_rate:'0',
                        sb_percentage:'0',
                        sb_rate_des:'0'

                        
                    }
                    await axios.post("/savevote/", data)
                    this.$refs.alert.showAlert('success', 'Income head Added Successfully !')
                    document.getElementById("addIncomeHeadForm").reset();
                    this.sabhaheads = (await axios.get('/allnewvotes/'+this.sabha)).data;
                      //this.$router.push("/home");
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

/* new */
.tablrow{
padding-left: 1%;
}
.ttable {
     
     width: 98%;
     border-width:2px;
     border-color : #130f40;
     /* border-style: solid; */
     font-size: 1.2rem;
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
     color: #4e0707;
}

.register-container .register-form-container form .btn {
    margin: 1rem 0;
    width: 100%;
    text-align: center;
    background-color:#4e0707 ;
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