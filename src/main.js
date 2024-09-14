import './assets/main.scss'

import 'bootstrap';

import { createApp, reactive } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { magicDice } from "./assets/md_magicdie"

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Create a reactive object for $md
const md = reactive(magicDice);

// Expose $md to all components
app.config.globalProperties.$md = md;

app.mount('#app')
