import { reactive } from "vue";
import type { FormUploadFileType } from "../coretypes/AppType";

// global app state
export const store = reactive({
  // form upload files
  formUploadFiles: [] as Array<FormUploadFileType>,
  updateFormUploadFiles(newFile: Array<FormUploadFileType>) {
    this.formUploadFiles = newFile;
  },
  testEmail: "" as String,
  updateTestEmail(newValue: String) {
    this.testEmail = newValue;
  },
});
