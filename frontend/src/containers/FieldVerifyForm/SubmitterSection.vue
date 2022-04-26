<template>
  <CollapseCard title="Submitter details" id="form-submitter">
    <InputBox
      v-for="row in data"
      :key="row.id"
      :label="row.label"
      v-model="row.modelValue"
      :required="row.required"
      :note="row.note"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CollapseCard from "../../components/CollapseCard.vue";
import InputBox from "../../components/InputBox.vue";

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<
        Array<{
          label: string;
          required: boolean;
          id: string;
          modelValue: string;
          note: string;
        }>
      >,
      default: [
        { id: "test", modelValue: "", required: false, label: "", note: "" },
      ],
    },
  },
  components: {
    CollapseCard,
    InputBox,
  },
});
</script>

<style scoped></style>
