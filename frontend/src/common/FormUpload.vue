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
      File: {{ file.filename }} Uploaded successfully
      <b-button
        variant="outline-primary"
        class="btn-sm"
        style="margin-left: 16px"
        @click="deleteFile(index)"
        >Remove</b-button
      >
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
    };
  },
  methods: {
    handleChange(e: Event | any) {
      if (e.target.files && e.target.files) {
        e.target.files.forEach((f: File) => {
          this.getBase64(f).then((data) => {
            const formattedFile = this.formatFileData(data);
            if (formattedFile) {
              this.rows.push({
                ...formattedFile,
                filename: f.name,
              });
            }
          });
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
