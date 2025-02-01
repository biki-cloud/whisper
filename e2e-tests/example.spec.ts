import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test("get started link", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Click the get started link.
  await page.getByRole("link", { name: "Get started" }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(
    page.getByRole("heading", { name: "Installation" }),
  ).toBeVisible();
});

test("should load the page using BASE_URL", async ({ page }) => {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  console.log(`BASE_URL: ${baseUrl}`);

  try {
    const response = await page.goto(baseUrl, { timeout: 5000 });

    // サーバーが起動している場合のテスト
    if (response) {
      expect(response.status()).toBe(200);
      await expect(page.locator("body")).toBeVisible();
    }
  } catch (error: any) {
    console.error(
      "サーバーに接続できません。アプリケーションサーバーが起動しているか確認してください。",
    );
    console.error(`Error: ${error.message}`);
    throw error;
  }
});
