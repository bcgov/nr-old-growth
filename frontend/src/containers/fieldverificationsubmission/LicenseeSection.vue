<template>
  <CollapseCard title="Licensee details" id="form-licensee">
    <FormInput
      v-for="row in data"
      :key="row.id"
      :label="row.label"
      v-model="row.modelValue"
      :required="row.required"
      :note="row.note"
      :info="row.info"
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
