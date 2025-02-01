import webPush from "web-push";
import { NextResponse } from "next/server";
import { env } from "~/env";

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
    const { subscription, payload } = (await request.json()) as RequestBody;

    await webPush.sendNotification(subscription, JSON.stringify(payload));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 },
    );
  }
}
