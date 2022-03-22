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
    <l-control-layers :collapsed="false" />        
    <l-control-zoom position="bottomright" />
  </l-map>
</template>
<script>
import { defineComponent } from 'vue';
import { LMap, LTileLayer, LWmsTileLayer, LControlLayers, LControlZoom } from "@vue-leaflet/vue-leaflet";
import * as L from "leaflet";
import { EsriProvider, GeoSearchControl } from 'leaflet-geosearch';
import '@geoman-io/leaflet-geoman-free';  
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';  
import 'leaflet-geosearch/dist/geosearch.css';

export default defineComponent({
  components: {
    LMap,
    LTileLayer,
    LWmsTileLayer,
    LControlLayers,
    LControlZoom,
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

      // add search box
      const provider = new EsriProvider();
      this.map.leafletObject.addControl(
        new GeoSearchControl({
          provider,
          // style: 'bar'
        }),
      );

      // add drwing control
      this.map.leafletObject.pm.addControls({  
        position: 'topright',  
        // drawCircle: false,  
      });

      this.map.leafletObject.on('pm:drawstart', (e) => {
        // console.log('draw start e', e)
      });

       this.map.leafletObject.on('pm:drawend', (e) => {
        // console.log('draw end e', e);
        // const newDraw = this.map.leafletObject.pm.getGeomanDrawLayers(true);
        // console.log('newDraw', newDraw);
        // const newLayers = newDraw._layers;
        // console.log("newLayers", newLayers, newLayers._bounds);
         
      });

      this.map.leafletObject.on('pm:create', (e) => {
        console.log('draw create e', e)
        console.log('shape', e.shape)
        if (e.shape == 'Polygon' || e.shape == 'Line' || e.shape == 'Rectangle') 
          console.log('draw create', e.shape, 'coordinates', e.layer.getLatLngs())
        else if (e.shape == 'Circle')
          console.log('draw create', e.shape, 'center', e.layer.getLatLng(), 'radius', e.layer.getRadius())
        else console.log('draw create', e.shape, 'point', e.layer.getLatLng())
      });
    },
  },
  mounted() {
    this.map = this.$refs.map;
  }
});
</script>

<style></style>
