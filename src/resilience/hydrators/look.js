/** The looks the app can wear. "normal" is the everyday theme. */
export const LOOKS = ["normal", "matrix"];

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Normalise the stored look (the optional app theme).
 *
 * The top-level shape must be an object; anything else throws so the primitive
 * quarantines the value and falls back to defaults. An unknown look repairs to
 * "normal", so a damaged value simply shows the everyday theme.
 *
 * @param {*} data - Raw decoded state, at any stored version.
 * @returns {{ look: string }}
 */
export function hydrateLook(data) {
  if (!isPlainObject(data)) {
    throw new TypeError("look state must be an object");
  }

  return { look: LOOKS.includes(data.look) ? data.look : "normal" };
}
