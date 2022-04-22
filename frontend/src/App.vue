<template>
  <div>
    <MainHeader />
    <b-container>
      <FieldVerifyForm />
    </b-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainHeader from "./containers/MainHeader.vue";
import FieldVerifyForm from "./containers/FieldVerifyForm/FieldVerifyForm.vue";

export default defineComponent({
  name: "App",
  components: {
    MainHeader,
    FieldVerifyForm,
  },
  data() {
    return {};
  },
  methods: {},
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
