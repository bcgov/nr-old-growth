<template>
  <CollapseCard
    title="Tenure details, defferal mapping and field observations"
    id="form-tenure"
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
    <FormGrid
      label="Data Grid"
      :columns="gridData.columns"
      :defaultNewData="gridData.defaultNewData"
      v-model="gridData.data"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormInput from "../../common/FormInput.vue";
import FormSelect from "../../common/FormSelect.vue";
import FormGrid from "../../common/FormGrid.vue";
import type { FormInputType, FromGridColumnType } from "../../coretypes/AppType";

export default defineComponent({
  components: {
    CollapseCard,
    FormInput,
    FormSelect,
    FormGrid,
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
        modelValue: {};
        options: Array<{ value: {}; text: string }>;
      }>,
      default: {
        label: "Select from below",
        id: "form-select-example",
        modelValue: {},
        options: [{ value: "1", text: "Option 1" }],
      },
    },
    gridData: {
      type: Object as PropType<{
        columns: Array<FromGridColumnType>;
        defaultNewData: { [key: string]: any };
        data: Array<{ [key: string]: any }>;
      }>,
      default: {
        columns: [
          {
            id: "column_1",
            label: "Column 1",
            required: true,
            info: null,
            type: "input",
          },
          {
            id: "column_2",
            label: "Column 2",
            required: false,
            info: null,
            type: "input",
          },
        ],
        defaultNewData: { column_1: 1, column_2: 2 },
        data: [{ column_1: 1, column_2: 2 }],
      },
    },
  },
});
</script>

<style scoped></style>
