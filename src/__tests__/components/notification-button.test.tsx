import { render, screen, fireEvent, waitFor, act } from "~/utils/test-utils";
import { NotificationButton } from "~/components/NotificationButton";

// env.jsのモック
jest.mock("~/env", () => ({
  env: {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "test-vapid-key",
  },
}));

// モックの設定
const mockServiceWorker = {
  ready: Promise.resolve({
    pushManager: {
      subscribe: jest.fn(),
      getSubscription: jest.fn(),
    },
  }),
};

const mockSubscription = {
  unsubscribe: jest.fn(),
  endpoint: "https://example.com/push",
};

describe("NotificationButton", () => {
  beforeEach(() => {
    // localStorageのモック
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    // Service Workerのモック
    Object.defineProperty(window.navigator, "serviceWorker", {
      value: mockServiceWorker,
      writable: true,
    });

    // Notificationのモック
    Object.defineProperty(window, "Notification", {
      value: {
        requestPermission: jest.fn().mockResolvedValue("granted"),
        permission: "granted",
      },
      writable: true,
    });

    // fetchのモック
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });

    // モックをリセット
    jest.clearAllMocks();
  });

  it("初期状態で通知オフボタンが表示される", () => {
    render(<NotificationButton />);
    expect(screen.getByText("通知オフ")).toBeInTheDocument();
  });

  it("通知を有効にすると通知オンボタンとテスト通知ボタンが表示される", async () => {
    await mockServiceWorker.ready.then((registration) => {
      registration.pushManager.subscribe.mockResolvedValueOnce(
        mockSubscription,
      );
    });

    render(<NotificationButton />);

    const subscribeButton = screen.getByText("通知オフ");
    await act(async () => {
      await fireEvent.click(subscribeButton);
    });

    await waitFor(() => {
      expect(screen.getByText("通知オン")).toBeInTheDocument();
      expect(screen.getByText("テスト通知")).toBeInTheDocument();
    });
  });

  it("通知をオフにすると通知オフボタンが表示される", async () => {
    await mockServiceWorker.ready.then((registration) => {
      registration.pushManager.subscribe.mockResolvedValueOnce(
        mockSubscription,
      );
    });

    render(<NotificationButton />);

    // 通知をオンにする
    const subscribeButton = screen.getByText("通知オフ");
    await act(async () => {
      await fireEvent.click(subscribeButton);
    });

    await waitFor(() => {
      expect(screen.getByText("通知オン")).toBeInTheDocument();
    });

    // 通知をオフにする
    const unsubscribeButton = screen.getByText("通知オン");
    await act(async () => {
      await fireEvent.click(unsubscribeButton);
    });

    await waitFor(() => {
      expect(screen.getByText("通知オフ")).toBeInTheDocument();
      expect(screen.queryByText("テスト通知")).not.toBeInTheDocument();
    });
  });

  it("テスト通知を送信できる", async () => {
    await mockServiceWorker.ready.then((registration) => {
      registration.pushManager.subscribe.mockResolvedValueOnce(
        mockSubscription,
      );
    });

    render(<NotificationButton />);

    // 通知をオンにする
    const subscribeButton = screen.getByText("通知オフ");
    await act(async () => {
      await fireEvent.click(subscribeButton);
    });

    await waitFor(() => {
      expect(screen.getByText("テスト通知")).toBeInTheDocument();
    });

    // テスト通知を送信
    const testButton = screen.getByText("テスト通知");
    await act(async () => {
      await fireEvent.click(testButton);
    });

    expect(fetch).toHaveBeenCalledWith("/api/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: mockSubscription,
        payload: {
          title: "テスト通知",
          body: "プッシュ通知のテストです",
          url: "/",
        },
      }),
    });
  });
});
