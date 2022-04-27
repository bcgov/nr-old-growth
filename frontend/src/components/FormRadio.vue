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
    // selected option got from parent component through v-model
    modelValue: String,
    options: {
      type: Array as PropType<Array<{ value: string; label: string }>>,
      required: true,
    },
    // radio group name, has to be unique when using multiple radio groups
    name: {
      type: String,
      default: "radio-input",
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
