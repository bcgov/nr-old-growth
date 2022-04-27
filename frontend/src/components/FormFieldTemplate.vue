<template>
  <div style="margin-bottom: 18px">
    <FormFieldTitle
      v-if="props.label"
      :label="props.label"
      :required="props.required"
      :info="props.info"
    />
    <slot />
    <p v-if="props.note" class="form-field-note">{{ note }}</p>
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
  info: {
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
  font-size: 14px;
  margin-top: 2px;
}
</style>
