<template>
  <FormFieldTemplate
    :label="label"
    :required="required"
    :note="note"
    :info="info"
  >
    <b-form-input :value="modelValue" @input="updateInput"></b-form-input>
  </FormFieldTemplate>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
    // input value
    modelValue: String,
  },
  methods: {
    updateInput(newValue: String) {
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>

<style scoped></style>
