<template>
  <div class="accordion" role="tablist">
    <InstructionSection />
    <div id="pdf-form-div">
      <ContactSection :data="contactData" />
      <FieldObsSection
        :inputData="fieldObsInputData"
        :selectData="fieldObsSelectData"
        v-model="modelValue"
        @addCutBlock="addCutBlock"
        @deleteCutBlock="deleteCutBlock"
      />
    </div>
    <AttachSection />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import InstructionSection from "./InstructionSection.vue";
import ContactSection from "./ContactSection.vue";
import FieldObsSection from "./FieldObsSection.vue";
import AttachSection from "./AttachSection.vue";
import { fieldObsBlockDefaultNew } from "../../pages/NewFormData";

export default defineComponent({
  components: {
    InstructionSection,
    ContactSection,
    FieldObsSection,
    AttachSection,
  },
  props: {
    contactData: {
      type: Array as PropType<Array<{ [key: string]: any }>>,
      required: true,
    },
    fieldObsInputData: {
      type: Array as PropType<Array<{ [key: string]: any }>>,
      required: true,
    },
    fieldObsSelectData: {
      type: Object as PropType<{ [key: string]: any }>,
      required: true,
    },
    // modelValue is the fieldObsBlockData
    modelValue: {
      type: Array as PropType<Array<{ [key: string]: any }>>,
      required: true,
    },
  },
  methods: {
    addCutBlock() {
      const defaultNew = JSON.parse(JSON.stringify(fieldObsBlockDefaultNew));
      const newModelValue = this.modelValue;
      newModelValue.push(defaultNew);
      this.$emit("update:modelValue", newModelValue);
    },
    deleteCutBlock(index: number) {
      const newModelValue = this.modelValue;
      newModelValue.splice(index, 1);
      this.$emit("update:modelValue", newModelValue);
    },
  },
});
</script>

<style scoped>
#form-container {
  text-align: left;
}
</style>
