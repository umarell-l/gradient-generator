import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createPersistedState } from "pinia-persistedstate-plugin";
import App from './App.vue'
import '@/assets/base.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(createPersistedState())
app.use(pinia)
app.mount('#app')
