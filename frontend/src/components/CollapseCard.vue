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
        :aria-controls="id"
        style="width: 100%; margin: 8px; font-weight: bold"
      >
        <b-icon-arrow-up-short v-if="visible" />
        <b-icon-arrow-down-short v-else />
        {{ title }}
      </div>
    </b-card-header>
    <b-collapse :id="id" role="tabpanel" v-model="visible">
      <b-card-body style="margin-top: 16px; margin-bottom: 16px">
        <slot />
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  components: {},
  props: {
    title: String,
    id: String,
  },
  data() {
    return {
      visible: false,
    };
  },
});
</script>

<style scoped></style>
