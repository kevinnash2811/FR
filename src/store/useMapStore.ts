import { defineStore } from "pinia";
import leaflet, { LatLng } from "leaflet";
import "leaflet-draw";
import { getOnlyIds, iconsUrl } from "@/modules/Accounts/utils";
import type { Account } from "@/types";
import { OpenStreetMapProvider, SearchControl } from "leaflet-geosearch";
type State = {
  _map?: leaflet.DrawMap;
  cluster?: leaflet.MarkerClusterGroup;
  _backupCluster?: leaflet.MarkerClusterGroup;
  router?: leaflet.Routing.Control;
  drawControl?: leaflet.Control.Draw;
  drawnItems?: leaflet.FeatureGroup;
};

export const useMapStore = defineStore("mapStore", {
  state(): State {
    return {};
  },
  actions: {
    setMap(map: leaflet.DrawMap) {
      const drawnItems = new leaflet.FeatureGroup();
      const drawControl = new leaflet.Control.Draw({
        position: "bottomleft",
        draw: {
          rectangle: false,
          polyline: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
        },
      });
      map.addLayer(drawnItems);
      map.addControl(drawControl);

      // leaflet.Routing.control({
      //   waypoints: [
      //     leaflet.latLng(57.74, 11.94),
      //     leaflet.latLng(57.6792, 11.949),
      //   ],
      //   lineOptions: {
      //     styles: [{ color: "red", opacity: 0.7, weight: 5 }],
      //   },
      //   addWaypoints: false,
      //   draggableWaypoints: false,
      //   fitSelectedRoutes: false,
      //   showAlternatives: false,
      //   show: false,
      //   language: "es",
      // }).addTo(map);

      this.drawnItems = drawnItems;
      this.drawControl = drawControl;
      this._map = map;
      this.addSearchBar();
      return map;
    },
    addSearchBar() {
      /* @ts-ignore */
      const searchControl = new SearchControl({
        style: "bar",
        autoComplete: true,
        autoCompleteDelay: 250,
        provider: new OpenStreetMapProvider(),
        notFoundMessage: 'No se encontraron resultados para la búsqueda "{s}"',
        searchLabel: "Buscar...",
        marker: {
          icon: leaflet.icon({
            iconUrl: iconsUrl["redGIF"],
            iconSize: [30, 35],
          }),
          draggable: false,
        },
      });

      this.map.addControl(searchControl);
    },
    setCluster(cluster: leaflet.MarkerClusterGroup) {
      if (this.cluster) {
        this.map.removeLayer(this.cluster as leaflet.MarkerClusterGroup);
      }
      this.cluster = cluster;
      this._backupCluster = cluster;
      this.map.addLayer(cluster);
      return cluster;
    },
    swapCluster(newCluster: leaflet.MarkerClusterGroup) {
      if (this.cluster) {
        this.map.removeLayer(this.cluster as leaflet.MarkerClusterGroup);
      }
      this.cluster = newCluster;
      this.map.addLayer(newCluster);
      return newCluster;
    },
    // setRouter(router: leaflet.Routing.Control) {
    //   if (this.router) {
    //     this.map.removeControl(this.router);
    //   }

    //   const weakCluster = leaflet.markerClusterGroup({});
    //   this.swapCluster(weakCluster);
    //   this.router = router;

    //   this.map.addControl(router);
    //   return router;
    // },
    createRouter(points: LatLng[]) {
      leaflet.routing
        .control({
          waypoints: points,
          routeWhileDragging: false,
        })
        .addTo(this.map);
    },
  },
  getters: {
    map(state): leaflet.DrawMap {
      return state._map as leaflet.DrawMap;
    },
    isReady(state): boolean {
      return !!state._map;
    },
  },
});
