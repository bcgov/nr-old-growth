<template>
  <div id="form-container">
    <div id="pdf-form-div" style="margin: 40px">
      <h4 style="margin-bottom: 8px">Field Verification Submission From</h4>
      <p style="color: gray; margin-bottom: 24">All fileds are mandatory</p>
      <div class="accordion" role="tablist">
        <LicenseeSection :data="licenseeData" />
        <SubmitterSection :data="submitterData" />
        <TenureSection
          :inputData="tenureInputData"
          :selectData="tenureSelectData"
          :gridData="tenureGridData"
        />
        <AttachSection :files="attachmentData" />
      </div>
    </div>
    <button
      style="margin-left: 40px; margin-right: 40px"
      @click="generateReport()"
    >
      Download
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import html2pdf from "html2pdf.js";
import LicenseeSection from "./LicenseeSection.vue";
import SubmitterSection from "./SubmitterSection.vue";
import TenureSection from "./TenureSection.vue";
import AttachSection from "./AttachSection.vue";
import {
  licenseeData,
  submitterData,
  tenureInputData,
  tenureSelectData,
  tenureGridData,
} from "../../helpers/FieldVerifyFormData";

export default defineComponent({
  components: {
    LicenseeSection,
    SubmitterSection,
    TenureSection,
    AttachSection,
  },
  data() {
    return {
      licenseeData,
      submitterData,
      tenureInputData,
      tenureSelectData,
      tenureGridData,
      attachmentData: [],
    };
  },
  methods: {
    generateReport() {
      var element = document.getElementById("pdf-form-div");
      // download pdf format of the web form
      document.getElementById("form-licensee")!.style.display = "block";
      document.getElementById("form-submitter")!.style.display = "block";
      document.getElementById("form-tenure")!.style.display = "block";
      document.getElementById("form-attachment")!.style.display = "block";
      html2pdf().from(element).save();
      // if want to access the form data, could just read by
      // console.log("form data licensee section", this.tenureGridData);
    },
  },
});
</script>

<style scoped>
#form-container {
  text-align: left;
  /* margin: 40px; */
}
</style>
