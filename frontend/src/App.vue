<template>
  <div>
    <MainHeader />
    <b-container style="margin-top: 40px !important">
      <p>
        Field Verification Form for IDIR User:
        <a
          href="https://chefs.nrs.gov.bc.ca/app/form/submit?f=b15b1975-3caa-4984-a183-471c5610c8a5"
          >https://chefs.nrs.gov.bc.ca/app/form/submit?f=b15b1975-3caa-4984-a183-471c5610c8a5</a
        >
      </p>
      <p>
        Field Verification Form for BCEID User:
        <a
          href="https://chefs.nrs.gov.bc.ca/app/form/submit?f=e4591d9b-9005-4bd6-8145-2c92ce890d91"
          >https://chefs.nrs.gov.bc.ca/app/form/submit?f=e4591d9b-9005-4bd6-8145-2c92ce890d91</a
        >
      </p>
    </b-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainHeader from "./common/MainHeader.vue";

export default defineComponent({
  name: "App",
  components: {
    MainHeader,
  },
  data() {
    return {};
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
