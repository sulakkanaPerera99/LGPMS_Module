<template>
    <div class="admin-container">
        <div class="d-flex justify-content-between">
            <!-- <h1>Hello {{user.emp_name}}!</h1> -->
           
        </div>

        <!-- ///////////////////////////////////// -->
        <div class="home-main">
        
        <div class="content">
            <span>welcome! | ආයුබෝවන්! {{user.emp_name}} </span>
           
           <br>
           
        </div>

    </div>



    <div  v-if="test==true" id="sessionBlock" class="home-banner">
 
            <div class="grid col">
             
                <div  class="content">
                    
                    <input v-if="loggedin==true" type ="button" @click="startSession()" class="btn" id="buttonstart" value="Start Session">
                    <input v-if="loggedin==false" type ="button" @click="endSession()" class="btn" id="buttonend" value="End Session"  >
                </div>
            </div>
     

          
                
           

            <div class="card-grid">
    <router-link
      v-for="(card, index) in cards"
      :key="index"
      :to="card.link"
      class="card"
      :style="{ backgroundColor: card.bgColor, color: card.textColor }"
    >
      <div class="card-content">
        <img src="@/assets/images/incicon.png" class="card-img" />
        <div class="card-text">
          <h3>{{ card.title }}</h3>
          <p style="font-size: 1.5rem;">{{ card.description }}</p>
        </div>
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
    name: 'Dashboard',

    
    data() {
        return {
            checkday:0,
            test:true,
            statusofdb:[],
            loggedin:true,
            
    
        }
    },
    computed: {
        ...mapState(["user"])
    },
    created() {
        
     
      this.checkSessionState();
         this.checkdate();
    },


    methods: {
        ...mapMutations(["setUser"]),

        
        // async checkSessionState(){
        //     this.statusofdb = (await axios.get('/graterdanfive/'+this.user.emp_prs_code)).data;
        //     if(this.statusofdb[0].status==1){
        //         this.loggedin =false

        //     } else{
        //         this.loggedin=true
        //     }
        // },
        async checkSessionState() {
            const data = JSON.parse(sessionStorage.getItem('userData'))
           if(data){
                           this.nic = data.nic 
                           this.sabha = data.sabha
                           this.userLevel =data.userLevel
                       }
            try {
                const response = await axios.get(`/usergraterdanfive/`+this.sabha+'/'+this.nic);
                this.statusofdb = response.data;

                if (this.statusofdb && this.statusofdb[0]?.status == 1) {
                this.loggedin = false;
                } else {
                this.loggedin = true;
                }
            } catch (error) {
                console.error("Error checking session state:", error);
                this.loggedin = false; // fallback, prevent access if error occurs
            }
        },


        async startSession(){
            // window.alert('Confirm session Start')
            let result = confirm("Confirm ession Start?")
        if(result == true){
            let levid =6
            // let data =1
            let data1 = {
                status: '1',
                    
                };
            // await axios.put("/statchange/"+ levid , data1  ) 
            await axios.put("/statchangeforsabha/"+this.user.emp_prs_code+'/'+levid , data1  )
            this.checkSessionState()
             document.getElementById("buttonstart").style.display='none';
            document.getElementById("buttonend").style.display='block';
        }

            
        },
        async endSession(){
            // window.alert('Confirm Session End?')
            let result = confirm("Confirm ession End?")
        if(result == true){
            
            let levid =6
            // let data =0
            let data2 = {
                status: '0',
                    
                };
            // await axios.put("/statchange/"+ levid , data2  )
            await axios.put("/statchangeforsabha/"+this.user.emp_prs_code+'/'+levid , data2  )
            this.checkSessionState()
            document.getElementById("buttonstart").style.display='block';
            document.getElementById("buttonend").style.display='none';
        }
           
        },
        checkdate(){
        //     // const now= new Date().toLocaleString()
            this.checkday = new Date().getDay()
            if(this.checkday >0 && this.checkday<6){
                this.test =true    
            }
           else{
            this.test=false
           }
          
        },
        // auto session start and end

        // checkTime() {
        //     const now = new Date();
        //     const currentHour = now.getHours();
        //     const currentMinute = now.getMinutes();

        //     // Start session at 8 AM
        //     if (currentHour === 8 && currentMinute === 0) {
        //         if (this.loggedin === true) {
        //             this.startSession();
        //         }
        //     }

        //     // End session at 3 PM
        //     if (currentHour === 15 && currentMinute === 15) {
        //         if (this.loggedin === false) {
        //             this.endSession();
        //         }
        //     }
        // }
         
    }

}
</script>

<style scoped>
.card-grid {
  display: grid;
  /* grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); Responsive grid */
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding-top: 5%;
}

.card {
  display: flex;
  /* align-items: center; */
  text-decoration: none;
  padding: 1px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.02);
}

.card-content {
  display: flex;
  /* align-items: center; */
  align-items: flex-start
}

