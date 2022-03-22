<template>
  <div style="height: 100vh">
    <div style="height: 60px; background: #036; display: flex" />
    <div
      style="
        position: fixed;
        height: calc(100vh - 61px);
        width: 58px;
        background: #0050a1;
        top: 61px;
      "
    />
    <div
      style="
        height: calc(100vh - 62px);
        margin-top: 2px;
        left: 60px;
        width: calc(100vw - 60px);
        position: relative;
      "
    >
      <AppMap />
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import AppMap from "./AppMap.vue";
import "leaflet/dist/leaflet.css";

export default defineComponent({
  components: {
    AppMap,
  },
});
</script>

<style></style>
