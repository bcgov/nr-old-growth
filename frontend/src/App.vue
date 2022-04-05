<template>
  <div>
    <MainHeader />
    <b-container>
      <b-row>
        <b-col col sm="1" md="2" lg="2" xl="2">
          <MenuBar @input="getSelectedLayers" />
        </b-col>
        <b-col col sm="11" md="10" lg="10" xl="10">
          <MapViewer />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MainHeader from "./components/MainHeader.vue";
import MapViewer from "./components/MapViewer.vue";
import MenuBar from "./components/MenuBar.vue";
import "leaflet/dist/leaflet.css";
import "./assets/global.css";

export default defineComponent({
  name: "App",
  components: {
    MainHeader,
    MapViewer,
    MenuBar,
  },
  data() {
    return {
      selectedLayers: []
    }
  },
  methods: {
    getSelectedLayers(selectedLayersFromChild) {
      this.selectedLayers = selectedLayersFromChild;
    },
  }
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

.row > * {
  padding: 0px 0px 0px 0px !important;
  margin: 0px 0px 0px 0px !important;
}

.container,
.container-fluid,
.container-xxl,
.container-xl,
.container-lg,
.container-md,
.container-sm {
  padding: 0px 0px 0px 0px !important;
  margin: 0px 0px 0px 0px !important;
  max-width: 98% !important;
}

.col {
  padding: 0px 0px 0px 0px;
  margin: 0px 0px 0px 0px;
}
</style>
