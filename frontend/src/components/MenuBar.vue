<template>
  <div>
    <div class="accordion" role="tablist">
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle="['accordion-1']" variant="link">
            Layers
          </b-button>
        </b-card-header>
        <b-collapse id="accordion-1" visible>
          <b-card-body>
            <b-card-text>
              <b-form-checkbox-group
                v-model="selectedLayers"
                :options="layers"
                class="mb-3"
                value-field="code"
                text-field="description"
              ></b-form-checkbox-group>
            </b-card-text>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle="['accordion-2']" variant="link">
            TBD
          </b-button>
        </b-card-header>
        <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text
              ><b-button variant="primary" @click="getMessage()"
                >Primary</b-button
              ></b-card-text
            >
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import axios from "axios";

export default defineComponent({
  data() {
    return {
      selectedLayers: [],
      layers: [
        { description: "Priority Deferral Areas", code: "pda" },
        { description: "Ancient Forest", code: "af" },
        { description: "Priority Big Trees", code: "pbt" },
        { description: "Remnant Ecosystems", code: "re" },
        { description: "Big Trees", code: "bt" },
      ],
    };
  },
  methods: {
    getList() {
      //TODO: remove hardcoded URL
      axios.get("http://localhost:3000/records").then((response) => {
        console.log(response.data);
      });
    },
  },
});
</script>

<style scoped>
.btn-check:focus + .btn,
.btn:focus {
  box-shadow: 0 0 0 0rem;
}

.card-text:last-child {
  text-align: left;
}
</style>
