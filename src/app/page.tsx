import { PostList } from "~/components/PostList";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Ventへようこそ 🎈
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="about">
              <AccordionTrigger>Ventって何ができるの？</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Ventは、誰でも気軽に想いを共有できる場所です。
                  名前を明かさずに、今の気持ちや考えていることを自由に投稿できます。
                  ちょっとした独り言から深い思考まで、あなたの「つぶやき」をお待ちしています。
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="features">
              <AccordionTrigger>Ventの特徴</AccordionTrigger>
              <AccordionContent>
                <ul className="text-muted-foreground list-disc space-y-2 pl-4">
                  <li>名前や登録なしで、すぐに投稿できます</li>
                  <li>
                    投稿はリアルタイムで表示されるので、会話が生まれやすい
                  </li>
                  <li>スマートフォンでもパソコンでも見やすい画面</li>
                  <li>サクサク快適に動作</li>
                  <li>安心して使える堅牢なシステム</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="usage">
              <AccordionTrigger>使ってみよう！</AccordionTrigger>
              <AccordionContent>
                <ol className="text-muted-foreground list-decimal space-y-2 pl-4">
                  <li>下のテキストボックスに、今の気持ちや考えを入力</li>
                  <li>「投稿する」ボタンを押すだけ！</li>
                  <li>あなたの想いは、すぐに他の人と共有されます</li>
                  <li>
                    みんなの投稿を見て、共感したり、新しい発見を見つけたり...
                  </li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="mx-auto max-w-2xl">
        <PostList />
      </div>
    </main>
  );
}
