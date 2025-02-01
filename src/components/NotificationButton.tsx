"use client";

import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { useState } from "react";
import { toast } from "react-hot-toast";

export function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );

  const handleSubscribe = async () => {
    try {
      // サービスワーカーの登録
      const registration = await navigator.serviceWorker.ready;

      // 通知の許可を要求
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("通知の許可が必要です");
      }
      console.log("通知が許可されました");

      // プッシュ通知の購読
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);

      console.log("プッシュ通知の設定完了しました");
    } catch (subscribeError: unknown) {
      if (subscribeError instanceof Error) {
        console.error("プッシュ通知サブスクリプションエラー:", subscribeError);
        console.error("エラーの詳細:", {
          name: subscribeError.name,
          message: subscribeError.message,
          stack: subscribeError.stack,
        });
      }
      toast.error("プッシュ通知の設定に失敗しました");
      return;
    }
  };

  const handleSendNotification = async () => {
    try {
      console.log("通知権限の状態:", Notification.permission);

      if (!("Notification" in window)) {
        console.error("このブラウザは通知をサポートしていません");
        toast.error("このブラウザは通知をサポートしていません");
        return;
      }

      // Service Workerのサポート確認
      if (!("serviceWorker" in navigator)) {
        console.error("このブラウザはService Workerをサポートしていません");
        toast.error("このブラウザはService Workerをサポートしていません");
        return;
      }

      // Push APIのサポート確認
      if (!("PushManager" in window)) {
        console.error("このブラウザはプッシュ通知をサポートしていません");
        toast.error("このブラウザはプッシュ通知をサポートしていません");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      console.log("Service Worker登録状態:", registration);

      try {
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        console.log("プッシュ通知サブスクリプション成功:", newSubscription);
        setSubscription(newSubscription);
        setIsSubscribed(true);

        if (!newSubscription) {
          toast.error("通知の設定が必要です");
          return;
        }

        await fetch("/api/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: newSubscription,
            payload: {
              title: "テスト通知",
              body: "プッシュ通知のテストです",
              url: "/",
            },
          }),
        });
        console.log("テスト通知を送信しました");
      } catch (subscribeError: unknown) {
        if (subscribeError instanceof Error) {
          console.error(
            "プッシュ通知サブスクリプションエラー:",
            subscribeError,
          );
          console.error("エラーの詳細:", {
            name: subscribeError.name,
            message: subscribeError.message,
            stack: subscribeError.stack,
          });
        }
        toast.error("プッシュ通知の設定に失敗しました");
        return;
      }
    } catch (error) {
      console.error("通知設定エラー:", error);
      toast.error("通知の設定に失敗しました");
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={() => void handleSubscribe()} disabled={isSubscribed}>
        {isSubscribed ? "通知設定済み" : "通知を有効にする"}
      </Button>
      {isSubscribed && (
        <Button
          onClick={() => void handleSendNotification()}
          variant="secondary"
        >
          テスト通知を送信
        </Button>
      )}
    </div>
  );
}
