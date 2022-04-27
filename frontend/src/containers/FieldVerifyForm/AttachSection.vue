<template>
  <CollapseCard title="Attach files" id="form-attachment">
    <FormUpload
      label="Attach the following files: Professional rationale, PDF map file, Spatial
    file (accepted formats: SHAPE, KML, KMZ, GDB)"
      v-model="files"
    />
  </CollapseCard>
</template>

<script lang="ts">
import { defineComponent, Proptype } from "vue";
import CollapseCard from "../../components/CollapseCard.vue";
import FormUpload from "../../components/FormUpload.vue";

export default defineComponent({
  components: {
    CollapseCard,
    FormUpload,
  },
  props: {
    files: Array as Proptype<Array<File>>,
  },
});
</script>

<style scoped></style>
