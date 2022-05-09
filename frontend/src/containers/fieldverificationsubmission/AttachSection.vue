<template>
  <CollapseCard title="Attach files" id="form-attachment">
    <div style="margin-bottom: 32px">
      <p>Attach the following files:</p>

      <p class="instruction-header">1. Professional rationale</p>
      <p class="instruction-body">
        &#8226; Use the naming style:
        <text style="font-weight: bold"
          >Professional_Rationale_ForestFileID_CP</text
        >
      </p>

      <p class="instruction-header">2. PDF map file</p>
      <p class="instruction-body">
        &#8226; Use the naming style:
        <text style="font-weight: bold">PDF_Map_file_ForestFileID_CP</text>
      </p>

      <p class="instruction-header">3. Spatial file</p>
      <p class="instruction-body">
        &#8226; Accepted formats: SHAPE, KML, KMZ, GDB
      </p>
      <p class="instruction-body">
        &#8226; Use the naming style:
        <text style="font-weight: bold">Spatialfile_ForestFileID_CP</text>
      </p>
    </div>

    <FormUpload label="Upload your files" />
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

<style scoped>
#form-attachment .instruction-header {
  font-weight: bold;
  margin-bottom: 16px;
  margin-top: 28px;
}

#form-attachment .instruction-body {
  padding-left: 18px;
}
</style>
