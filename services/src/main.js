import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "@/axios"
import formatNumberPlugin from './plugins/formatNumber';


createApp(App).use(router).use(store).use(formatNumberPlugin).mount('#app')

// npm install vue-router