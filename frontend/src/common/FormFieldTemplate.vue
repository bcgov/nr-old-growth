<template>
  <div style="margin-bottom: 24px">
    <FormFieldTitle
      v-if="props.label"
      :label="props.label"
      :required="props.required"
      :tooltip="props.tooltip"
    />
    <slot />
    <p v-if="props.note" class="form-field-note">
      <span v-html="note"></span>
    </p>
  </div>
</template>

<script setup lang="ts">
import FormFieldTitle from "./FormFieldTitle.vue";

const props = defineProps({
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
    default: null,
  },
});
</script>
<script lang="ts">
export default {};
</script>

<style scoped>
.form-field-note {
  color: gray;
  font-size: 12px;
  margin-top: 2px;
}
</style>
