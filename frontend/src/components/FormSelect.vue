<template>
  <FormFieldTemplate
    :label="label"
    :required="required"
    :note="note"
    :info="info"
  >
    <b-form-select
      :value="modelValue"
      :options="options"
      @change="updateValue"
    ></b-form-select>
  </FormFieldTemplate>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FormFieldTemplate from "./FormFieldTemplate.vue";

export default defineComponent({
  name: "FormSelect",
  components: {
    FormFieldTemplate,
  },
  props: {
    label: {
      type: String,
      default: null,
    },
    modelValue: String,
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
      default: null,
    },
    options: Array,
  },
  methods: {
    updateValue(newValue: String) {
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>

<style scoped></style>
