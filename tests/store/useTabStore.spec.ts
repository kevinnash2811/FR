import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useTabStore } from "../../src/store";

describe("Tab size store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("initializes with default values", () => {
    const store = useTabStore();
    expect(store.position).toBe(20);
  });

  it("sets tab size correctly", () => {
    const store = useTabStore();
    store.setTabSize(30);
    expect(store.position).toBe(30);
  });

  it("closes tabs correctly", () => {
    const store = useTabStore();
    store.close();
    expect(store.position).toBe(0);
  });

  it("opens tab correctly", () => {
    const store = useTabStore();
    store.open();
    expect(store.position).toBe(20);
  });

  it("checks if left tab is open correctly", () => {
    const store = useTabStore();
    store.position = 0;
    expect(store.isOpen).toBe(false);

    store.position = 20;
    expect(store.isOpen).toBe(true);
  });
});
