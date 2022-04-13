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

        let tileLayer = L.tileLayer.wms("https://openmaps.gov.bc.ca/geo/ows", {
          format: "image/png",
          transparent: true,
          layers:
            "WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP," +
            "WHSE_FOREST_VEGETATION.OGSR_TAP_ANCIENT_FOREST_SP," +
            "WHSE_FOREST_VEGETATION.OGSR_TAP_PRTY_BIG_TREED_OG_SP," +
            "WHSE_FOREST_VEGETATION.OGSR_TAP_REMNANT_ECOSYSTEMS_SP," +
            "WHSE_FOREST_VEGETATION.OGSR_TAP_BIG_TREED_OG_SP",
        });

        console.log("Deleting all layers...");
        tileLayer.addTo(this.map);
        this.map.removeLayer(tileLayer);

        let wmsLayers: Array<string> = [];

        newValue.forEach((item: string) => {
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

        tileLayer = L.tileLayer.wms("https://openmaps.gov.bc.ca/geo/ows", {
          format: "image/png",
          transparent: true,
          layers: wmsLayers.toString(),
        });

        console.log(
          "Adding the following layers: " + wmsLayers.toString() + " ..."
        );
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

      // add layer control
      const overlays = {
        "Priority Deferral Areas": this.getWMSLayer(
          "WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP"
        ),
        "Ancient Forest": this.getWMSLayer(
          "WHSE_FOREST_VEGETATION.OGSR_TAP_ANCIENT_FOREST_SP"
        ),
        "Priority Big Trees": this.getWMSLayer(
          "WHSE_FOREST_VEGETATION.OGSR_TAP_PRTY_BIG_TREED_OG_SP"
        ),
        "Remnant Ecosystems": this.getWMSLayer(
          "WHSE_FOREST_VEGETATION.OGSR_TAP_REMNANT_ECOSYSTEMS_SP"
        ),
        "Big Trees": this.getWMSLayer(
          "WHSE_FOREST_VEGETATION.OGSR_TAP_BIG_TREED_OG_SP"
        ),
      };

      L.control.layers({}, overlays).addTo(this.map);

      // add drawing control
      this.map.pm.addControls({
        position: "topright",
        // drawCircle: false,
      });

      // // method to get shape geojson
      // this.map.on("pm:create", (e: any) => {
      //   console.log("draw create e", e);
      //   console.log("shape", e.shape);
      //   if (e.shape == "Polygon" || e.shape == "Line" || e.shape == "Rectangle")
      //     console.log(
      //       "draw create",
      //       e.shape,
      //       "coordinates",
      //       e.layer.getLatLngs()
      //     );
      //   else if (e.shape == "Circle")
      //     console.log(
      //       "draw create",
      //       e.shape,
      //       "center",
      //       e.layer.getLatLng(),
      //       "radius",
      //       e.layer.getRadius()
      //     );
      //   else console.log("draw create", e.shape, "point", e.layer.getLatLng());
      // });
    }
  },
  methods: {
    getWMSLayer(layer: string) {
      return L.tileLayer.wms("http://openmaps.gov.bc.ca/geo/ows", {
        format: "image/png",
        transparent: true,
        layers: layer,
      });
    },
  },
});
</script>

<style>
/* ------------- Draw control ------------- */
.leaflet-pm-toolbar.leaflet-pm-draw {
  position: fixed;
  top: 190px;
  right: 3px;
}

.leaflet-pm-toolbar.leaflet-pm-edit {
  position: fixed;
  top: 390px;
  right: 3px;
}

/* ------------- Layer control ------------- */
.leaflet-control-layers-overlays {
  text-align: left;
}
</style>
