import { test, expect } from "../helpers/test.js";
import {
  trackConsoleErrors,
  expectNoConsoleErrors,
} from "../helpers/console.js";
import { waitForMapReady } from "../helpers/panel";
import { readStoredState } from "../helpers/storage.js";

/**
 * The optional Matrix look: switched from the Info panel's Look card,
 * remembered across visits, and never applied to the map itself.
 */

test.beforeEach(({ page }) => trackConsoleErrors(page));
test.afterEach(({ page }) => expectNoConsoleErrors(page));

const html = (page) => page.locator("html");

test.describe("Info / Look card", () => {
  test("switches to Matrix and back", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);

    // Desktop boots with the Info pane open.
    const card = page.locator(".ogis-look-card");
    const normal = card.getByRole("button", { name: "Normal" });
    const matrix = card.getByRole("button", { name: "Matrix" });
    await expect(normal).toHaveAttribute("aria-pressed", "true");
    await expect(html(page)).not.toHaveAttribute("data-ogis-look", /.+/);

    await matrix.click();
    await expect(matrix).toHaveAttribute("aria-pressed", "true");
    await expect(html(page)).toHaveAttribute("data-ogis-look", "matrix");
    await expect(html(page)).toHaveAttribute("data-bs-theme", "dark");
    await expect(page.locator(".ogis-panel .ogis-matrix-rain")).toHaveCount(1);

    await normal.click();
    await expect(html(page)).not.toHaveAttribute("data-ogis-look", /.+/);
    await expect(page.locator(".ogis-matrix-rain")).toHaveCount(0);
  });

  test("remembers Matrix after a reload", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await page
      .locator(".ogis-look-card")
      .getByRole("button", { name: "Matrix" })
      .click();
    await expect
      .poll(async () =>
        readStoredState(
          await page.evaluate(() => localStorage.getItem("ogis_look_app")),
        ),
      )
      .toEqual({ look: "matrix" });

    await page.reload();
    await waitForMapReady(page);
    await expect(html(page)).toHaveAttribute("data-ogis-look", "matrix");
  });

  test("leaves the map untouched", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    const mapStyle = () =>
      page.locator(".ogis-map").evaluate((el) => {
        const s = getComputedStyle(el);
        const c = getComputedStyle(el.querySelector("canvas"));
        return [s.filter, s.opacity, c.filter, c.opacity].join("|");
      });
    const before = await mapStyle();

    await page
      .locator(".ogis-look-card")
      .getByRole("button", { name: "Matrix" })
      .click();
    await expect(html(page)).toHaveAttribute("data-ogis-look", "matrix");
    expect(await mapStyle()).toBe(before);
  });
});
