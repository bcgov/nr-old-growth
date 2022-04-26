<template>
  <FormFieldTemplate
    :label="label"
    :required="required"
    :note="note"
    :info="info"
  >
    <label
      v-for="(option, index) in options"
      :key="index"
      style="display: block"
    >
      <input
        type="radio"
        :value="option.value"
        @input="updateValue"
        :checked="option.value == modelValue"
        :name="name"
      />
      {{ option.label }}
    </label>
  </FormFieldTemplate>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import FormFieldTemplate from "./FormFieldTemplate.vue";

export default defineComponent({
  name: "FormRadio",
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
      default: "",
    },
    options: Array as PropType<Array<{ value: string; label: string }>>,
    name: {
      type: String,
      default: "radio-input", // has to be unique when using multiple radio group
    },
  },
  methods: {
    updateValue(event: any) {
      this.$emit("update:modelValue", event.target.value);
    },
  },
});
</script>

<style scoped></style>
