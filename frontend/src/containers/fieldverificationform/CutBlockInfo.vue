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
        :tooltip="columns[dataIndex].tooltip"
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
    <b-button
      v-if="enableAdd"
      variant="primary"
      :style="
        `background-color:` + primary + ';margin-top: 16px; margin-right: 16px'
      "
      @click="addCutBlock"
      >+ Add Another Cut Block</b-button
    >
    <b-button
      v-if="enableDelete"
      variant="primary"
      :style="`background-color:` + primary + ';margin-top: 16px;'"
      @click="deleteCutBlock"
      >- Remove this Cut Block</b-button
    >
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormInput from "../../common/FormInput.vue";
import FormCheckboxGroup from "../../common/FormCheckboxGroup.vue";
import type { FromGridColumnType } from "../../helpers/AppType";
import { primary } from "../../utils/color";

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
    id: {
      type: String,
      default: "form-fieldobs-cutblock",
    },
    enableAdd: {
      type: Boolean,
      default: true,
    },
    enableDelete: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      primary,
    };
  },
  methods: {
    addCutBlock() {
      this.$emit("addCutBlock");
    },
    deleteCutBlock() {
      this.$emit("deleteCutBlock");
    },
  },
});
</script>

<style scoped></style>
