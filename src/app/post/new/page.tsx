import { PostForm } from "~/components/PostForm";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader } from "~/components/ui/card";

export default function NewPostPage() {
  return (
    <main className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="bg-background/60 border-none shadow-lg backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="text-primary h-6 w-6" />
                <h1 className="from-primary to-primary-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
                  想いを投稿
                </h1>
              </div>
              <p className="text-muted-foreground text-center">
                今の気持ちを自由に表現してみましょう
              </p>
            </CardHeader>
            <CardContent>
              <PostForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
