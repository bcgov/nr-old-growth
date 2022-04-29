<template>
  <div id="form-container">
    <div id="pdf-form-div" style="margin: 40px">
      <h4 style="margin-bottom: 8px">Field Verification submission form</h4>
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
    <b-button
      variant="outline-primary"
      style="margin-left: 40px; margin-right: 40px"
      @click="generateReport()"
    >
      Submit
    </b-button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import html2pdf from "html2pdf.js";
import axios from "axios";
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
} from "./FieldVerificationSubmissionData";

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

      // // display all the hidden content
      // document.getElementById("form-licensee")!.style.display = "block";
      // document.getElementById("form-submitter")!.style.display = "block";
      // document.getElementById("form-tenure")!.style.display = "block";
      // document.getElementById("form-attachment")!.style.display = "block";

      // // download pdf format of the web form
      // html2pdf().from(element).save();

      // save pdf web form to a variable
      html2pdf()
        .from(element)
        .toPdf()
        .output("datauristring")
        .then(function (pdfAsString: string) {
          // The PDF has been converted to a Data URI string and passed to this function.
          // Use pdfAsString however you like (send as email, etc)! For instance:
          console.log("doc", pdfAsString);
        });

      // test api call
      axios.get(`/api/client`).then((response) => {
        console.log("client", response.data);
      });

      // // if want to access the form data, could just read by
      //console.log("form data licensee section", this.tenureGridData);
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
