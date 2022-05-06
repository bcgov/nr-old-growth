<template>
  <CollapseCard title="Cut block information" :id="id" defaultOpen alwaysOpen>
    <div
      v-for="(datakKey, dataIndex) in Object.keys(modelValue)"
      :key="dataIndex"
    >
      <FormInput
        v-if="columns[dataIndex].type == 'input'"
        v-model="modelValue[datakKey]"
        :label="columns[dataIndex].label"
        :required="columns[dataIndex].required"
        :note="columns[dataIndex].note"
        :info="columns[dataIndex].info"
      ></FormInput>
      <FormCheckboxGroup
        v-if="columns[dataIndex].type == 'checkbox'"
        v-model="modelValue[datakKey]"
        :options="columns[dataIndex].options"
        :name="dataIndex + 'radio'"
        :label="columns[dataIndex].label"
        :required="columns[dataIndex].required"
      ></FormCheckboxGroup>
    </div>
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormInput from "../../common/FormInput.vue";
import FormCheckboxGroup from "../../common/FormCheckboxGroup.vue";
import type { FromGridColumnType } from "../../helpers/AppType";

export default defineComponent({
  components: {
    CollapseCard,
    FormInput,
    FormCheckboxGroup,
  },
  props: {
    columns: {
      type: Array as PropType<Array<FromGridColumnType>>,
      required: true,
    },
    // grid data got from parent component through v-model
    modelValue: {
      type: Object as PropType<{ [key: string]: any }>,
      required: true,
    },
    defaultNewData: {
      type: Object as PropType<{ [key: string]: any }>,
      required: true,
    },
    id: {
      type: String,
      default: "form-fieldobs-cutblock",
    },
  },
});
</script>

<style scoped></style>
