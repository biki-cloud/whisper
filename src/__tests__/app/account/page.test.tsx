import { render, screen } from "~/utils/test-utils";
import AccountPage from "~/app/account/page";

// NotificationButtonコンポーネントをモック
jest.mock("~/components/NotificationButton", () => ({
  NotificationButton: () => (
    <div data-testid="notification-button">通知ボタン</div>
  ),
}));

describe("AccountPage", () => {
  it("アカウント設定画面が正しくレンダリングされること", () => {
    render(<AccountPage />);

    // ヘッダーが表示されていることを確認
    expect(screen.getByText("アカウント設定")).toBeInTheDocument();

    // 通知設定セクションが表示されていることを確認
    expect(screen.getByText("通知設定")).toBeInTheDocument();
    expect(screen.getByText("プッシュ通知")).toBeInTheDocument();
    expect(
      screen.getByText("新着情報をプッシュ通知で受け取ることができます"),
    ).toBeInTheDocument();

    // 通知ボタンが表示されていることを確認
    expect(screen.getByTestId("notification-button")).toBeInTheDocument();
  });
});
