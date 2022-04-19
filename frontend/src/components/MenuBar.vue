<template>
  <div>
    <div class="accordion" role="tablist">
      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle="['accordion-1']" variant="link"
                    @click="setMenuSelection(0)">
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
                @change="$emit('input', $event)"
              ></b-form-checkbox-group>
            </b-card-text>
          </b-card-body>
        </b-collapse>
      </b-card>

      <b-card no-body class="mb-1">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block v-b-toggle="['accordion-2']" variant="link"
                    @click="setMenuSelection(1); 
                            $emit('menuItem', menuItem)">
            Backend Test
          </b-button>
        </b-card-header>
        <b-collapse id="accordion-2" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text>
              <b-button variant="primary" 
                        @click="createRecord()">
                Create record
              </b-button>
              <br /><br />
              <b-button variant="primary" 
                        @click="findAllRecords()">
                Find records
              </b-button>
            </b-card-text>
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
  emits: ["input", "menuItem"],
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
      menuItem: 0,
    };
  },
  methods: {
    createRecord() {
      this.menuItem = 1;

      const newRecord = {
        username: "un" + Math.random().toString(),
        file: Math.random().toString(),
      };

      axios
        .post("/api/records", newRecord)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    findAllRecords() {
      this.menuItem = 1;

      axios.get(`/api/records`).then((response) => {
        console.log(response.data);
      });
    },

    setMenuSelection(menuItem) {
      this.menuItem = menuItem;
    }
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
