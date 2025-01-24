export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">利用規約</h1>

      <div className="prose prose-sm max-w-none">
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">1. はじめに</h2>
          <p>
            本利用規約（以下「本規約」）は、当サービス「Vent」（以下「本サービス」）の利用条件を定めるものです。
            ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">2. 免責事項</h2>
          <p>
            本サービスは、投稿内容について一切の責任を負いません。
            ユーザーご自身の責任において本サービスをご利用ください。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">3. 禁止事項</h2>
          <ul className="list-inside list-disc">
            <li>法令または公序良俗に違反する行為</li>
            <li>他のユーザーに対する誹謗中傷、脅迫、嫌がらせ行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>その他、本サービスが不適切と判断する行為</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">4. 変更</h2>
          <p>
            本規約は、予告なく変更される場合があります。
            変更後の利用規約は、本サービス上に掲載された時点で効力を生じるものとします。
          </p>
        </section>
      </div>
    </div>
  );
}
