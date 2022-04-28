<template>
  <b-card no-body class="mb-1">
    <b-card-header
      header-tag="header"
      class="p-1"
      role="tab"
      style="display: flex"
      @click="visible = !visible"
    >
      <div
        :class="visible ? null : 'collapsed'"
        :aria-expanded="visible ? 'true' : 'false'"
        :aria-controls="props.id"
        style="width: 100%; margin: 8px; font-weight: bold"
      >
        <b-icon-arrow-up-short v-if="visible" />
        <b-icon-arrow-down-short v-else />
        {{ props.title }}
      </div>
    </b-card-header>
    <b-collapse :id="props.id" role="tabpanel" v-model="visible">
      <b-card-body style="margin-top: 16px; margin-bottom: 16px">
        <slot />
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  title: String,
  id: String,
});
const visible = ref(false);
</script>
<script lang="ts">
export default {};
</script>

<style scoped></style>
