<template>
  <div
    id="mapContainer"
    style="height: 90vh; width: 101%; position: relative"
  />
</template>

<script lang="ts">
import { defineComponent, PropType, watch } from "vue";
import * as L from "leaflet";
import { EsriProvider, GeoSearchControl } from "leaflet-geosearch";
import "@geoman-io/leaflet-geoman-free";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet-geosearch/dist/geosearch.css";

export default defineComponent({
  props: {
    selectedLayers: {
      type: Array as PropType<String[]>,
      required: true,
    },
  },
  watch: {
    selectedLayers: {
      handler: function (newValue) {

        //TODO: Avoid hardcording and improve logic

        let tileLayer = L.tileLayer.wms(
          "https://openmaps.gov.bc.ca/geo/ows",
          {
            format: "image/png",
            transparent: true,
            layers: "WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP," +
                    "WHSE_FOREST_VEGETATION.OGSR_TAP_ANCIENT_FOREST_SP," +
                    "WHSE_FOREST_VEGETATION.OGSR_TAP_PRTY_BIG_TREED_OG_SP," +
                    "WHSE_FOREST_VEGETATION.OGSR_TAP_REMNANT_ECOSYSTEMS_SP," +
                    "WHSE_FOREST_VEGETATION.OGSR_TAP_BIG_TREED_OG_SP"
          }
        );
        
        console.log("Deleting all layers...");
        tileLayer.addTo(this.map);
        this.map.removeLayer(tileLayer);

        let wmsLayers = [];

        newValue.forEach((item) => {
          if ("pda" === item) {
            wmsLayers.push(
              "WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP"
            );
          }
          if ("af" === item) {
            wmsLayers.push("WHSE_FOREST_VEGETATION.OGSR_TAP_ANCIENT_FOREST_SP");
          }
          if ("pbt" === item) {
            wmsLayers.push(
              "WHSE_FOREST_VEGETATION.OGSR_TAP_PRTY_BIG_TREED_OG_SP"
            );
          }
          if ("re" === item) {
            wmsLayers.push(
              "WHSE_FOREST_VEGETATION.OGSR_TAP_REMNANT_ECOSYSTEMS_SP"
            );
          }
          if ("bt" === item) {
            wmsLayers.push("WHSE_FOREST_VEGETATION.OGSR_TAP_BIG_TREED_OG_SP");
          }
        });

        tileLayer = L.tileLayer.wms(
          "https://openmaps.gov.bc.ca/geo/ows",
          {
            format: "image/png",
            transparent: true,
            layers: wmsLayers.toString(),
          }
        );

        console.log("Adding the following layers: " + wmsLayers.toString() + " ...");
        tileLayer.addTo(this.map);
      },
      deep: true,
    },
  },
  data() {
    return {
      zoom: 12,
      map: null as any,
    };
  },
  mounted() {
    const container = document.getElementById("mapContainer");
    if (container) {
      // initial map view
      this.map = L.map("mapContainer").setView([54.7276, -127.6476], 12);
      new L.TileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
      ).addTo(this.map);

      // add search control
      const provider = new EsriProvider();
      const searchControl = new (GeoSearchControl as any)({
        provider,
        // style: 'bar'
      });
      this.map.addControl(searchControl);

      // L.marker([54.7276, -127.6476]).addTo(this.map);

      /* const tileLayer = L.tileLayer.wms(
        "https://openmaps.gov.bc.ca/geo/ows",
        {
          format: "image/png",
          transparent: true,
          layers: "WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP",
        }
      );

      tileLayer.addTo(this.map); */

      // add drawing control
      this.map.pm.addControls({
        position: "topright",
        // drawCircle: false,
      });
    }
  },
  methods: {},
});
</script>

<style>
/* ------------- Draw control ------------- */
.leaflet-pm-toolbar.leaflet-pm-draw {
  position: fixed;
  top: 130px;
  right: 3px;
}

.leaflet-pm-toolbar.leaflet-pm-edit {
  position: fixed;
  top: 330px;
  right: 3px;
}
</style>
