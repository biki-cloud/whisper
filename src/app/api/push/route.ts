import webPush from "web-push";
import { NextResponse } from "next/server";
import { env } from "~/env";

console.log("VAPID設定:", {
  email: env.VAPID_EMAIL,
  publicKey: env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKeyLength: env.VAPID_PRIVATE_KEY?.length,
});

webPush.setVapidDetails(
  `mailto:${env.VAPID_EMAIL}`,
  env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

interface PushPayload {
  title: string;
  body: string;
  url: string;
}

interface RequestBody {
  subscription: webPush.PushSubscription;
  payload: PushPayload;
}

export async function POST(request: Request) {
  try {
    console.log("Push通知リクエスト受信");
    const { subscription, payload } = (await request.json()) as RequestBody;

    console.log("サブスクリプション情報:", {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });
    console.log("ペイロード:", payload);

    await webPush.sendNotification(subscription, JSON.stringify(payload));
    console.log("Push通知送信成功");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push通知送信エラー:", error);
    return NextResponse.json(
      {
        error: "Failed to send push notification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
