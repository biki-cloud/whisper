"use client";

import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { useState } from "react";

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
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      alert("プッシュ通知の設定に失敗しました");
    }
  };

  const handleSendNotification = async () => {
    if (!subscription) return;

    console.log("通知を開始します");
    try {
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
      console.log("通知が終了しました");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("通知の送信に失敗しました");
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
