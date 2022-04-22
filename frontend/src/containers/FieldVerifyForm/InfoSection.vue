<template>
  <CollapseCard title="Instruction" id="form-instruction">
    Instruction text here
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CollapseCard from "../../components/CollapseCard.vue";

export default defineComponent({
  components: {
    CollapseCard,
  },
  data() {
    return {};
  },
});
</script>

<style scoped></style>
