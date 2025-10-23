import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMapStore } from "../../src/store";
import leaflet from "leaflet";
import "leaflet.markercluster";

describe("mapStore", () => {
  let store: ReturnType<typeof useMapStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMapStore();
  });

  it("sets and gets the map", () => {
    const map = new leaflet.Map(
      document.createElement("div"),
    ) as leaflet.DrawMap;
    store.setMap(map);
    expect(store.map).toStrictEqual(map);
  });

  it("sets and gets the cluster", () => {
    const map = new leaflet.Map(
      document.createElement("div"),
    ) as leaflet.DrawMap;
    const cluster = new leaflet.MarkerClusterGroup();

    store.setMap(map);
    store.setCluster(cluster);

    expect(store.cluster).toStrictEqual(cluster);
    expect(store.map.hasLayer(cluster)).toBe(true);
  });

  it("swaps the cluster", () => {
    const map = new leaflet.Map(
      document.createElement("div"),
    ) as leaflet.DrawMap;
    const oldCluster = new leaflet.MarkerClusterGroup();
    const newCluster = new leaflet.MarkerClusterGroup();

    store.setMap(map);
    store.setCluster(oldCluster);

    expect(store.cluster).toStrictEqual(oldCluster);
    expect(store.map.hasLayer(oldCluster)).toBe(true);

    store.swapCluster(newCluster);

    expect(store.cluster).toStrictEqual(newCluster);
    expect(store.map.hasLayer(oldCluster)).toBe(false);
    expect(store.map.hasLayer(newCluster)).toBe(true);
  });

  it("restores the cluster", () => {
    const map = new leaflet.Map(
      document.createElement("div"),
    ) as leaflet.DrawMap;
    const cluster = new leaflet.MarkerClusterGroup();
    const newCluster = new leaflet.MarkerClusterGroup();

    store.setMap(map);
    store.setCluster(cluster);
    store.swapCluster(newCluster);

    expect(store.cluster).toStrictEqual(newCluster);
    expect(store.map.hasLayer(cluster)).toBe(false);
    expect(store.map.hasLayer(newCluster)).toBe(true);

    store.restoreCluster();

    expect(store.cluster).toStrictEqual(cluster);
    expect(store.map.hasLayer(cluster)).toBe(true);
    expect(store.map.hasLayer(newCluster)).toBe(false);
  });
});
