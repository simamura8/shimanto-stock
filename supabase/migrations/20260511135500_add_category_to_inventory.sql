-- inventoryテーブルにカテゴリ列を追加
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category TEXT;

-- 既存データにデフォルト値を設定（任意）
UPDATE inventory SET category = '未分類' WHERE category IS NULL;
