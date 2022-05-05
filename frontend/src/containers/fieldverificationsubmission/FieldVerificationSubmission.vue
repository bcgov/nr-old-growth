<template>
  <div id="form-container">
    <div id="pdf-form-div" style="margin: 40px">
      <h4 style="margin-bottom: 24px">Field Verification submission form</h4>
      <div class="accordion" role="tablist">
        <InstructionSection />
        <ContactSection :data="contactData" />
        <FieldSection
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
import InstructionSection from "./InstructionSection.vue";
import ContactSection from "./ContactSection.vue";
import FieldSection from "./FieldSection.vue";
import AttachSection from "./AttachSection.vue";
import { getClient, sendEmail } from "../../api/OldGrowthRequest";

import {
  contactData,
  submitterData,
  tenureInputData,
  tenureSelectData,
  tenureGridData,
} from "./FieldVerificationSubmissionData";

export default defineComponent({
  components: {
    InstructionSection,
    ContactSection,
    FieldSection,
    AttachSection,
  },
  data() {
    return {
      contactData,
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
      document.getElementById("header-form-licensee")!.click();
      document.getElementById("header-form-submitter")!.click();
      document.getElementById("header-form-tenure")!.click();
      document.getElementById("header-form-attachment")!.click();

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

          // if (fileContent !== "") {
          //   sendEmail(
          //     "An Old Growth Field Observation form and package is attached.",
          //     [
          //       {
          //         content: fileContent,
          //         contentType: "application/pdf",
          //         encoding: "base64",
          //         filename: "field_verification_form.pdf",
          //       },
          //     ],
          //     ["catherine.meng@gov.bc.ca"]
          //   );
          // } else {
          //   console.log("Failed to convert webform to pdf");
          // }
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