.card-img {
  width: 30px;
  height: 30px;
  /* margin-right: 10px; */
  flex-shrink: 0;
}

.card-text {
  flex: 1;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}



.card-content {
  padding: 7px;
  text-align: center;
  /* background-image: url('@/assets/images/institution-icon.png') ; */
  
}

.card-content h3 {
  margin: 10px 0;
  font-size: 2.0rem;
}

.card-content p {
  color: #666;
}
.admin-container {
    background-color: #fff;
    /* height: 100vh; */
    padding: 2rem 9%;
    font-size: 16px;
    min-height: 90vh;
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
    background-color: #620a0a;
    margin-right: 10px;
}

.cancel-btn,
.paid-btn {
    background-color: red;
}

.action-btn:hover {
    background-color:  #620a0a;
    
}
/* home.vue's all styles below */
.home-main,
.home-about,
.home-banner,
.home-category {
    padding: 2rem 9%;
}

.home-main {
    display: flex;
    align-items: center;
    flex-wrap: wrap-reverse;
    gap: 2rem;
    position: relative;
    overflow: hidden;
    
}

.home-main .content {
    flex: 1 1 60rem;
    padding-bottom: 2.5rem;
    padding-top: 2.5rem;
    /* min-height: 90vh; */
}

.home-main .content span {
    font-size: 2rem;
    color: #620a0a;
}

.home-main .content h3 {
    font-size: 3rem;
    color: #130f40;
    padding-top: .5rem;
}

.home-main .content p {
    font-size: 1.6rem;
    color: #666;
    line-height: 2;
    padding: 1rem 0;
}

.home-main .image {
    flex: 1 1 41rem;
    margin: 2rem 0;
    pointer-events: none;
}

.home-main .image .home-img {
    width: 100%;
    margin-top: 5rem;
}

.home-main .home-parallax-img {
    position: absolute;
    top: -15rem;
    right: -15rem;
    width: 80vw;

}


/* home category */



/* home banner */

.home-banner .row-banner .content {
    position: absolute;
    top: 50%;
    left: 7%;
    transform: translateY(-50%);
}

.home-banner .row-banner .content span {
    font-family: 'Satisfy', cursive;
    font-size: 2rem;
    color: #620a0a;
    color: #130f40;
}

.home-banner .row-banner .content h3 {
    font-size: 6rem;
    color: red;
    text-transform: uppercase;
}

.home-banner .row-banner .content p {
    font-size: 2rem;
    padding-bottom: 1rem;
}


.home-banner .grid-banner .grid {
    border-radius: 1rem;
    overflow: hidden;
    height: 20rem;
    
}

.home-banner .grid-banner .grid:hover img {
    transform: scale(1.2);
}

.home-banner .grid-banner .grid img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}

.home-banner .grid-banner .grid .content {
    position: absolute;
    top: 2rem;
    padding: 0 2rem;
}


.btn {
    background-color: #620a0a;   
    width: 20rem;
}

.home-banner .grid-banner .grid .content.center {
    text-align: center;
    width: 100%;
}

.home-banner .grid-banner .grid .content.center span {
    color: #ca9206;
}

.home-banner .grid-banner .grid .content.center h3 {
    color: #130f40;
}

.home-banner .grid-banner .grid .content span {
    font-size: 1.5rem;
    color: #fff;
}

.home-banner .grid-banner .grid .content h3 {
    font-size: 1rem;
    color: #fff;
    padding-top: .5rem;
}

.home-about {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2rem;
    background: #f7f7f7;
}

.home-about .image {
    flex: 1 1 40rem;
}

.home-about .image img {
    width: 100%;
}

.home-about .content {

    flex: 1 1 40rem;
}

.home-about .content span {
    font-family: 'Satisfy', cursive;
    font-size: 3rem;
    color: #620a0a;
}

.home-about .content .title {
    font-size: 3rem;
    padding-top: .5rem;
    color: #130f40;
}

.home-about .content p {
    padding: 1rem 0;
    line-height: 2;
    font-size: 1.4rem;
    color: #666;
}

.home-about .content .icons-container {
    margin-top: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
}

.home-about .content .icons-container .icons {
    flex: 1 1 20rem;
    border-radius: .5rem;
    background: #fff;
    box-shadow: 0 1rem 1rem rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
}

.home-about .content .icons-container .icons h3 {
    font-size: 1.7rem;
    color: #130f40;
}

@media (max-width: 768px) {
    #menu-btn {
        display: inline-block;
    }

    .home-main .home-parallax-img {
        top: 0;
        right: 0;
        width: 100%;
    }

    .home-banner .grid-banner .content h3 {
        font-size: 15px !important;
    }

    .home-banner .grid-banner .content.center {
        padding-left: 0px !important;
    }

}

@media (max-width: 576px) {
    .home-main .content h3 {
        font-size: 1rem;
    }

    .home-main .content p {
        font-size: 1.5rem;
    }
}
</style>