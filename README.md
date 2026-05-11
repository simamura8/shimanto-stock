# 四万十・産直在庫管理システム (Shimanto Stock)

四万十の農業や産直市場での利用をイメージした、Next.js 14 (App Router) と Supabase を組み合わせたリアルタイム在庫管理システムのデモアプリです。

## 🌟 特徴

- **リアルタイム在庫表示:** 他のユーザーが在庫を更新すると、即座に数値が反映されます（Supabase Realtime）。
- **ダイナミック・アラート:** 在庫が基準値を下回ると赤色で強調表示。
- **品目管理:** 新しい野菜や加工品のマスター登録機能。
- **シンプル操作:** 現場での操作を想定した大きなボタンと直感的なUI。
- **マイグレーション管理:** Supabase CLI による確実なデータベースのバージョン管理。

## 🛠️ 開発スタック

- **Frontend:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **CLI:** Supabase CLI (Migration Management)
- **Styling:** Tailwind CSS + shadcn/ui

## 🚀 セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/simamura8/shimanto-stock.git
cd shimanto-stock
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local` を作成し、接続情報を設定します。
```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. データベースの構築 (Supabase CLI)
本プロジェクトは Supabase CLI によるマイグレーション管理に対応しています。

```bash
# Supabaseにログイン
npx supabase login

# プロジェクトとのリンク (初回のみ)
npx supabase link --project-ref your-project-ref

# マイグレーションの適用 (テーブル作成)
npx supabase db push

# 型定義の自動生成
npx supabase gen types typescript --project-id your-project-ref > src/types/supabase.ts
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

## 📝 データベース構造

### マスターテーブル
- `items`: 管理品目（野菜・果物・加工品など）の定義
- `stores`: 卸先店舗の定義
- `inventory`: 現在の在庫数とアラート設定（既存構造）

### 履歴・トランザクション
- `transactions`: 入出庫の全履歴

## 📂 フォルダ構成
- `supabase/migrations`: データベースの変更履歴（SQLファイル）
- `src/components`: UIコンポーネント（Dashboard, Modals等）
- `src/lib/supabase.ts`: Supabaseクライアント設定

## 🧪 テストデータの管理

開発やデモのために、1000件規模のテストデータを即座に投入・削除できる仕組みを用意しています。

### 事前準備
スクリプトを実行するために必要なパッケージをインストールしてください（未実施の場合）。

```bash
npm install @supabase/supabase-js dotenv
```

### 1. テストデータの投入
過去1年分の入出庫履歴（約1000件）とテスト用の店舗・品目を生成します。データには `is_test: true` フラグが付与され、名前の先頭に `[TEST]` が付きます。

```bash
node scratch/generate_test_data.js
```

### 2. テストデータの一括削除
`is_test: true` フラグが立っているデータのみを安全に一括削除します。本番環境で登録したデータには影響を与えません。

```bash
node scratch/delete_test_data.js
```

## 📄 ライセンス

MIT License
