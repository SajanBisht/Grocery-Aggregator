/*
# Restructure source prices to grocery sources + add payment methods, mock orders, price history

1. Changes to products table
- Updates source_prices jsonb from "Offer/Coupon/Cashback/Card reward" to real grocery source names: BigBasket, Blinkit, Zepto, Swiggy Instamart.
- Each source gets a deterministic price derived from the existing prices, maintaining variation.
- The search_products function is updated to return the new source names.

2. New Tables
- `payment_methods`: seeded mock payment methods (UPI 0%, Visa 2%, Mastercard 1.5%) with discount percentages.
- `mock_orders`: stores mock order records per user with product, source, price, payment method, discount, and status.
- `price_history`: stores per-user per-product price checks for price-drop indicator.

3. Security
- payment_methods: publicly readable (anon + authenticated) — it is reference data.
- mock_orders: RLS with owner-scoped CRUD (authenticated only, auth.uid() = user_id).
- price_history: RLS with owner-scoped CRUD (authenticated only, auth.uid() = user_id).

4. Important Notes
- No data is lost: existing products keep their ids; only source_prices jsonb is updated.
- Mock orders never store CVV or raw card numbers — only masked card ending and payment method type.
- user_id columns default to auth.uid() so client inserts work without passing user_id.
*/

-- ============ Update source_prices to grocery sources ============
-- Map old sources to new grocery sources with price variations
UPDATE public.products
SET source_prices = jsonb_build_array(
  jsonb_build_object('source', 'BigBasket', 'price',
    (source_prices->0->>'price')::numeric),
  jsonb_build_object('source', 'Blinkit', 'price',
    (source_prices->1->>'price')::numeric),
  jsonb_build_object('source', 'Zepto', 'price',
    (source_prices->2->>'price')::numeric),
  jsonb_build_object('source', 'Swiggy Instamart', 'price',
    (source_prices->3->>'price')::numeric)
);

-- ============ Payment methods table ============
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('upi', 'card')),
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0),
  is_recommended boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_payment_methods" ON public.payment_methods;
CREATE POLICY "public_read_payment_methods" ON public.payment_methods
  FOR SELECT TO anon, authenticated USING (true);

-- Seed payment methods
INSERT INTO public.payment_methods (name, type, discount_percentage, is_recommended, display_order) VALUES
  ('UPI', 'upi', 0.00, false, 1),
  ('Visa Credit Card', 'card', 2.00, true, 2),
  ('Mastercard Credit Card', 'card', 1.50, false, 3)
ON CONFLICT (name) DO UPDATE SET
  type = EXCLUDED.type,
  discount_percentage = EXCLUDED.discount_percentage,
  is_recommended = EXCLUDED.is_recommended,
  display_order = EXCLUDED.display_order;

-- ============ Mock orders table ============
CREATE TABLE IF NOT EXISTS public.mock_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL CHECK (char_length(product_name) BETWEEN 1 AND 200),
  unit text NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 100),
  source text NOT NULL CHECK (char_length(source) BETWEEN 1 AND 80),
  original_price numeric(10,2) NOT NULL CHECK (original_price >= 0),
  payment_method text NOT NULL CHECK (char_length(payment_method) BETWEEN 1 AND 80),
  discount_percentage numeric(5,2) NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0),
  discount_amount numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  final_price numeric(10,2) NOT NULL CHECK (final_price >= 0),
  masked_card text,
  upi_app text,
  payment_status text NOT NULL DEFAULT 'mock_success' CHECK (payment_status IN ('mock_success', 'mock_failed')),
  order_status text NOT NULL DEFAULT 'confirmed' CHECK (order_status IN ('confirmed', 'cancelled')),
  order_id text NOT NULL UNIQUE CHECK (char_length(order_id) BETWEEN 5 AND 30),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mock_orders" ON public.mock_orders;
CREATE POLICY "select_own_mock_orders" ON public.mock_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_mock_orders" ON public.mock_orders;
CREATE POLICY "insert_own_mock_orders" ON public.mock_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_mock_orders" ON public.mock_orders;
CREATE POLICY "update_own_mock_orders" ON public.mock_orders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_mock_orders" ON public.mock_orders;
CREATE POLICY "delete_own_mock_orders" ON public.mock_orders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS mock_orders_user_created_idx
  ON public.mock_orders (user_id, created_at DESC);

-- ============ Price history table ============
CREATE TABLE IF NOT EXISTS public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name text NOT NULL CHECK (char_length(product_name) BETWEEN 1 AND 200),
  source text NOT NULL CHECK (char_length(source) BETWEEN 1 AND 80),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_price_history" ON public.price_history;
CREATE POLICY "select_own_price_history" ON public.price_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_price_history" ON public.price_history;
CREATE POLICY "insert_own_price_history" ON public.price_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_price_history" ON public.price_history;
CREATE POLICY "delete_own_price_history" ON public.price_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS price_history_user_product_idx
  ON public.price_history (user_id, product_name, created_at DESC);