import { reactive } from "vue";

// global app state
export const store = reactive({
  // form upload files
  formUploadFiles: [] as Array<{ [key: string]: any }>,
  updateFormUploadFiles(newFile: Array<{ [key: string]: any }>) {
    this.formUploadFiles = newFile;
  },
});
