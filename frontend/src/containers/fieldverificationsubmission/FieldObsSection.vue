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
      :info="selectData.info"
    />
    <FormInput
      v-for="row in inputData"
      :key="row.id"
      :label="row.label"
      v-model="row.modelValue"
      :required="row.required"
      :note="row.note"
      :info="row.info"
    />
    <CutBlockInfo
      v-for="(block, index) in cutBlockData"
      :key="index"
      :columns="columns"
      v-model="cutBlockData[index]"
      :defaultNewData="defaultNewData"
      :id="'form-fieldobs-cutblock-' + index"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormInput from "../../common/FormInput.vue";
import FormSelect from "../../common/FormSelect.vue";
import CutBlockInfo from "./CutBlockInfo.vue";
import type { FormInputType } from "../../helpers/AppType";

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
        info?: string;
        modelValue: string;
        options: Array<{ value: string; text: string }>;
      }>,
      default: {
        label: "Select from below",
        id: "form-select-example",
        modelValue: "",
        options: [{ value: "1", text: "Option 1" }],
      },
    },
    cutBlockData: {
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
      columns: [
        {
          id: "cut_block_id",
          label: "Cut Block ID",
          type: "input",
          required: true,
        },
        {
          id: "ha_org_mapped_def_area",
          label: "Hectares originally mapped as priority deferral area",
          type: "input",
          required: true,
          info: "put info here",
        },
        {
          id: "deferral_category_code",
          label: "Check all that apply",
          type: "checkbox",
          //TODO: Make it dynamic, not hard-coded
          options: [
            { label: "Big Tree", value: "big_tree" },
            { label: "Ancient", value: "ancient" },
            { label: "Remnant", value: "remnant" },
          ],
          required: true,
        },
        {
          id: "ha_added_org_mapping",
          label: "Hectares added to deferral area mapping",
          type: "input",
          info: "put info here",
        },
        {
          id: "ha_deleted_org_mapping",
          label: "Hectares deleted from deferral area mapping",
          type: "input",
          info: "put info here",
        },
        {
          id: "ha_kept_org_mapping",
          label: "Hectares unchanged from deferral area mapping",
          info: "put info here",
          type: "input",
        },
      ],
      defaultNewData: [
        {
          cut_block_id: "",
          ha_org_mapped_def_area: "",
          deferral_category_code: [],
          ha_kept_org_mapping: "",
          ha_added_org_mapping: "",
          ha_deleted_org_mapping: "",
        },
      ],
    };
  },
});
</script>

<style scoped></style>
