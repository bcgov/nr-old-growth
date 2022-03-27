/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue-leaflet/vue-leaflet" {
  import type { DefineComponent } from "vue";
  export const LMap: DefineComponent;
  export const LIcon: DefineComponent;
  export const LTileLayer: DefineComponent;
  export const LMarker: DefineComponent;
  export const LControlLayers: DefineComponent;
  export const LTooltip: DefineComponent;
  export const LPopup: DefineComponent;
  export const LPolyline: DefineComponent;
  export const LPolygon: DefineComponent;
  export const LRectangle: DefineComponent;
  export const LWmsTileLayer: DefineComponent;
  export const LControlZoom: DefineComponent;
}
