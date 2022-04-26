<template>
  <div style="margin-bottom: 8px">
    {{ label }}
    <b-icon-asterisk
      v-if="required"
      style="
        margin-left: 2px;
        font-size: 8px;
        color: red;
        margin-top: -8px;
        margin-right: 2px;
      "
    />
    <b-icon-question-circle
      v-if="info"
      v-b-popover.hover.top="info"
      style="margin-left: 2px; font-size: 10px; margin-top: -6px"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FormFieldTitle",
  props: {
    label: String,
    required: {
      type: Boolean,
      default: false,
    },
    info: {
      type: String,
      default: null,
    },
  },
});
</script>

<style scoped></style>
