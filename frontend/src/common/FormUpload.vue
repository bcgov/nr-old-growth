<template>
  <FormFieldTemplate
    :label="label"
    :required="required"
    :note="note"
    :tooltip="tooltip"
  >
    <input
      ref="file"
      class="form-control"
      type="file"
      id="formFileMultiple"
      multiple
      @change="handleChange"
    />
    <div
      v-for="(file, index) in rows"
      :key="'file' + index"
      style="margin-top: 16px"
    >
      <text style="font-weight: bold">File Name:</text> {{ file.filename }},
      <text style="font-weight: bold">Size:</text> {{ file.filesize }} KB
      <text style="color: forestgreen">Uploaded successfully </text>
      <b-button
        variant="outline-primary"
        class="btn-sm"
        style="margin-left: 16px; float: right"
        @click="deleteFile(index)"
        >Remove</b-button
      >
    </div>
    <div
      v-for="(file, index) in singeSizeError"
      :key="'file' + index"
      style="margin-top: 16px"
    >
      <text style="font-weight: bold">File Name:</text> {{ file.filename }},
      <text style="font-weight: bold">Size:</text> {{ file.filesize }} KB
      <text style="color: red">Faild to upload, file size exceeds 20MB </text>
    </div>
    <div
      v-for="(file, index) in totalSizeError"
      :key="'file' + index"
      style="margin-top: 16px"
    >
      <text style="font-weight: bold">File Name:</text> {{ file.filename }},
      <text style="font-weight: bold">Size:</text> {{ file.filesize }} KB
      <text style="color: red"
        >Faild to upload, total file size exceeds 100MB
      </text>
    </div>
  </FormFieldTemplate>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { store } from "../helpers/AppState";
import FormFieldTemplate from "./FormFieldTemplate.vue";

export default defineComponent({
  name: "FormUpload",
  components: {
    FormFieldTemplate,
  },
  props: {
    // form field template props (optional): label, required, tooltip, note
    label: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    tooltip: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      rows: store.formUploadFiles,
      totalSizeError: [],
      singeSizeError: [],
      totalFileSize: 0,
    };
  },
  methods: {
    handleChange(e: Event | any) {
      this.totalSizeError = [];
      this.singeSizeError = [];
      // todo: if want to check duplicate files
      if (e.target.files && e.target.files) {
        e.target.files.forEach((f: File) => {
          // file size returns in bytes, convert to mb, each file size needs to be less than 20 mb
          if (f.size <= 1000000 * 20) {
            // total file size needs to be less than 100mb
            if (this.totalFileSize + f.size < 1000000 * 20 * 5) {
              this.totalFileSize = this.totalFileSize + f.size;
              this.getBase64(f).then((data) => {
                const formattedFile = this.formatFileData(data);
                if (formattedFile) {
                  this.rows.push({
                    ...formattedFile,
                    filename: f.name,
                    filesize: f.size,
                  });
                }
              });
            } else {
              this.totalSizeError.push({ filename: f.name, filesize: f.size });
            }
          } else {
            this.singeSizeError.push({ filename: f.name, filesize: f.size });
          }
        });
      }
      store.updateFormUploadFiles(this.rows);
    },
    deleteFile(index: number) {
      const newRows = this.rows.filter((m, i) => i !== index);
      this.rows = newRows;
      store.updateFormUploadFiles(this.rows);
    },
    getBase64(file: File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    },
    formatFileData(filestring: string) {
      const fileData = filestring.split(";");
      if (fileData.length > 1) {
        const fileType = fileData[0].split(":")[1];
        const fileEncode = fileData[1].split(",")[0];
        const fileContent = fileData[1].split(",")[1];

        return {
          content: fileContent,
          contentType: fileType,
          encoding: fileEncode,
        };
      }
      return null;
    },
  },
});
</script>

<style scoped></style>
