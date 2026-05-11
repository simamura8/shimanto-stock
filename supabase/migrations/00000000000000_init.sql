-- 1. 在庫マスターテーブル (既存)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  current_stock NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  alert_threshold NUMERIC DEFAULT 20,
  category TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 卸先店舗テーブル (既存)
CREATE TABLE IF NOT EXISTS shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 入出庫履歴テーブル (既存)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory(id),
  shop_id UUID REFERENCES shops(id),
  type TEXT CHECK (type IN ('IN', 'OUT')),
  quantity NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
