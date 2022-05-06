<template>
  <div id="form-container">
    <div id="pdf-form-div" style="margin: 40px">
      <h4 style="margin-bottom: 24px">Field Verification submission form</h4>
      <div class="accordion" role="tablist">
        <InstructionSection />
        <ContactSection :data="contactData" />
        <FieldObsSection
          :inputData="fieldObsInputData"
          :selectData="fieldObsSelectData"
          :cutBlockData="fieldObsBlockData"
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
import axios from "axios";
import InstructionSection from "./InstructionSection.vue";
import ContactSection from "./ContactSection.vue";
import FieldObsSection from "./FieldObsSection.vue";
import AttachSection from "./AttachSection.vue";
import { sendEmail } from "../../api/OldGrowthRequest";
import { backendUrl } from "../../coretypes/AppType";
import { CodeDescr } from "../../coretypes/CodeDescrType";

import {
  contactData,
  fieldObsInputData,
  fieldObsSelectData,
  fieldObsBlockData,
} from "./FieldVerificationSubmissionData";

export default defineComponent({
  components: {
    InstructionSection,
    ContactSection,
    FieldObsSection,
    AttachSection,
  },
  data() {
    return {
      contactData,
      fieldObsInputData,
      fieldObsSelectData,
      fieldObsBlockData,
    };
  },
  methods: {
    generateReport() {
      var element = document.getElementById("pdf-form-div");

      // display all the hidden content
      document.getElementById("header-form-contact")!.click();
      document.getElementById("header-form-field-obs")!.click();
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

          if (
            fileContent !== ""
            // &&
            // this.tenureSelectData.modelValue &&
            // this.tenureSelectData.modelValue !== ""
          ) {
            sendEmail(
              "An Old Growth Field Observation form and package is attached.",
              [
                {
                  content: fileContent,
                  contentType: "application/pdf",
                  encoding: "base64",
                  filename: "field_verification_form.pdf",
                },
              ],
              ["catherine.meng@gov.bc.ca"] // this.tenureSelectData.modelValue
            );
          } else {
            console.log("Failed to convert webform to pdf");
          }
        });

      // // if want to access the form data, could just read by
      //console.log("form data licensee section", this.tenureGridData);
    },
    getNaturalResourceDistricts() {
      axios.get(backendUrl + "/naturalResourceDist").then((response) => {
        let naturalResourceDistCodes: CodeDescr[] = [];

        //console.log("response: ", response.data);

        Object.keys(response.data).forEach((key) => {
          let nrd = new CodeDescr();
          nrd.value = response.data[key].code;
          nrd.text = response.data[key].description;
          naturalResourceDistCodes.push(nrd);
        });

        this.tenureSelectData.options = naturalResourceDistCodes;
      });
    },
  },
  beforeMount() {
    this.getNaturalResourceDistricts();
  },
});
</script>

<style scoped>
#form-container {
  text-align: left;
  /* margin: 40px; */
}
</style>
