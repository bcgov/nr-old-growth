import { createApp } from "vue";
import App from "./App.vue";
import BootstrapVue3 from "bootstrap-vue-3";
import { BootstrapIconsPlugin } from "bootstrap-icons-vue";

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

const app = createApp(App);
app.use(BootstrapIconsPlugin);
app.use(BootstrapVue3).mount("#app");
