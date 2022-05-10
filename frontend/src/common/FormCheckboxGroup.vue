<template>
  <FormFieldTemplate
    :label="label"
    :required="required"
    :note="note"
    :tooltip="tooltip"
  >
    <label
      v-for="(option, index) in options"
      :key="index"
      style="display: block; text-align: left"
    >
      <input
        type="checkbox"
        :value="option.value"
        @input="updateValue"
        :checked="modelValue?.includes(option.value)"
        :name="name"
      />
      {{ option.text }}
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
    // selected options got from parent component through v-model
    modelValue: Array as PropType<Array<String>>,
    options: {
      type: Array as
        | PropType<Array<{ value: string; label: string }>>
        | undefined,
      required: true,
      default: [{ value: 1, label: "Option 1" }],
    },
    // radio group name, has to be unique when using multiple radio groups
    name: {
      type: String,
      default: "radio-input",
    },
  },
  methods: {
    updateValue(event: any) {
      let newModelValue = this.modelValue;
      if (newModelValue?.includes(event.target.value)) {
        newModelValue = newModelValue.filter((m) => m != event.target.value);
      } else {
        newModelValue?.push(event.target.value);
      }
      this.$emit("update:modelValue", newModelValue);
    },
  },
});
</script>

<style scoped></style>
