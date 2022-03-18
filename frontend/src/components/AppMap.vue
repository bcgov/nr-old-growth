<template>
  <l-map
    use-global-leaflet
    ref="map"
    :zoom="zoom"
    :center="[54.7276, -127.6476]"
    :options="{zoomControl: false}"
    @ready="onLeafletReady"
  >
    <l-tile-layer
      url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    ></l-tile-layer>
    <l-wms-tile-layer
      base-url="http://openmaps.gov.bc.ca/geo/ows"
      layers="WHSE_FOREST_VEGETATION.OGSR_TAP_PRIORITY_DEF_AREA_SP"
      :transparent="true"
      format="image/png"
      name="TAP_PRIORITY_DEF_AREA"
      layer-type="overlay"
    />     
    <!-- <l-feature-group ref="featureGroup" @ready="onFeatureGroupReady($event)"></l-feature-group> -->
    <l-control-layers :collapsed="false" />        
    <l-control-zoom position="bottomright" />
  </l-map>
</template>
<script>
import { defineComponent } from 'vue';
import { LMap, LTileLayer, LWmsTileLayer, LControlLayers, LControlZoom, LFeatureGroup } from "@vue-leaflet/vue-leaflet";
import * as L from 'leaflet';
import "leaflet-draw/dist/leaflet.draw-src.js";

import "leaflet/dist/leaflet.css";
import 'leaflet-draw/dist/leaflet.draw.css';


export default defineComponent({
  components: {
    LMap,
    LTileLayer,
    LWmsTileLayer,
    LControlLayers,
    LControlZoom,
    // LFeatureGroup
  },
  data() {
    return {
      zoom: 12,
      map: null,
    };
  },
  methods: {
    async onLeafletReady() {
      await this.$nextTick();
      const editableLayers = new L.FeatureGroup();
      this.map.leafletObject.addLayer(editableLayers);
      const drawControl = new L.Control.Draw(this.getDrawConfiguration(editableLayers));
      this.map.leafletObject.addControl(drawControl);
      this.map.leafletObject.on(L.Draw.Event.CREATED, (e) => {
          const type = e.layerType;
          if (type === 'polygon') {
            console.log("e.layer", e.layer)
            // this.geofenceStore.addNewPolygon(e.layer.getLatLngs());
          }
          this.map.leafletObject.addLayer(e.layer)
      });
    },
    // async onFeatureGroupReady(val) {
    //   await this.$nextTick();
    //   const drawControl = new L.Control.Draw(this.getDrawConfiguration(val));
    //   this.map.leafletObject.addControl(drawControl);
    // },
    getDrawConfiguration(editableLayers) {
      return {
          position: 'topleft',
          draw: {
              // polygon: {
              //     allowIntersection: false, // Restricts shapes to simple polygons
              //     drawError: {
              //         color: '#e1e100', // Color the shape will turn when intersects
              //         message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
              //     },
              //     shapeOptions: {
              //         color: '#97009c'
              //     }
              // },
              // polyline: false,
              // circle: false,
              // circleMarker: false,
              // rectangle: false,
              // marker: false,
             polyline: {
                shapeOptions: {
                    color: '#f357a1',
                    weight: 10
                }
             },
              polygon: {
                  allowIntersection: false, // Restricts shapes to simple polygons
                  drawError: {
                      color: '#e1e100', // Color the shape will turn when intersects
                      message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                  },
                  shapeOptions: {
                      color: '#bada55'
                  }
              },
              circle: false, // Turns off this drawing tool
              rectangle: false,
              marker: false,
              circlemarker: false
          },
          edit: {
              featureGroup: editableLayers,
              remove: false
          }
      };
    },
  },
  mounted() {
    this.map = this.$refs.map;
  }
});
</script>

<style></style>
