# 四万十・産直在庫管理システム (Shimanto Stock)

四万十の農業や産直市場での利用をイメージした、Next.js 14 (App Router) と Supabase を組み合わせたリアルタイム在庫管理システムのデモアプリです。

![Dashboard Preview](https://github.com/simamura8/shimanto-stock/raw/main/public/preview.png) *(※プレビュー画像はイメージです)*

## 🌟 特徴

- **リアルタイム在庫表示:** 他のユーザーが在庫を更新すると、画面をリロードすることなく即座に数値が反映されます（Supabase Realtime）。
- **ダイナミック・アラート:** 設定された「在庫少のアラート閾値」を下回ると、品目が赤色で強調表示されます。
- **シンプル操作:** 現場での「押し間違い」を防ぐため、大きなボタンと2ステップの入力フォーム（品目選択 → 数量入力）を採用しています。
- **履歴管理:** 直近の入出庫履歴を一覧表示し、卸先店舗ごとのフィルタリングも可能です。
- **モダンなデザイン:** 四万十の自然をイメージしたエメラルドグリーン基調のクリーンなデザイン。

## 🛠️ 開発スタック

- **Frontend:** Next.js 14+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + shadcn/ui
- **Icons:** Lucide React

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
`.env.local` ファイルを作成し、Supabaseの接続情報を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### 4. データベースの構築 (Supabase SQL)
SupabaseのSQL Editorで、プロジェクト内にある `システム構築仕様書.md` に記載されたSQLを実行してテーブルを作成してください。

### 5. 開発サーバーの起動
```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000) でアプリを確認できます。

## 📝 データベース設計

3つの主要なテーブルで構成されています：
- `inventory`: 品目名、現在庫、単位、アラート閾値
- `shops`: 卸先店舗（道の駅、スーパーなど）
- `transactions`: 入出庫履歴

## 📄 ライセンス

MIT License
