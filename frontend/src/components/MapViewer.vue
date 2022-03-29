<template>
  <div
    id="mapContainer"
    style="height: 90vh; width: 101%; position: relative"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import * as L from "leaflet";
import { EsriProvider, GeoSearchControl } from "leaflet-geosearch";
import "@geoman-io/leaflet-geoman-free";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "leaflet-geosearch/dist/geosearch.css";

export default defineComponent({
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

      const priorityLayers = L.tileLayer
        .wms("https://openmaps.gov.bc.ca/geo/ows", {
          format: "image/png",
          transparent: true,
          layers: "WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP",
        })
        .addTo(this.map);

      // add layer control
      const overlays = {
        PRIORITY_DEF_AREA: priorityLayers,
      };
      L.control.layers({}, overlays).addTo(this.map);

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
