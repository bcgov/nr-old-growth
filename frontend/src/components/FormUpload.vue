<template>
  <FormFieldTemplate
    :label="label"
    :required="required"
    :note="note"
    :info="info"
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
      File: {{ file.name }} Uploaded successfully
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
import { defineComponent, Proptype } from "vue";
import FormFieldTemplate from "./FormFieldTemplate.vue";

export default defineComponent({
  name: "FormInput",
  components: {
    FormFieldTemplate,
  },
  props: {
    // form field template props (optional): label, required, info, note
    label: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    info: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
    // files data got from parent component through v-model
    modelValue: Array as Proptype<Array<File>>,
  },
  data() {
    return {
      rows: [] as Array<File>,
    };
  },
  methods: {
    handleChange(e: Event | any) {
      // const newModelValue = this.modelValue;
      if (e.target.files && e.target.files) {
        console.log("e", e.target.files);
        e.target.files.forEach((f: File) => {
          // console.log(f);
          // newModelValue.push(f);
          this.rows.push(f);
        });
      }
      // console.log("newModelValue", newModelValue);
      console.log("this.rows", this.rows);
      // this.$emit("update:modelValue", newModelValue);
    },
    deleteFile(index: number) {
      const newRows = this.rows.filter((m, i) => i !== index);
      this.rows = newRows;
    },
  },
});
</script>

<style scoped></style>
