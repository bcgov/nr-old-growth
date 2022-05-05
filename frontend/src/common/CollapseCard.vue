<template>
  <b-card no-body class="mb-1">
    <b-card-header
      header-tag="header"
      :id="'header-' + id"
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
        <b-button
          v-if="nextId"
          variant="primary"
          :style="`background-color:` + primary + ';margin-top: 16px'"
          @click="openNext"
          >{{ nextText }}</b-button
        >
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { primary } from "../utils/color";

export default defineComponent({
  name: "CollapseCard",
  props: {
    title: String,
    id: String,
    defaultOpen: { type: Boolean, default: false },
    nextId: { type: String || null, default: null },
    nextText: { type: String, default: "" },
  },
  data() {
    return {
      visible: this.defaultOpen,
      primary,
    };
  },
  methods: {
    openNext() {
      document.getElementById(this.nextId).click();
    },
  },
});
</script>

<style scoped></style>
