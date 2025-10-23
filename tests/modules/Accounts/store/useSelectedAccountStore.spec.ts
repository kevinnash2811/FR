import { setActivePinia, createPinia } from "pinia";
import { describe, it, beforeEach, expect, vi } from "vitest";
import { useSelectedAccountStore } from "../../../../src/modules/Accounts/store";
import type { Account } from "../../../../src/types";
import leaflet, { Marker } from "leaflet";
/* @ts-ignore */
import marcadorRojo from "../../../../src/assets/Marcador-rojo.gif";

describe("useSelectedAccountStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initializes with no selected account and no marker", () => {
    const store = useSelectedAccountStore();
    expect(store.selectedAccount).toBeUndefined();
    expect(store.marker).toBeUndefined();
  });

  it("sets the selected account and marker correctly", () => {
    const store = useSelectedAccountStore();
    const mockAccount: Account = {
      category: "A",
      id: "1",
      address: "test-address",
      name: "test-name",
      location: leaflet.latLng(0, 0),
    };
    const mockMarker = new Marker([0, 0]);

    store.setSelectedAccount(mockAccount, mockMarker);

    expect(store.selectedAccount).toStrictEqual(mockAccount);
    expect(store.marker).toStrictEqual(mockMarker);
    expect(mockMarker.getIcon().options.iconUrl).toBe(marcadorRojo);
  });

  it("clears the selected account and updates marker icon correctly", () => {
    const store = useSelectedAccountStore();
    const mockAccount: Account = {
      id: "1",
      category: "A",
      address: "test-address",
      name: "test-name",
      location: leaflet.latLng(0, 0),
    };
    const mockMarker = new Marker([0, 0]);
    const setIconSpy = vi.spyOn(mockMarker, "setIcon");

    store.setSelectedAccount(mockAccount, mockMarker);
    store.clearSelectedAccount();

    expect(store.selectedAccount).toBeUndefined();
    expect(setIconSpy).toHaveBeenCalled();
  });

  it("returns the selected account from the getter", () => {
    const store = useSelectedAccountStore();
    const mockAccount: Account = {
      id: "1",
      category: "A",
      address: "test-address",
      name: "test-name",
      location: leaflet.latLng(0, 0),
    };

    store.setSelectedAccount(mockAccount);

    expect(store.getSelectedAccount).toStrictEqual(mockAccount);
  });

  it("returns the marker from the getter", () => {
    const store = useSelectedAccountStore();
    const mockMarker = new Marker([0, 0]);

    store.setSelectedAccount({}, mockMarker);

    expect(store.getMarker).toStrictEqual(mockMarker);
  });
});
