<template>
  <div>
    <FormFieldTemplate
      :label="label"
      :required="required"
      :note="note"
      :info="info"
    >
      <!-- title row -->
      <b-row align-h="center" class="form-grid-row">
        <b-col
          v-for="title in columns"
          :key="title.id"
          class="form-grid-column"
        >
          <FormFieldTitle
            :label="title.label"
            :required="title.required"
            :info="title.info"
          />
        </b-col>
        <b-col v-if="modelValue.length > 0" cols="1" class="form-grid-column" />
      </b-row>
      <!-- data row -->
      <b-row
        align-h="center"
        class="form-grid-row"
        v-for="(row, row_index) in modelValue"
        :key="row_index"
      >
        <b-col
          v-for="(column, column_index) in Object.keys(row)"
          :key="row_index + '_' + column_index"
          class="form-grid-column form-grid-column-input"
        >
          <FormInput
            v-if="columns[column_index].type == 'input'"
            v-model="modelValue[row_index][column]"
          ></FormInput>
          <FormRadio
            v-if="columns[column_index].type == 'radio'"
            v-model="modelValue[row_index][column]"
            :options="columns[column_index].options"
            :name="row_index + 'radio'"
          ></FormRadio>
        </b-col>
        <b-col v-if="modelValue.length > 0" cols="1" class="form-grid-column">
          <b-button variant="outline-primary" @click="deleteData(row_index)"
            >Delete</b-button
          >
        </b-col>
      </b-row>
      <slot />
    </FormFieldTemplate>
    <b-button variant="outline-primary" @click="addData"
      >+ Add a new row</b-button
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import FormFieldTemplate from "./FormFieldTemplate.vue";
import FormFieldTitle from "./FormFieldTitle.vue";
import FormInput from "./FormInput.vue";
import FormRadio from "./FormRadio.vue";
import type { FromGridColumnType } from "../helpers/AppType";

export default defineComponent({
  name: "FormGrid",
  components: {
    FormFieldTemplate,
    FormFieldTitle,
    FormInput,
    FormRadio,
  },
  props: {
    // form field template props (optional): label, required, info, note
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
      default: "",
    },
    // grid column titles
    columns: {
      type: Array as PropType<Array<FromGridColumnType>>,
      required: true,
    },
    // grid data got from parent component through v-model
    modelValue: {
      type: Array as PropType<Array<{ [key: string]: any }>>,
      required: true,
    },
    defaultNewData: {
      type: Object as PropType<{ [key: string]: any }>,
      required: true,
    },
  },
  methods: {
    addData() {
      // use the following method to copy the value of the defaultNewData, other wise will copy the reference
      const defaultNew = JSON.parse(JSON.stringify(this.defaultNewData));
      const newModelValue = this.modelValue;
      newModelValue.push(defaultNew);
      this.$emit("update:modelValue", newModelValue);
    },
    deleteData(index: number) {
      const newModelValue = this.modelValue.filter((m, i) => i !== index);
      this.$emit("update:modelValue", newModelValue);
    },
  },
});
</script>

<style scoped>
.form-grid-row {
  margin: 0px;
}
.form-grid-column {
  border: 1px solid rgba(86, 61, 124, 0.2);
  padding-top: 8px !important;
  text-align: center;
}

.form-grid-column-input {
  padding: 8px !important;
}
</style>
