<template>
  <CollapseCard
    title="Instruction"
    id="form-instruction"
    defaultOpen
    nextId="header-form-contact"
    nextText="Enter Contact Information"
  >
    <p>1. Complete all mandatory fields</p>

    <p>2. Attach your professional rationale, PDF map, and shape file, and</p>

    <p>3. Select the Submit button</p>
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";

export default defineComponent({
  components: {
    CollapseCard,
  },
});
</script>

<style scoped></style>
