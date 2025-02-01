import {
  screen,
  fireEvent,
  waitFor,
  renderWithProviders,
} from "~/utils/test-utils";
import { NotificationToggle } from "~/components/notification-toggle";

describe("NotificationToggle", () => {
  beforeEach(() => {
    // Notificationオブジェクトのモック
    Object.defineProperty(window, "Notification", {
      value: {
        permission: "default",
        requestPermission: jest.fn(),
      },
      writable: true,
    });
  });

  it("通知が許可されていない場合、通知オフボタンを表示する", async () => {
    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });
    expect(screen.getByText("通知オフ")).toBeInTheDocument();
  });

  it("通知が許可されている場合、通知オンボタンを表示する", async () => {
    Object.defineProperty(window.Notification, "permission", {
      value: "granted",
      writable: true,
    });

    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });
    expect(screen.getByText("通知オン")).toBeInTheDocument();
  });

  it("通知が拒否されている場合、エラーメッセージを表示する", async () => {
    Object.defineProperty(window.Notification, "permission", {
      value: "denied",
      writable: true,
    });

    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "通知" }));
    await waitFor(() => {
      expect(screen.getByText("通知が拒否されています")).toBeInTheDocument();
      expect(
        screen.getByText("ブラウザの設定から通知を許可してください"),
      ).toBeInTheDocument();
    });
  });

  it("通知が許可された場合、状態を更新する", async () => {
    window.Notification.requestPermission = jest
      .fn()
      .mockResolvedValue("granted");

    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "通知" }));
    await waitFor(() => {
      expect(screen.getByText("通知オン")).toBeInTheDocument();
      expect(
        screen.getByText("新着の投稿通知が届くようになりました"),
      ).toBeInTheDocument();
    });
  });
});
