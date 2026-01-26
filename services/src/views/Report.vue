<template>
    
    <div class="heading">
        <span>
                Report     
        </span> 


    
    </div>
    <div class="row">
               <table class="table colored-header datatable project-list" >
               <thead>
                   <tr>   
                       <th>Invoice Number</th>
                       <th>Income head</th>
                       <th>Description</th>
                       <th>Amount</th>
                      <th>stamp</th>
                       <th>Discounts</th>
                       <th>Vat(%)</th>
                       
                   </tr>
               </thead>
               <tbody>
                   <tr v-for=" r in allreceipt" :key="r.id">

                       <td>{{  }}</td>
                       <td>{{  }}</td>
                       <td>{{  }}</td>
                       <td>{{ }}</td>
                       <td>{{  }}</td>
                       <td>{{ }}</td>
                       <td>{{ }}</td>
                     
                   </tr>
               </tbody>
           </table>
           </div>   
</template>
<script>
import axios from 'axios';
export default {
    name: 'Report',

    data() {
       return {
            nic:"",
            sabha: "",
            userLevel:"",
            sabhaIncomeHead : undefined,
            subObj:{headid:""},
            allIncomeHead:[],
            rate:"",
       };
    },
created() {
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
           let sabhaCode = this.sabha
           let Sabhadata = await axios.get('/subheads/'+ this.nic +"/"+ sabhaCode)
           this.sabhaIncomeHead = Sabhadata.data
       
       },
    },


    }
</script>
<style>
 .table {
   /* margin: 1rem 0; */
   width: 100%;
   text-align: center;
   font-size: small;
   background-color : #e9e4e9;
    /* height: 3rem; */
   
}
</style>