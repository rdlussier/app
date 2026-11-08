import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

/**
 * useLook: the optional app look (Normal or Matrix), remembered per instance,
 * mirrored onto <html data-ogis-look>, and forcing the dark theme for Matrix.
 */

const KEY = "ogis_look_app";
const envelope = (data) => JSON.stringify({ __ogisState: 1, version: 1, data });

async function load() {
  vi.resetModules();
  const { useLook } = await import("@/stores/lookStore");
  const { resolvedTheme } = await import("@/composables/useSettings");
  return { useLook, resolvedTheme };
}

describe("useLook", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-ogis-look");
  });

  it("starts on the normal look with no attribute", async () => {
    const { useLook } = await load();
    const { look, isMatrix } = useLook("app");
    expect(look.value).toBe("normal");
    expect(isMatrix.value).toBe(false);
    expect(document.documentElement.hasAttribute("data-ogis-look")).toBe(false);
  });

  it("switches to Matrix, marks <html> and forces the dark theme", async () => {
    const { useLook, resolvedTheme } = await load();
    const { setLook, isMatrix } = useLook("app");
    setLook("matrix");
    await nextTick();
    expect(isMatrix.value).toBe(true);
    expect(document.documentElement.getAttribute("data-ogis-look")).toBe(
      "matrix",
    );
    expect(resolvedTheme.value).toBe("dark");
    expect(JSON.parse(localStorage.getItem(KEY)).data).toEqual({
      look: "matrix",
    });

    setLook("normal");
    await nextTick();
    expect(document.documentElement.hasAttribute("data-ogis-look")).toBe(false);
  });

  it("turns the browser bar black for Matrix and back for Normal", async () => {
    document.head.insertAdjacentHTML(
      "beforeend",
      '<meta name="theme-color" content="#2f6b3a" />',
    );
    const meta = () => document.querySelector('meta[name="theme-color"]');
    const { useLook } = await load();
    const { setLook } = useLook("app");
    setLook("matrix");
    await nextTick();
    expect(meta().getAttribute("content")).toBe("#000000");
    setLook("normal");
    await nextTick();
    expect(meta().getAttribute("content")).toBe("#2f6b3a");
    meta().remove();
  });

  it("restores a remembered look", async () => {
    localStorage.setItem(KEY, envelope({ look: "matrix" }));
    const { useLook } = await load();
    expect(useLook("app").look.value).toBe("matrix");
    expect(document.documentElement.getAttribute("data-ogis-look")).toBe(
      "matrix",
    );
  });

  it("ignores an unknown look", async () => {
    const { useLook } = await load();
    const { setLook, look } = useLook("app");
    setLook("neon");
    expect(look.value).toBe("normal");
  });
});
