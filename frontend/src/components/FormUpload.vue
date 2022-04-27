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
    // files data
    modelValue: Array as Proptype<Array<File>>,
  },
  data() {
    return {
      rows: [] as Array<File>,
    };
  },
  methods: {
    handleChange(e: Event | any) {
      const newModelValue = this.modelValue;
      if (e.target.files && e.target.files) {
        console.log("e", e.target.files);
        e.target.files.forEach((f) => {
          // console.log(f);
          newModelValue.push(f);
        });
      }
      console.log("newModelValue", newModelValue);
      // this.$emit("update:modelValue", newModelValue);
    },
  },
});
</script>

<style scoped></style>
