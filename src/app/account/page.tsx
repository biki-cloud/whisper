import { NotificationButton } from "~/components/NotificationButton";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">アカウント設定</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>通知設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">プッシュ通知</h3>
                  <p className="text-sm text-muted-foreground">
                    新着情報をプッシュ通知で受け取ることができます
                  </p>
                </div>
                <NotificationButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
