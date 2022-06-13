<template>
  <CollapseCard
    title="Field observations"
    id="form-field-obs"
    nextId="header-form-attachment"
    nextText="Attach Files"
  >
    <FormSelect
      :label="selectData.label"
      v-model="selectData.modelValue"
      :required="selectData.required"
      :note="selectData.note"
      :options="selectData.options"
      :tooltip="selectData.tooltip"
    />
    <FormInput
      v-for="row in inputData"
      :key="row.id"
      :label="row.label"
      v-model="row.modelValue"
      :required="row.required"
      :note="row.note"
      :tooltip="row.tooltip"
    />
    <CutBlockInfo
      v-for="(block, index) in modelValue"
      :key="index"
      :columns="columns"
      v-model="modelValue[index]"
      :defaultNewData="defaultNewData"
      :id="'form-fieldobs-cutblock-' + index"
      :enableAdd="index === modelValue.length - 1 ? true : false"
      :enableDelete="modelValue.length > 1"
      @addCutBlock="addCutBlock"
      @deleteCutBlock="deleteCutBlock(index)"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormInput from "../../common/FormInput.vue";
import FormSelect from "../../common/FormSelect.vue";
import CutBlockInfo from "./CutBlockInfo.vue";
import type { FormInputType } from "../../core/AppType";
import {
  fieldObsBlockColumns,
  fieldObsBlockDefaultNew,
} from "./FieldVerificationSubmissionData";

export default defineComponent({
  components: {
    CollapseCard,
    FormInput,
    FormSelect,
    CutBlockInfo,
  },
  props: {
    inputData: {
      type: Array as PropType<Array<FormInputType>>,
      default: [
        {
          id: "test",
          modelValue: "",
          label: "",
        },
      ],
    },
    selectData: {
      type: Object as PropType<{
        label: string;
        id: string;
        note?: string;
        required?: boolean;
        tooltip?: string;
        modelValue: {};
        options: Array<{ value: {}; text: string }>;
      }>,
      default: {
        label: "Select from below",
        id: "form-select-example",
        modelValue: "",
        options: [{ value: "1", text: "Option 1" }],
      },
    },
    modelValue: {
      type: Array as PropType<Array<{ [key: string]: any }>>,
      default: [
        {
          cut_block_id: "",
          ha_org_mapped_def_area: "",
          deferral_category_code: [],
          ha_kept_org_mapping: "",
          ha_added_org_mapping: "",
          ha_deleted_org_mapping: "",
        },
      ],
    },
  },
  data() {
    return {
      columns: fieldObsBlockColumns,
      defaultNewData: fieldObsBlockDefaultNew,
    };
  },
  methods: {
    addCutBlock() {
      const defaultNew = JSON.parse(JSON.stringify(this.defaultNewData));
      const newModelValue = this.modelValue;
      newModelValue.push(defaultNew);
      this.$emit("update:modelValue", newModelValue);
    },
    deleteCutBlock(index: number) {
      const newModelValue = this.modelValue.filter((m, i) => i !== index);
      this.$emit("update:modelValue", newModelValue);
    },
  },
  mounted() {
    console.log(fieldObsBlockColumns);
  },
});
</script>

<style scoped></style>
