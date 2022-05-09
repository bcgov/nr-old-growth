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
    ---{{modelValue}}
  </FormFieldTemplate>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { CodeDescr } from "../coretypes/CodeDescrType";
import FormFieldTemplate from "./FormFieldTemplate.vue";

export default defineComponent({
  name: "FormSelect",
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
      default: null,
    },
    // selected option got from parent component through v-model
    modelValue: {},
    options: {
      type: Array as PropType<Array<{ value: string; text: string }>>,
      required: true,
    },
  },
  methods: {
    updateValue(newValue: CodeDescr) {
      alert(newValue);
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>

<style scoped></style>
