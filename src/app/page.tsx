import Link from "next/link";
import { Sparkles, Trash2, Clock, Smile, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <Card className="mb-12 border-none bg-background/60 shadow-lg backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <CardTitle className="bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-4xl font-bold text-transparent">
                Ventへようこそ
              </CardTitle>
            </div>
            <p className="text-center text-lg text-muted-foreground">
              完全匿名で、あなたの心を解放する場所
            </p>
            <p className="text-center text-sm text-muted-foreground">
              心理学的に、感情を吐き出すことでストレスが軽減します
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none bg-primary/5">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">完全匿名</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    登録不要で、誰にも特定されません
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-primary/5">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <Clock className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">1日1回投稿</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    その日の想いを大切に
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-primary/5">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <Trash2 className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">24時間で消去</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    翌日には自動で削除されます
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none bg-primary/5">
                <CardContent className="flex flex-col items-center gap-2 p-4">
                  <Smile className="h-8 w-8 text-primary" />
                  <h3 className="text-lg font-semibold">スタンプ反応</h3>
                  <p className="text-center text-sm text-muted-foreground">
                    共感はスタンプで表現
                  </p>
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="install" className="border-b border-muted">
                <AccordionTrigger className="text-lg font-medium hover:text-primary">
                  ホーム画面にアプリとして追加する方法
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium">iPhoneの場合:</h4>
                      <ol className="grid gap-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            1
                          </span>
                          Safari/Chromeでサイトを開く
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            2
                          </span>
                          共有ボタンをタップ
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            3
                          </span>
                          「ホーム画面に追加」を選択
                        </li>
                      </ol>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium">Androidの場合:</h4>
                      <ol className="grid gap-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            1
                          </span>
                          Chrome/Safariでサイトを開く
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            2
                          </span>
                          メニューから「ホーム画面に追加」を選択
                        </li>
                      </ol>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/posts">みんなの投稿を見る</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/post/new">投稿してみる</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
