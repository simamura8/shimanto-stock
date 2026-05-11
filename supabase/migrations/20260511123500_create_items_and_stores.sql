-- 品目マスター (items)
CREATE TABLE IF NOT EXISTS items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  unit text NOT NULL,
  alert_threshold integer DEFAULT 0,
  category text,
  created_at timestamp with time zone DEFAULT now()
);

-- 店舗マスター (stores)
CREATE TABLE IF NOT EXISTS stores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  location text,
  created_at timestamp with time zone DEFAULT now()
);
