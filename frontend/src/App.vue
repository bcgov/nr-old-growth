<template>
  <AppContainer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AppContainer from "./components/AppContainer.vue";
import "./assets/global.css";

export default defineComponent({
  name: "App",
  components: {
    AppContainer,
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
</style>
