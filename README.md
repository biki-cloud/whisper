# Vent 要件定義

## 概要

Ventは、ユーザーが匿名で1日1回投稿し、他者と共感を共有するプラットフォームです。

---

## 要件

### 基本機能

1. **投稿機能**

   - ユーザーは1日1回のみ投稿可能。
   - 投稿はその日の23:59:59に自動削除。

2. **共感機能**

   - 他ユーザーの投稿にスタンプで共感を表現可能。
   - 同じ投稿へのスタンプは1回のみ可能。

3. **匿名性**

   - 投稿時、ニックネームやIDは表示されず完全匿名。

4. **削除機能**
   - 投稿者は投稿を削除可能。
   - 削除後、同日中に再投稿は不可。

### アカウント管理

1. アカウント作成時のデータ

   - 必須: 一意のID、ニックネーム(後日実装予定)
   - 任意: メールアドレス、パスワード（後日実装予定）

2. 投稿履歴機能
   - アカウント作成者のみ、過去の投稿を記録・閲覧可能（MVP範囲外）。

---

## 非機能要件

1. **PWA対応**

   - モバイルおよびデスクトップでの利用を想定。

2. **パフォーマンス**

   - 軽量かつ高速な動作。

3. **セキュリティ**
   - 投稿内容およびユーザーデータの暗号化。

---

## 技術スタック

1. フロントエンド: React (TypeScript) + Tailwind CSS
2. バックエンド: t3-stack（Next.js + trpc + Prisma）
3. ホスティング: Vercel
4. データベース: PlanetScale
5. テスト: Jest（ユニットテスト）+ Playwright（E2Eテスト）

---

## MVP (Minimum Viable Product)

1. **投稿機能**

   - 1日1回の投稿制限。
   - 投稿の自動削除（その日の23:59:59）。

2. **共感機能**

   - 他ユーザーの投稿に1回だけスタンプ可能。

3. **削除機能**

   - 投稿の削除が可能。
   - 削除後の再投稿不可。

4. **PWA化**
   - サービスのPWA対応を完了。

---

## 今後の開発展望

0. **アカウント制度の導入**

   - ユーザIDとニックネーム(任意)を設定し、アカウントを作成する。
   - emailとパスワードは将来導入するかもしれないのでそのつもりで開発する。

1. **投稿履歴の閲覧機能**

   - アカウント作成者が過去の自分の投稿を閲覧できる機能を追加。
   - 感情分析してダッシュボードとか作りたい

2. **スタンプのカスタマイズ**

   - ユーザーが選択可能なスタンプデザインを追加。
   - 開発者側からのスタンプを追加

3. **メール通知機能**

   - 投稿内容の確認や共感スタンプが押された際に通知を送る機能。
   - PWA化しているのでスマホの通知ができれば最高

4. **モデレーション機能**

   - 不適切な投稿を自動検知し、非表示にする仕組みを導入。

5. UUID + ローカルストレージ
   概要: サーバー側でUUID（ユニークな識別子）を生成し、クライアントのローカルストレージに保存します。ユーザーが初回アクセス時にUUIDを生成し、以降は同じ識別子を使用。
   利点:
   プライバシーに配慮しながら、同一クライアントを継続的に識別可能。
   クッキーのようにサーバーに送信されないため、追跡感が薄い。
   ユーザーが意図的に削除しない限り永続的に保持。
   注意点: ユーザーがローカルストレージを削除した場合は新しいUUIDを生成。
   import { v4 as uuidv4 } from 'uuid';

```
// 初回アクセス時にUUIDを生成し、ローカルストレージに保存
function getOrCreateClientId() {
const clientIdKey = 'vent-client-id';
let clientId = localStorage.getItem(clientIdKey);

if (!clientId) {
clientId = uuidv4();
localStorage.setItem(clientIdKey, clientId);
}

return clientId;
}

console.log('Your Client ID:', getOrCreateClientId());
```

今のIPアドレスをclientIDに変更するイメージ

匿名のユーザ識別子に今はipaddressを使用していますが、こちらを以下のように変更してください。5. UUID + ローカルストレージ
概要: サーバー側でUUID（ユニークな識別子）を生成し、クライアントのローカルストレージに保存します。ユーザーが初回アクセス時にUUIDを生成し、以降は同じ識別子を使用。
利点:
プライバシーに配慮しながら、同一クライアントを継続的に識別可能。
クッキーのようにサーバーに送信されないため、追跡感が薄い。
ユーザーが意図的に削除しない限り永続的に保持。
注意点: ユーザーがローカルストレージを削除した場合は新しいUUIDを生成。
こんな感じの実装になりそう。簡単に。

```
import { v4 as uuidv4 } from 'uuid';

// 初回アクセス時にUUIDを生成し、ローカルストレージに保存
function getOrCreateAnonymousId() {
const anonymousIdKey = 'vent-anonymous-id';
let anonymousId = localStorage.getItem(anonymousIdKey);

if (!anonymousId) {
anonymousId = uuidv4();
localStorage.setItem(anonymousIdKey, anonymousId);
}

return anonymousId;
}

console.log('Your Client ID:', getOrCreateAnonymousId());
```

今のIPアドレスをanonymousIdに変更するイメージ
