<template>
  <CollapseCard title="Attach files" id="form-attachment">
    <FormUpload
      label="Attach the following files: Professional rationale, PDF map file, Spatial
    file (accepted formats: SHAPE, KML, KMZ, GDB)"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CollapseCard from "../../common/CollapseCard.vue";
import FormUpload from "../../common/FormUpload.vue";

export default defineComponent({
  components: {
    CollapseCard,
    FormUpload,
  },
});
</script>

<style scoped></style>
