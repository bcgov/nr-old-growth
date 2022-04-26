<template>
  <div style="margin-bottom: 18px">
    <FormFieldTitle
      v-if="label"
      :label="label"
      :required="required"
      :info="info"
    />
    <slot />
    <p v-if="note" class="form-field-note">{{ note }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FormFieldTitle from "./FormFieldTitle.vue";

export default defineComponent({
  name: "FormFieldTemplate",
  components: {
    FormFieldTitle,
  },
  props: {
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
  },
});
</script>

<style scoped>
.form-field-note {
  color: gray;
  font-size: 14px;
  margin-top: 2px;
}
</style>
