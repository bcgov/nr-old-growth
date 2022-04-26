<template>
  <div>
    <div v-if="required" style="display: flex">
      <div style="margin-bottom: 8px">
        {{ label }}
      </div>
      <b-icon-asterisk
        style="margin-left: 8px; margin-top: 6px; font-size: 8px; color: red"
      />
    </div>
    <div style="margin-bottom: 8px" v-else>
      {{ label }}
    </div>
    <b-form-input :value="modelValue" @input="updateInput"></b-form-input>
    <p class="input-note">{{ note }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    label: String,
    modelValue: String,
    required: {
      type: Boolean,
      default: false,
    },
    note: {
      type: String,
      default: "",
    },
  },
  methods: {
    updateInput(newValue: String) {
      this.$emit("update:modelValue", newValue);
    },
  },
});
</script>

<style scoped>
.input-note {
  color: gray;
  font-size: 14px;
  margin-top: 2px;
}
</style>
