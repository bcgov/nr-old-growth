import { createApp } from "vue";
import VueKeycloakJs from "@dsb-norge/vue-keycloak-js";
import App from "./App.vue";
import BootstrapVue3 from "bootstrap-vue-3";
import { BootstrapIconsPlugin } from "bootstrap-icons-vue";
import type { KeycloakInstance } from "keycloak-js";
import type { VueKeycloakInstance } from "@dsb-norge/vue-keycloak-js/dist/types";

// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

const app = createApp(App);
app.use(BootstrapIconsPlugin);
app.use(BootstrapVue3);

app
  .use(VueKeycloakJs, {
    init: {
      // Use 'login-required' to always require authentication
      // If using 'login-required', there is no need for the router guards in router.js
      onLoad: "login-required",
      // onLoad: "check-sso",
      // silentCheckSsoRedirectUri:
      //   window.location.origin + "/silent-check-sso.html",
    },
    config: {
      url: "https://dev.oidc.gov.bc.ca",
      clientId: "nrog",
      realm: "Ichqx89w",
    },
    onReady(keycloak: KeycloakInstance) {
      console.log("Keycloak ready", keycloak);
    },
  })
  .mount("#app");

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $keycloak: VueKeycloakInstance;
  }
}
