<template>
  <div id="form-container">
    <div id="pdf-form-div">
      <h4 style="margin-bottom: 24px">Field Verification Submission From</h4>
      <div class="accordion" role="tablist">
        <InfoSection />
        <LicenseeSection :data="licenseeData" />
        <SubmitterSection :data="submitterData" />
        <TenureSection :inputData="tenureData" />
      </div>
    </div>
    <button @click="generateReport()">Download</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import html2pdf from "html2pdf.js";
import InfoSection from "./InfoSection.vue";
import LicenseeSection from "./LicenseeSection.vue";
import SubmitterSection from "./SubmitterSection.vue";
import TenureSection from "./TenureSection.vue";
import {
  licenseeData,
  submitterData,
  tenureData,
} from "../../helpers/FieldVerifyFormData";

export default defineComponent({
  components: {
    InfoSection,
    LicenseeSection,
    SubmitterSection,
    TenureSection,
  },
  data() {
    return {
      licenseeData,
      submitterData,
      tenureData,
    };
  },
  methods: {
    generateReport() {
      var element = document.getElementById("pdf-form-div");
      // download pdf format of the web form
      html2pdf().from(element).save();
      // if want to access the form data, could just read by
      console.log("form data licensee section", this.licenseeData);
    },
  },
});
</script>

<style scoped>
#form-container {
  text-align: left;
  margin: 40px;
}
</style>
