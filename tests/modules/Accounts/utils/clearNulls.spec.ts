import { describe, it, expect } from "vitest";
import { clearNulls } from "../../../../src/modules/Accounts/utils/clearNulls";

describe("clearNulls", () => {
  it("should replace null values with an empty string", () => {
    const target = { a: null, b: "not null" };
    clearNulls(target);
    expect(target).toEqual({ a: "", b: "not null" });
  });

  it("should handle nested objects and replace null values with an empty string", () => {
    const target = { a: null, b: { c: null, d: "not null" } };
    clearNulls(target);
    expect(target).toEqual({ a: "", b: { c: "", d: "not null" } });
  });

  it("should not modify values that are not null", () => {
    const target = { a: "value", b: { c: "value", d: 123 } };
    clearNulls(target);
    expect(target).toEqual({ a: "value", b: { c: "value", d: 123 } });
  });

  it("should handle empty objects", () => {
    const target = {};
    clearNulls(target);
    expect(target).toEqual({});
  });

  it("should handle deeply nested objects", () => {
    const target = { a: { b: { c: { d: { e: null } } } } };
    clearNulls(target);
    expect(target).toEqual({ a: { b: { c: { d: { e: "" } } } } });
  });
});
