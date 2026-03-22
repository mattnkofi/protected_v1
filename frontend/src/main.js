import { createApp } from "vue";
import App from "./App.vue";
import router from "@router";
import { createPinia } from "pinia";
import "./style.css";
import "leaflet/dist/leaflet.css";

// import '@fullcalendar/daygrid/index.css'
// import '@fullcalendar/timegrid/index.css'

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
