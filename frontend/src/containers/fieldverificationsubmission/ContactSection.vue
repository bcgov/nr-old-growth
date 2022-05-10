<template>
  <CollapseCard
    title="Contact information"
    id="form-contact"
    nextId="header-form-field-obs"
    nextText="Enter Field Obeservation Data"
  >
    <FormInput
      v-for="row in data"
      :key="row.id"
      v-model="row.modelValue"
      :label="row.label"
      :required="row.required"
      :note="row.note"
      :tooltip="row.tooltip"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormInput from "../../common/FormInput.vue";
import type { FormInputType } from "../../helpers/AppType";

export default defineComponent({
  components: {
    CollapseCard,
    FormInput,
  },
  props: {
    data: {
      type: Array as PropType<Array<FormInputType>>,
      default: [
        {
          id: "test",
          modelValue: "",
          label: "",
        },
      ],
    },
  },
});
</script>

<style scoped></style>
