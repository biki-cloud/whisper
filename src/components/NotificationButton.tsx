"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { useToast } from "~/hooks/use-toast";
import { Bell, BellRing, Send } from "lucide-react";
import { api } from "~/trpc/react";

const PUSH_NOTIFICATION_STORAGE_KEY = "push-notification-status";
const PUSH_SUBSCRIPTION_STORAGE_KEY = "push-subscription";

export function NotificationButton() {
  const { toast } = useToast();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const { mutate: savePushSubscription } =
    api.notification.savePushSubscription.useMutation({
      onSuccess: () => {
        console.log("Push通知の購読情報を保存しました");
      },
      onError: (error) => {
        console.error("Push通知の購読情報の保存に失敗しました:", error);
        toast({
          title: "エラー",
          description: "通知の設定に失敗しました",
          variant: "destructive",
        });
      },
    });

  const { mutate: deletePushSubscription } =
    api.notification.deletePushSubscription.useMutation({
      onSuccess: () => {
        console.log("Push通知の購読情報を削除しました");
      },
      onError: (error) => {
        console.error("Push通知の購読情報の削除に失敗しました:", error);
      },
    });

  useEffect(() => {
    let isMounted = true;

    const initializeNotificationState = async () => {
      if (!isMounted) return;

      try {
        if (!("Notification" in window)) {
          setIsLoading(false);
          return;
        }

        // ローカルストレージから状態を読み込む
        const storedStatus = localStorage.getItem(
          PUSH_NOTIFICATION_STORAGE_KEY,
        );
        const storedSubscription = localStorage.getItem(
          PUSH_SUBSCRIPTION_STORAGE_KEY,
        );

        if (storedStatus === "true" && storedSubscription) {
          const parsedSubscription = JSON.parse(storedSubscription);
          if (
            parsedSubscription &&
            typeof parsedSubscription === "object" &&
            "endpoint" in parsedSubscription
          ) {
            try {
              const registration = await navigator.serviceWorker.ready;
              const existingSubscription =
                await registration.pushManager.getSubscription();

              if (existingSubscription) {
                setSubscription(existingSubscription);
                setIsSubscribed(true);
                // データベースに保存
                savePushSubscription({
                  subscription: JSON.stringify(existingSubscription),
                });
              } else {
                const newSubscription =
                  await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                  });
                setSubscription(newSubscription);
                setIsSubscribed(true);
                // データベースに保存
                savePushSubscription({
                  subscription: JSON.stringify(newSubscription),
                });
              }
            } catch (error) {
              console.error("購読の再構築に失敗しました:", error);
              localStorage.removeItem(PUSH_NOTIFICATION_STORAGE_KEY);
              localStorage.removeItem(PUSH_SUBSCRIPTION_STORAGE_KEY);
              setIsSubscribed(false);
              setSubscription(null);
            }
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("通知の初期化中にエラーが発生しました:", error);
        setIsLoading(false);
      }
    };

    void initializeNotificationState();

    return () => {
      isMounted = false;
    };
  }, [savePushSubscription]);

  useEffect(() => {
    if (isSubscribed && subscription) {
      localStorage.setItem(PUSH_NOTIFICATION_STORAGE_KEY, "true");
      localStorage.setItem(
        PUSH_SUBSCRIPTION_STORAGE_KEY,
        JSON.stringify(subscription),
      );
    } else {
      localStorage.removeItem(PUSH_NOTIFICATION_STORAGE_KEY);
      localStorage.removeItem(PUSH_SUBSCRIPTION_STORAGE_KEY);
    }
  }, [isSubscribed, subscription]);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "エラー",
          description: "通知の許可が必要です",
          variant: "destructive",
        });
        return;
      }

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);

      // データベースに保存
      savePushSubscription({
        subscription: JSON.stringify(newSubscription),
      });

      toast({
        title: "プッシュ通知を設定しました",
        description: "テスト通知を送信できます",
      });
    } catch (subscribeError: unknown) {
      if (subscribeError instanceof Error) {
        console.error("プッシュ通知サブスクリプションエラー:", subscribeError);
      }
      toast({
        title: "エラー",
        description: "プッシュ通知の設定に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true);
      if (subscription) {
        await subscription.unsubscribe();
        // データベースから削除
        deletePushSubscription();
      }
      setSubscription(null);
      setIsSubscribed(false);
      toast({
        title: "通知をオフにしました",
        description: "プッシュ通知は届かなくなります",
      });
    } catch (error) {
      console.error("通知解除エラー:", error);
      toast({
        title: "エラー",
        description: "通知の解除に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!subscription) {
      toast({
        title: "エラー",
        description: "通知の設定が必要です",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      await fetch("/api/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription,
          payload: {
            title: "テスト通知",
            body: "プッシュ通知のテストです",
            url: "/",
          },
        }),
      });
      toast({
        title: "テスト通知を送信しました",
        description: "まもなく通知が届きます",
      });
    } catch (error) {
      console.error("通知送信エラー:", error);
      toast({
        title: "エラー",
        description: "通知の送信に失敗しました",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isSubscribed ? "default" : "outline"}
        size="sm"
        onClick={() =>
          void (isSubscribed ? handleUnsubscribe() : handleSubscribe())
        }
        disabled={isLoading}
        className="transition-all duration-200"
        aria-label={isSubscribed ? "プッシュ通知を解除" : "プッシュ通知を設定"}
        data-testid="push-notification-subscribe-button"
        data-loading={String(isLoading)}
        data-state={
          isLoading ? "loading" : isSubscribed ? "subscribed" : "unsubscribed"
        }
        aria-disabled={isLoading}
        {...(isLoading && { "aria-busy": "true" })}
      >
        {isLoading ? (
          <>
            <Bell className="mr-2 h-4 w-4 animate-pulse" />
            読み込み中
          </>
        ) : isSubscribed ? (
          <>
            <BellRing className="mr-2 h-4 w-4" />
            通知オン
          </>
        ) : (
          <>
            <Bell className="mr-2 h-4 w-4" />
            通知オフ
          </>
        )}
      </Button>
      {isSubscribed && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleSendNotification()}
          disabled={isSending}
          className="transition-all duration-200"
          aria-label="テスト通知を送信"
          data-testid="push-notification-test-button"
          data-loading={String(isSending)}
          data-state={isSending ? "sending" : "idle"}
          aria-disabled={isSending}
          {...(isSending && { "aria-busy": "true" })}
        >
          {isSending ? (
            <>
              <Send className="mr-2 h-4 w-4 animate-pulse" />
              送信中
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              テスト通知
            </>
          )}
        </Button>
      )}
    </div>
  );
}
