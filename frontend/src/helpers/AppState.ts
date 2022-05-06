import { reactive } from "vue";

// global app state
export const store = reactive({
  // form upload files
  formUploadFiles: [] as Array<{
    content: string;
    contentType: string;
    encoding: string;
    filename: string;
  }>,
  updateFormUploadFiles(
    newFile: Array<{
      content: string;
      contentType: string;
      encoding: string;
      filename: string;
    }>
  ) {
    this.formUploadFiles = newFile;
  },
});
