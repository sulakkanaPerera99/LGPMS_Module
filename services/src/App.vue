<template>
    <div id="app">
        <div v-if="!user">
            <router-view></router-view>
        </div>
        
        <div v-else class="main-layout">
            
            <MenuBar />
            
            <div class="auth-wrapper">
                <div class="auth-inner">
                    <router-view></router-view>
                </div>
            </div>
            
            <FooterComponent />
        </div>
    </div>
</template>

<script>
// import NavBar from './components/NavBar.vue';
// import SideBar from './components/SideBar.vue';
import MenuBar from './components/MenuBar.vue';
import FooterComponent from './components/FooterComponent.vue';
// import { mapActions } from 'vuex';
import { mapState } from 'vuex';

export default {
    name: 'App',
    components: {
        // NavBar,
        // SideBar,
        MenuBar,
        FooterComponent
    },
    computed: {
        ...mapState(["user"])
    },
}
</script>

<style>
@import "./assets/css/global_style.css";

/* 2. අලුත් CSS කොටස */
.main-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh; /* Screen එකේ සම්පූර්ණ උස ගන්නවා */
}

.auth-wrapper {
    padding-left: 200px; /* ඔබේ Sidebar ඉඩ */
    flex: 1; /* වැදගත්ම කෑල්ල: ඉතුරු වෙලා තියෙන ඔක්කොම ඉඩ මේකට ගන්නවා */
    display: flex; /* auth-inner එක මැදට ගන්න ඕන නම් විතරක් තියන්න */
    flex-direction: column; 
}

/* auth-inner එකත් full height වෙන්න ඕන නම් මේක දාන්න (Optional) */
.auth-inner {
    width: 100%;
    height: 100%;
}
</style>