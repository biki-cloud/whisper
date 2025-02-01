"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { env } from "~/env";
import { useToast } from "~/hooks/use-toast";
import { Bell, BellRing, Send } from "lucide-react";

export function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      // サービスワーカーの登録
      const registration = await navigator.serviceWorker.ready;

      // 通知の許可を要求
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({
          title: "エラー",
          description: "通知の許可が必要です",
          variant: "destructive",
        });
        return;
      }

      // プッシュ通知の購読
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      setSubscription(newSubscription);
      setIsSubscribed(true);
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
        onClick={() => void handleSubscribe()}
        disabled={isLoading || isSubscribed}
        className="transition-all duration-200"
        aria-label="プッシュ通知を設定"
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
