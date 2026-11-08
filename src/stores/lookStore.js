import { computed, inject, watch } from "vue";
import { usePersistedState } from "@/resilience/persistedState";
import { hydrateLook, LOOKS } from "@/resilience/hydrators/look";
import { setForcedTheme } from "@/composables/useSettings";

const cache = new Map();

/**
 * The app's optional look (theme) for one instance: "normal" or "matrix".
 *
 * The choice is remembered on this device. The active look is mirrored onto
 * `<html data-ogis-look>` so theme.scss can restyle the panels, pop-ups and
 * corner controls (modals are teleported outside `.ogis-root`). The Matrix look
 * is always dark, so it also forces Bootstrap's dark theme while it is on.
 * The map itself is never restyled.
 *
 * @param {string} [instanceId]
 * @returns {{ look: import('vue').ComputedRef<string>, isMatrix: import('vue').ComputedRef<boolean>, setLook: (look: string) => void, looks: string[] }}
 */
export function useLook(instanceId) {
  const id = instanceId ?? inject("ogisAppId", "app");

  if (!cache.has(id)) {
    const store = usePersistedState(
      "look",
      {
        version: 1,
        defaults: { look: "normal" },
        hydrate: hydrateLook,
        crossTab: true,
      },
      id,
    );
    const look = computed(() => store.state.look);
    const isMatrix = computed(() => look.value === "matrix");

    if (typeof document !== "undefined") {
      watch(
        look,
        (value) => {
          const root = document.documentElement;
          if (value === "normal") root.removeAttribute("data-ogis-look");
          else root.setAttribute("data-ogis-look", value);
          setForcedTheme(value === "matrix" ? "dark" : null);
        },
        { immediate: true },
      );
    }

    const setLook = (value) => {
      if (!LOOKS.includes(value)) return;
      store.state.look = value;
      store.flush();
    };

    cache.set(id, { look, isMatrix, setLook, looks: LOOKS });
  }

  return cache.get(id);
}
