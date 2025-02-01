import {
  screen,
  fireEvent,
  waitFor,
  renderWithProviders,
} from "~/utils/test-utils";
import { NotificationToggle } from "~/components/notification-toggle";

describe("NotificationToggle", () => {
  let localStorageMock: Record<string, string>;

  beforeEach(() => {
    // localStorageのモック
    localStorageMock = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] ?? null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => delete localStorageMock[key]),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

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
    localStorage.setItem("notification-status", "true");

    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });
    expect(screen.getByText("通知オン")).toBeInTheDocument();
  });

  it("localStorageに保存された状態が優先される", async () => {
    Object.defineProperty(window.Notification, "permission", {
      value: "granted",
      writable: true,
    });
    localStorage.setItem("notification-status", "false");

    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });
    expect(screen.getByText("通知オフ")).toBeInTheDocument();
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

  it("通知が許可された場合、状態を更新しlocalStorageに保存する", async () => {
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
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "notification-status",
        "true",
      );
    });
  });

  it("通知をオフにした場合、localStorageの状態も更新する", async () => {
    Object.defineProperty(window.Notification, "permission", {
      value: "granted",
      writable: true,
    });
    localStorage.setItem("notification-status", "true");

    renderWithProviders(<NotificationToggle />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "通知" })).not.toBeDisabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "通知" }));
    await waitFor(() => {
      expect(screen.getByText("通知オフ")).toBeInTheDocument();
      expect(
        screen.getByText("新着の投稿通知は届きません"),
      ).toBeInTheDocument();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "notification-status",
        "false",
      );
    });
  });
});
