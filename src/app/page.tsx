import Link from "next/link";
import { Sparkles } from "lucide-react";
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
    <main className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-12">
        <Card className="bg-background/60 mb-12 border-none shadow-lg backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="text-primary h-8 w-8" />
              <CardTitle className="from-primary to-primary-foreground bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
                Ventへようこそ
              </CardTitle>
            </div>
            <p className="text-muted-foreground text-center">
              あなたの想いを、自由に。安全に。
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="about" className="border-muted border-b">
                <AccordionTrigger className="hover:text-primary text-lg font-medium">
                  Ventって何ができるの？
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p className="leading-relaxed">
                    Ventは、誰でも気軽に想いを共有できる特別な場所です。
                    名前を明かさずに、今の気持ちや考えていることを自由に投稿できます。
                    ちょっとした独り言から深い思考まで、あなたの「つぶやき」をお待ちしています。
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features" className="border-muted border-b">
                <AccordionTrigger className="hover:text-primary text-lg font-medium">
                  Ventの特徴
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="text-muted-foreground grid gap-3">
                    <li className="flex items-center gap-2">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                      名前や登録なしで、すぐに投稿できます
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                      投稿はリアルタイムで表示されるので、会話が生まれやすい
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                      スマートフォンでもパソコンでも見やすい画面
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                      サクサク快適に動作
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="bg-primary h-1.5 w-1.5 rounded-full"></span>
                      安心して使える堅牢なシステム
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="usage">
                <AccordionTrigger className="hover:text-primary text-lg font-medium">
                  使ってみよう！
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="text-muted-foreground grid gap-3">
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                        1
                      </span>
                      下のテキストボックスに、今の気持ちや考えを入力
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                        2
                      </span>
                      「投稿する」ボタンを押すだけ！
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                        3
                      </span>
                      あなたの想いは、すぐに他の人と共有されます
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="bg-primary/10 text-primary flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium">
                        4
                      </span>
                      みんなの投稿を見て、共感したり、新しい発見を見つけたり...
                    </li>
                  </ol>
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
