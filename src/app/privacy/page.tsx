export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">プライバシーポリシー</h1>

      <div className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">1. 個人情報の収集</h2>
          <p>
            本サービスでは、サービスの提供に必要な範囲で、以下の個人情報を収集する場合があります：
          </p>
          <ul className="list-inside list-disc">
            <li>投稿内容</li>
            <li>アクセスログ</li>
            <li>Cookie情報</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">2. 個人情報の利用目的</h2>
          <p>収集した個人情報は、以下の目的で利用します：</p>
          <ul className="list-inside list-disc">
            <li>本サービスの提供・運営</li>
            <li>サービスの改善・新機能の開発</li>
            <li>不正アクセスの防止</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            3. 個人情報の第三者提供
          </h2>
          <p>
            法令に基づく場合を除き、収集した個人情報を第三者に提供することはありません。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">4. セキュリティ対策</h2>
          <p>
            個人情報の漏洩、滅失、毀損等を防ぐため、適切なセキュリティ対策を実施しています。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            5. プライバシーポリシーの変更
          </h2>
          <p>
            本プライバシーポリシーは、必要に応じて変更される場合があります。
            重要な変更がある場合は、本サービス上で通知します。
          </p>
        </section>
      </div>
    </div>
  );
}
