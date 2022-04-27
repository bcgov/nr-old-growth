<template>
  <div style="margin-bottom: 8px">
    {{ props.label }}
    <b-icon-asterisk
      v-if="props.required"
      style="
        margin-left: 2px;
        font-size: 8px;
        color: red;
        margin-top: -8px;
        margin-right: 2px;
      "
    />
    <b-icon-question-circle
      v-if="props.info"
      v-b-popover.hover.top="props.info"
      style="margin-left: 2px; font-size: 10px; margin-top: -6px"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  label: String,
  required: {
    type: Boolean,
    default: false,
  },
  info: {
    type: String,
    default: null,
  },
});
</script>
<script lang="ts">
export default {};
</script>

<style scoped></style>
