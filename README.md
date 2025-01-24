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

## MVP (Minimum Viable prduct)

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

このアプリに設計思想や使い方を示す情報をおしゃれにフロント画面に追加して。
install shadcn

## データベース操作コマンド

本プロジェクトでは開発環境（dev）と本番環境（prd）の2つのデータベースを使用しています。
それぞれの環境に対して以下のコマンドが利用可能です。

### 開発環境（Development）用コマンド

```bash
# マイグレーションファイルの生成と適用
pnpm db:dev:generate

# スキーマの変更をDBに直接反映（開発時のみ使用推奨）
pnpm db:dev:push

# DBの内容をGUIで確認・編集
pnpm db:dev:studio

# シードデータの投入
pnpm db:dev:seed
```

### 本番環境（prduction）用コマンド

```bash
# マイグレーションファイルの生成と適用
pnpm db:prd:generate

# スキーマの変更をDBに直接反映（緊急時のみ使用）
pnpm db:prd:push

# DBの内容をGUIで確認・編集
pnpm db:prd:studio

# シードデータの投入
pnpm db:prd:seed
```

### 本番環境へのスキーマ変更手順

本番環境へのスキーマ変更は以下の手順で安全に行います：

1. **開発環境での検証**

```bash
# 開発環境でマイグレーションファイルを生成
pnpm db:dev:generate

# 開発環境でマイグレーションをテスト
pnpm db:dev:push
```

2. **マイグレーションファイルの確認**

- `prisma/migrations` ディレクトリに生成されたSQLファイルの内容を確認
- データロスが発生しないか確認
- インデックスやユニーク制約の変更による影響を確認

3. **本番環境への適用**

```bash
# 本番環境のバックアップを作成（可能な場合）
# Supabaseコンソールでバックアップを作成

# マイグレーションの実行（本番環境）
pnpm db:prd:generate

# マイグレーション後の動作確認
pnpm db:prd:studio
```

4. **問題発生時のロールバック手順**

```bash
# 直前のマイグレーションを取り消す場合
pnpm prisma migrate reset --force --skip-seed --env-file .env.prd

# または、バックアップからの復元（Supabaseコンソールから実行）
```

### スキーマ変更時の注意事項

- 本番環境では必ず `db:prd:generate` を使用し、`db:prd:push` は使用しないでください
- データ損失が発生する可能性がある変更（カラム削除など）は特に慎重に行ってください
- 大規模なデータを扱うテーブルの変更は、サービスのオフピーク時に実行してください
- 変更前に必ずバックアップを作成してください
- マイグレーション実行後は、アプリケーションの主要機能をテストしてください

### コマンドの使用タイミング

#### db:\*:generate

- 新しいスキーマの変更を行った後
- チームメンバーのスキーマ変更をプルした後
- マイグレーション履歴を残したい変更を行う時

#### db:\*:push

- 開発環境での急速なプロトタイピング時
- マイグレーション履歴を残す必要がない小さな変更時
- ※本番環境では極力使用を避け、必ずマイグレーションを使用すること

#### db:\*:studio

- DBのデータを確認・検証したい時
- テストデータを手動で編集したい時
- データの不整合を調査する時

#### db:\*:seed

- 開発環境を新規セットアップした後
- テストデータをリセットしたい時
- ※本番環境では初期データ投入時のみ使用すること

### 注意事項

- 本番環境（prd）のコマンドは、十分な検証の後に実行してください
- 本番環境では可能な限り `db:prd:generate` を使用し、マイグレーション履歴を残すようにしてください
- 機密性の高いデータを扱う場合は、必ず適切なアクセス制御と認証を行ってください
