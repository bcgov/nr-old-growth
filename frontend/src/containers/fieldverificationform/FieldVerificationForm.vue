<template>
  <div class="accordion" role="tablist">
    <InstructionSection />
    <div id="pdf-form-div">
      <ContactSection :data="modelValue" @updateFormData="updateFormData" />
      <FieldObsSection
        :data="modelValue"
        @updateFormData="updateFormData"
        @updateBlockData="updateBlockData"
        :nrdList="nrdList"
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
import type {
  CommonObjectType,
  FromSelectOptionType,
} from "../../core/AppType";

export default defineComponent({
  components: {
    InstructionSection,
    ContactSection,
    FieldObsSection,
    AttachSection,
  },
  props: {
    modelValue: {
      type: Object as PropType<CommonObjectType>,
      required: true,
    },
    nrdList: {
      type: Array as PropType<Array<FromSelectOptionType>>,
      default: [],
    },
  },
  methods: {
    addCutBlock() {
      const defaultNew = JSON.parse(JSON.stringify(fieldObsBlockDefaultNew));
      const newCutBlock = this.modelValue.cut_block;
      newCutBlock.push(defaultNew);
      this.$emit("update:modelValue", {
        ...this.modelValue,
        cut_block: newCutBlock,
      });
    },

    deleteCutBlock(index: number) {
      const newCutBlock = this.modelValue.cut_block;
      newCutBlock.splice(index, 1);
      this.$emit("update:modelValue", {
        ...this.modelValue,
        cut_block: newCutBlock,
      });
    },

    updateBlockData(
      index: number,
      id: string,
      newValue: string | Array<string>
    ) {
      const newCutBlock = this.modelValue.cut_block;
      newCutBlock[index][id] = newValue;
      this.$emit("update:modelValue", {
        ...this.modelValue,
        cut_block: newCutBlock,
      });
    },

    updateFormData(newObject: CommonObjectType) {
      this.$emit("update:modelValue", { ...this.modelValue, ...newObject });
    },
  },
});
</script>

<style scoped>
#form-container {
  text-align: left;
}
</style>
