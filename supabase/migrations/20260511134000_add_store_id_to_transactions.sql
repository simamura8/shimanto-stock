-- transactionsテーブルに新しい店舗マスター用の列を追加
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);

-- 既存のショップテーブルの内容を必要に応じて移行するための準備
-- (今回は新規作成なので、新しい履歴は store_id を使うようにします)
