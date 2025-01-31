import { test, expect } from "@playwright/test";

test.describe("新規投稿ページ", () => {
  test("新規投稿ページに遷移できる", async ({ page }) => {
    // 新規投稿ページに直接アクセス
    await page.goto("/post/new");

    // URLが正しいことを確認
    await expect(page).toHaveURL("/post/new");

    // 必要な要素が表示されていることを確認
    await expect(
      page.getByRole("heading", { name: "想いを投稿" }),
    ).toBeVisible();

    // 感情選択コンボボックス
    await expect(
      page.getByRole("combobox", { name: "感情を選択してください" }),
    ).toBeVisible();

    // メッセージ入力フィールド
    await expect(page.getByRole("textbox")).toBeVisible();

    // 投稿ボタン
    await expect(page.getByRole("button", { name: "投稿" })).toBeVisible();
  });
});
