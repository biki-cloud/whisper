"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { Bell, BellOff } from "lucide-react";

export function NotificationToggle() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    // 通知の許可状態を確認
    const checkNotificationPermission = async () => {
      if (!isMounted) return;

      try {
        if (!("Notification" in window)) {
          setIsLoading(false);
          return;
        }

        const permission = Notification.permission;
        setIsSubscribed(permission === "granted");
        setIsLoading(false);
      } catch (error) {
        console.error("通知の権限確認中にエラーが発生しました:", error);
        setIsLoading(false);
      }
    };

    void checkNotificationPermission();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleNotification = async () => {
    try {
      if (!("Notification" in window)) {
        toast({
          title: "エラー",
          description: "このブラウザは通知をサポートしていません",
          variant: "destructive",
        });
        return;
      }

      if (Notification.permission === "denied") {
        toast({
          title: "通知が拒否されています",
          description: "ブラウザの設定から通知を許可してください",
          variant: "destructive",
        });
        return;
      }

      if (isSubscribed) {
        // 通知をオフにする処理
        setIsSubscribed(false);
        toast({
          title: "通知をオフにしました",
          description: "新着の投稿通知は届きません",
        });
      } else {
        // 通知の許可を要求
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setIsSubscribed(true);
          toast({
            title: "通知をオンにしました",
            description: "新着の投稿通知が届くようになりました",
          });
        }
      }
    } catch (error) {
      console.error("通知の設定中にエラーが発生しました:", error);
      toast({
        title: "エラー",
        description: "通知の設定中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  const buttonState = isLoading ? "loading" : isSubscribed ? "on" : "off";

  return (
    <Button
      variant={isSubscribed ? "default" : "outline"}
      size="sm"
      onClick={handleToggleNotification}
      disabled={isLoading}
      className="transition-all duration-200"
      aria-label="通知"
      data-testid="notification-toggle"
      data-loading={String(isLoading)}
      data-state={buttonState}
      aria-disabled={isLoading}
      {...(isLoading && { "aria-busy": "true" })}
    >
      {isLoading ? (
        <>
          <Bell className="mr-2 h-4 w-4 animate-pulse" />
          通知
        </>
      ) : isSubscribed ? (
        <>
          <Bell className="mr-2 h-4 w-4" />
          通知オン
        </>
      ) : (
        <>
          <BellOff className="mr-2 h-4 w-4" />
          通知オフ
        </>
      )}
    </Button>
  );
}
