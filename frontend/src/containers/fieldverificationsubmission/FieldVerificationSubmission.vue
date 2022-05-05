<template>
  <div id="form-container">
    <div id="pdf-form-div" style="margin: 40px">
      <h4 style="margin-bottom: 8px">Field Verification submission form</h4>
      <p style="color: gray; margin-bottom: 24">All fields are mandatory</p>
      <div class="accordion" role="tablist">
        <LicenseeSection :data="licenseeData" />
        <SubmitterSection :data="submitterData" />
        <TenureSection
          :inputData="tenureInputData"
          :selectData="tenureSelectData"
          :gridData="tenureGridData"
        />
        <AttachSection />
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
import LicenseeSection from "./LicenseeSection.vue";
import SubmitterSection from "./SubmitterSection.vue";
import TenureSection from "./TenureSection.vue";
import AttachSection from "./AttachSection.vue";
import { getClient, sendEmail } from "../../api/OldGrowthRequest";

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
    };
  },
  methods: {
    generateReport() {
      var element = document.getElementById("pdf-form-div");

      // display all the hidden content
      document.getElementById("form-licensee")!.classList.add("show");
      document.getElementById("form-submitter")!.classList.add("show");
      document.getElementById("form-tenure")!.classList.add("show");
      document.getElementById("form-attachment")!.classList.add("show");

      // save pdf web form to a variable
      html2pdf()
        .from(element)
        .toPdf()
        .output("datauristring")
        .then(function (pdfAsString: string) {
          // process pdf string data
          let fileContent = "";
          const fileData = pdfAsString.split(";");
          if (fileData.length > 2) {
            const fileInfo = fileData[2].split(",");
            if (fileInfo.length > 1) {
              fileContent = fileInfo[1];
            }
          }

          if (fileContent !== "") {
            sendEmail(
              "Hello there, attached is a field verification application form",
              [
                {
                  content: fileContent,
                  contentType: "application/pdf",
                  encoding: "base64",
                  filename: "field_verification_form.pdf",
                },
              ],
              ["catherine.meng@gov.bc.ca"]
            );
          } else {
            console.log("Failed to convert webform to pdf");
          }
        });

      // test api call
      getClient();

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
