<script setup lang="ts">
import { onActivated } from "vue";
import { ref } from "vue";
import leaflet from 'leaflet'
/*
 * Fix for leaflet marker animation
 */
/* @ts-ignore */
leaflet.Marker.prototype._animateZoom = function (opt) {
  /* @ts-ignore */
  if (!this._map) {
    return;
  }
  /* @ts-ignore */
  const pos = this._map
    /* @ts-ignore */
    ._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center)
    .round();
  /* @ts-ignore */
  this._setPos(pos);
};

const isReady = ref(false);

onActivated(() => {
  const map = leaflet.map("map", {
      attributionControl: false,
      zoomControl: false,
      zoomAnimation: false,
    });
  
  leaflet
    .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      minZoom: 3,
    })
    .addTo(map);

  emit(
    "ready",
    map
  );
  isReady.value = true;
});

const emit = defineEmits<{
  (e: "ready", map: leaflet.DrawMap): void;
}>();
</script>

<template>
  <template v-if="!isReady">
    <q-spinner-dots 
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)" 
      color="primary" 
      size="40px"
    />
  </template>
  <div id="map" style="height: 100%"></div>
</template>
