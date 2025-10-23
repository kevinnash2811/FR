<script setup lang="ts">
import MainLayout from "@/layouts/MainLayout.vue";
import { useMapStore, useTabStore, useUserStore } from "@/store";
import { useConfirmDialogStore } from "@accounts/store/useConfirmDialogStore";
import type { DrawEvents, Marker } from "leaflet";
import { Draw, type DrawMap } from "leaflet";
import "leaflet-routing-machine";
import "leaflet.markercluster";
import { useQuasar } from "quasar";
import { computed, defineAsyncComponent } from "vue";
import { useAccount } from "./modules/Accounts/composables";
import { useDialogStore } from "./store/useDialogStore";
const Map = defineAsyncComponent(() => import("@/components/Map.vue"));

const store = useMapStore();
const alertDialogStore = useConfirmDialogStore();
const tabStore = useTabStore();
const dialogStore = useDialogStore();
const userStore = useUserStore();
const $q = useQuasar();
const { createLocationMarker } = useAccount();

const onLoadMap = (map: DrawMap) => {
  map.setView(
    [
      userStore.regionalLocation?.lat ?? -16.5,
      userStore.regionalLocation?.lng ?? -68.15,
    ],
    13,
  );

  map.on(Draw.Event.CREATED, (e) => {
    const event = e as DrawEvents.Created;
    const layer = event.layer;
    const type = event.layerType;

    if (type === "marker") {
      const marker = layer as Marker;
      const latlng = marker.getLatLng();
      store.cluster?.addLayer(layer);
      alertDialogStore.openDialog(
        "¿Desea agregar un marcador en esta ubicación?",
      );
      alertDialogStore.setCallback(async (value) => {
        if (value) {
          await createLocationMarker(latlng);
        } else {
          store.map.removeLayer(layer);
        }
      });
      return;
    }

    store.drawnItems?.addLayer(layer);
  });

  store.setMap(map);
};

const computedWith = computed(() => {
  if ($q.screen.xs) {
    return $q.screen.width;
  }

  if ($q.screen.sm) {
    return $q.screen.width * 0.6;
  }

  if ($q.screen.md) {
    return $q.screen.width * 0.4;
  }

  if ($q.screen.lg) {
    return $q.screen.width * 0.3;
  }

  if ($q.screen.xl) {
    return $q.screen.width * 0.23;
  }

  return $q.screen.width * 0.3;
});

const onShow = () => {
  if($q.platform.is.mobile || $q.screen.lt.sm) {
    $q.notify({
      message: 'Deslice hacia la derecha para cerrar esta vista',
      type: 'info',
      color: 'primary',
      position: 'bottom',
      actions: [{ icon: 'close', color: 'white' }]
    })
  }
}

</script>

<template>
  <q-layout view="hHr lpR fFr">
    <Teleport to="body">
      <q-drawer
        v-for="dialog of dialogStore.dialogs"
        :key="dialog.id"
        v-model="dialog.show"
        @hide="dialogStore.closeCurrentDrawer"
        side="right"
        overlay
        elevated
        behavior="mobile"
        :width="computedWith"
        class="column no-wrap"
        @show="onShow"
      >
        <component v-if="dialog.events" :is="dialog.component" v-bind="dialog.props" v-on="dialog.events"></component>
        <component v-else :is="dialog.component" v-bind="dialog.props" ></component>
      </q-drawer>
    </Teleport>
    <q-page-container>
      <main-layout>
        <q-splitter
          v-model="tabStore.position"
          separator-class="bg-grey-4"
          :separator-style="{
            width: '4px',
            display: !tabStore.isFullScreen ? 'block' : 'none',
          }"
          :limits="[0, 100]"
          style="height: 100vh; width: 100%; max-width: 100%; overflow: hidden;"
          @update:model-value="tabStore.setShadowPosition"
        >
          <template #before v-if="tabStore.isOpen">
            <router-view />
          </template>
          <template
            #separator
            v-if="!tabStore.isFullScreen && !$q.platform.is.desktop"
          >
            <q-avatar
              color="primary"
              text-color="white"
              size="20px"
              icon="drag_indicator"
            />
          </template>
          <template #after v-if="!tabStore.isFullScreen">
            <keep-alive>
              <Map @ready="onLoadMap" />
            </keep-alive>
          </template>
        </q-splitter>
        <q-dialog v-model="alertDialogStore.isOpen" persistent>
          <q-card>
            <q-card-section class="row items-center">
              <q-avatar
                icon="not_listed_location"
                color="primary"
                text-color="white"
              />
              <span class="q-ml-sm">{{ alertDialogStore.title }}</span>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                flat
                label="Cancelar"
                color="red"
                v-close-popup
                noCaps
                @click="alertDialogStore.onResult(false)"
              />
              <q-btn
                flat
                label="Confirmar"
                color="primary"
                v-close-popup
                noCaps
                @click="alertDialogStore.onResult(true)"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </main-layout>
    </q-page-container>
  </q-layout>
</template>
<style>
@import "leaflet/dist/leaflet.css";
@import "leaflet-control-geocoder/dist/Control.Geocoder.css";
@import "leaflet-draw/dist/leaflet.draw.css";
@import "leaflet-geosearch/dist/geosearch.css";
@import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
@import "leaflet.markercluster/dist/MarkerCluster.css";
@import "leaflet.markercluster/dist/MarkerCluster.Default.css";
</style>
