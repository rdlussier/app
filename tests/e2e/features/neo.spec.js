import { test, expect } from "../helpers/test.js";
import {
  trackConsoleErrors,
  expectNoConsoleErrors,
} from "../helpers/console.js";
import { waitForMapReady } from "../helpers/panel";

/** The Neo showcase theme: always on, always dark, falling code in the panel. */

test.beforeEach(({ page }) => trackConsoleErrors(page));
test.afterEach(({ page }) => expectNoConsoleErrors(page));

test.describe("Neo theme", () => {
  test.use({ colorScheme: "light" });

  test("is always dark, even when the device prefers light", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect(page.locator("html")).toHaveAttribute(
      "data-ogis-theme",
      "neo",
    );
    await expect(page.locator("html")).toHaveAttribute("data-bs-theme", "dark");
  });

  test("draws falling code behind the side panel only", async ({ page }) => {
    await page.goto("/");
    await waitForMapReady(page);
    await expect(page.locator(".ogis-panel .ogis-neo-rain")).toHaveCount(1);
    await expect(page.locator(".ogis-map .ogis-neo-rain")).toHaveCount(0);
  });
});
