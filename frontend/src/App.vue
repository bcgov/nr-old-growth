<template>
  <div>
    <MainHeader />
    <b-container>
     <b-row>
        <b-col col md="2"></b-col>
        <b-col col md="10"><MapViewer /></b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainHeader from "./components/MainHeader.vue";
import MapViewer from "./components/MapViewer.vue";
import "leaflet/dist/leaflet.css";
import "./assets/global.css";

export default defineComponent({
  name: "App",
  components: {
    MainHeader,
    MapViewer,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.row {
  padding: 0px 0px 0px 0px;
  margin: 0px 0px 0px 0px;
}

.container, .container-fluid, .container-xxl, .container-xl, .container-lg, .container-md, .container-sm {
  padding: 0px 0px 0px 0px !important;
  margin: 0px 0px 0px 0px !important;
  max-width: 99% !important;
}

.col {
  padding: 0px 0px 0px 0px;
  margin: 0px 0px 0px 0px;
}

</style>
