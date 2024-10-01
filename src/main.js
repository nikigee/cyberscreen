import './assets/main.scss'

import 'bootstrap';

import { createApp, reactive } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { magicDice } from "./assets/md_magicdie"
import Activity from "./assets/activitylog"
import AI from "./assets/datafort_access"

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Create a reactive object for $md
const md = reactive(magicDice);
const cyberlog = reactive(new Activity());
const ai = reactive(new AI("http://localhost:3000"));

// convinence quick roll function for app, combining magic dice and the log function
const roll = (input) => {
    const r = md.Dice.x(input);

    md.diceHistory.push(r);

    cyberlog.write(`rolled ${r.dice}, total: ${r.total}`)

    return r;
}

// Expose $md to all components
app.config.globalProperties.$md = md;
app.config.globalProperties.$cyber = cyberlog;
app.config.globalProperties.$roll = roll;
app.config.globalProperties.$ai = ai;

app.mount('#app')
