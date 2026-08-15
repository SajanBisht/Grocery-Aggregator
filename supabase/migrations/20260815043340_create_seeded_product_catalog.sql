/*
# Create and seed a persistent Indian produce catalog

1. New Tables
- `products`
- `id` (uuid, primary key) identifies a catalog product.
- `name` (text) stores the shopper-facing product and variety name.
- `category` (text) stores the produce category.
- `unit` (text) stores the comparison unit such as kg, 500g, bunch, dozen, or piece.
- `source_prices` (jsonb) stores the four stable mocked source prices for this product.
- `created_at` (timestamp) records when the product was seeded.
2. Seed Data
- Seeds 315 useful Indian grocery products across vegetables, roots, leafy greens, herbs, fruits, citrus, tropical fruit, melons, and berries.
- Prices are generated once from each product's category base and a stable product-name hash, then persisted in `source_prices`.
- The four source prices include Offer, Coupon, Cashback, and Card reward with realistic close variation and occasional discounts or premiums.
3. Search API
- Adds `search_products(text)` as a read-only database function for case-insensitive product search.
- The function returns stored source prices and calculates the cheapest source and price on the database side.
4. Security
- Enables row-level security on `products`.
- Allows anonymous and authenticated users to read the intentionally public catalog.
- The search function runs as the caller with a fixed public search path and is executable by anonymous and authenticated users.
5. Important Notes
- Product name + unit is unique, making the seed idempotent and preventing duplicate catalog entries.
- Re-running this migration updates the same named products with the same deterministic prices instead of creating duplicates.
- No external shopping services or live price sources are used.
*/

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL,
  source_prices jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_name_unit_key UNIQUE (name, unit),
  CONSTRAINT products_source_prices_array CHECK (jsonb_typeof(source_prices) = 'array')
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON public.products;
CREATE POLICY "public_read_products" ON public.products
  FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS products_name_lower_idx ON public.products (lower(name));
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);

WITH product_groups(category, unit, base_price, names) AS (
  VALUES
    ('Root vegetables', 'kg', 42::numeric, ARRAY['Potato','Baby potato','Red potato','New potato','Sweet potato','Yam','Purple yam','Taro root','Beetroot','Carrot','Radish','White radish','Turnip','Parsnip','Ginger']),
    ('Onions and bulbs', 'kg', 38::numeric, ARRAY['Onion','Red onion','White onion','Pearl onion','Shallot','Spring onion','Garlic','Fresh garlic','Leek','Fennel bulb','Sambar onion','Garlic flakes','Garlic paste','Ginger garlic mix','Baby onion']),
    ('Tomatoes', 'kg', 48::numeric, ARRAY['Tomato','Cherry tomato','Roma tomato','Green tomato','Heirloom tomato','Plum tomato','Beefsteak tomato','Yellow tomato','Kumato tomato','Vine tomato','Desi tomato','Hybrid tomato','Diced tomato','Tomato on vine','Cocktail tomato']),
    ('Leafy vegetables', '250g', 24::numeric, ARRAY['Spinach','Baby spinach','Amaranth leaves','Red amaranth','Methi leaves','Coriander leaves','Mint leaves','Curry leaves','Dill leaves','Drumstick leaves','Colocasia leaves','Mustard greens','Kale','Lettuce','Iceberg lettuce']),
    ('Gourds and squash', 'kg', 46::numeric, ARRAY['Bottle gourd','Ridge gourd','Bitter gourd','Snake gourd','Ash gourd','Round gourd','Sponge gourd','Pumpkin','Butternut squash','Zucchini','Yellow squash','Chayote','Ivy gourd','Pointed gourd','Tinda']),
    ('Beans and pods', '500g', 52::numeric, ARRAY['French beans','Cluster beans','Broad beans','Runner beans','Flat beans','Green beans','String beans','Hyacinth beans','Drumstick','Fresh okra','Snow peas','Sugar snap peas','Winged beans','Lima beans','Edamame']),
    ('Peas and corn', '500g', 54::numeric, ARRAY['Green peas','Fresh peas','Sweet corn','Baby corn','Corn cobs','White corn','Yellow corn','Corn kernels','Fresh chickpeas','Green chickpeas','Pigeon peas','Fresh lima peas','Pea shoots','Corn husk','Tender corn']),
    ('Capsicum and peppers', '500g', 68::numeric, ARRAY['Capsicum','Green capsicum','Red capsicum','Yellow capsicum','Orange capsicum','Mini capsicum','Jalapeno','Green chilli','Red chilli','Bird eye chilli','Banana pepper','Poblano pepper','Thai chilli','Bell pepper mix','Long pepper']),
    ('Cruciferous vegetables', 'kg', 55::numeric, ARRAY['Cabbage','Red cabbage','Cauliflower','Baby cauliflower','Broccoli','Tenderstem broccoli','Purple cauliflower','Romanesco','Brussels sprouts','Kohlrabi','Broccoli florets','Cabbage wedges','Cauliflower florets','Chinese cabbage','Pak choi']),
    ('Cucumbers and salad', 'kg', 44::numeric, ARRAY['Cucumber','English cucumber','Lebanese cucumber','Mini cucumber','Gherkin','Armenian cucumber','White cucumber','Salad cucumber','Cucumber sticks','Cucumber baby','Yellow cucumber','Pickling cucumber','Lemon cucumber','Slicing cucumber','Persian cucumber']),
    ('Eggplant and okra', 'kg', 50::numeric, ARRAY['Brinjal','Purple brinjal','Green brinjal','Baby brinjal','Thai eggplant','Long eggplant','Round eggplant','White eggplant','Okra','Ladies finger','Red okra','Bhindi tender','Kantola','Tindora','Japanese eggplant']),
    ('Mushrooms', '200g', 72::numeric, ARRAY['Button mushroom','Oyster mushroom','Shiitake mushroom','Portobello mushroom','Shimeji mushroom','Enoki mushroom','Milky mushroom','Cremini mushroom','Dried shiitake','Mushroom mix','King oyster mushroom','Wood ear mushroom','Maitake mushroom','Fresh porcini','Mushroom slices']),
    ('Apples', 'kg', 168::numeric, ARRAY['Apple','Royal gala apple','Red delicious apple','Golden delicious apple','Fuji apple','Granny smith apple','Kashmiri apple','Himachali apple','Pink lady apple','Ambri apple','Washington apple','Honeycrisp apple','Jazz apple','Envy apple','Indian green apple']),
    ('Bananas', 'dozen', 62::numeric, ARRAY['Banana','Robusta banana','Yelakki banana','Poovan banana','Nendran banana','Red banana','Elaichi banana','Rasthali banana','Plantain','Raw banana','Monthan banana','Karpuravalli banana','Cavendish banana','Baby banana','Organic banana']),
    ('Citrus fruit', 'kg', 92::numeric, ARRAY['Orange','Nagpur orange','Mandarin orange','Kinnow','Mosambi','Sweet lime','Lemon','Key lime','Grapefruit','Pomelo','Blood orange','Tangerine','Malta orange','Citron','Bergamot']),
    ('Mangoes', 'kg', 142::numeric, ARRAY['Mango','Alphonso mango','Kesar mango','Dasheri mango','Langra mango','Banganapalli mango','Totapuri mango','Chausa mango','Himsagar mango','Malgoa mango','Raspuri mango','Neelam mango','Imam pasand mango','Sindhura mango','Raw mango']),
    ('Tropical fruits', 'piece', 78::numeric, ARRAY['Papaya','Raw papaya','Pineapple','Coconut','Tender coconut','Guava','Pink guava','Dragon fruit','Avocado','Kiwi','Passion fruit','Custard apple','Star fruit','Jackfruit','Sapota']),
    ('Melons and grapes', 'kg', 86::numeric, ARRAY['Watermelon','Muskmelon','Cantaloupe','Honeydew melon','Galia melon','Green grapes','Black grapes','Red grapes','Seedless grapes','Flame grapes','Thompson grapes','Korean melon','Yellow watermelon','Mini watermelon','Plumcot']),
    ('Stone fruits', '500g', 118::numeric, ARRAY['Pomegranate','Peach','Nectarine','Plum','Apricot','Cherries','Black cherries','Yellow peach','White peach','Fresh fig','Indian fig','Loquat','Mulberry','Rambutan','Mangosteen']),
    ('Berries', '250g', 178::numeric, ARRAY['Strawberry','Blueberry','Raspberry','Blackberry','Cranberry','Gooseberry','Amla','Cape gooseberry','Golden berry','Jamun','Phalsa','Red currant','Black currant','Elderberry','Berry mix']),
    ('Specialty vegetables', '500g', 82::numeric, ARRAY['Asparagus','Artichoke','Celery','Celery sticks','Leeks','Parsley','Basil','Rosemary','Thyme','Sage','Baby corn pack','Mixed salad leaves','Microgreens','Bean sprouts','Mixed vegetables'])
), expanded AS (
  SELECT pg.category, pg.unit, pg.base_price, names.name,
    row_number() OVER (PARTITION BY pg.category ORDER BY names.name) AS product_index
  FROM product_groups pg
  CROSS JOIN LATERAL unnest(pg.names) AS names(name)
), priced AS (
  SELECT name, category, unit,
    round(base_price * (1 + (((product_index % 5) - 2) * 0.025)), 2) AS base,
    abs(hashtext(name)) AS product_hash,
    base_price
  FROM expanded
)
INSERT INTO public.products (name, category, unit, source_prices)
SELECT name, category, unit,
  jsonb_build_array(
    jsonb_build_object('source', 'Offer', 'price', round(base * (CASE WHEN product_hash % 17 = 0 THEN 0.86 ELSE 1 + (((product_hash % 5) - 2) * 0.018) END), 2)),
    jsonb_build_object('source', 'Coupon', 'price', round(base * (CASE WHEN product_hash % 19 = 0 THEN 0.90 ELSE 1 + (((abs(hashtext(name || 'coupon')) % 7) - 3) * 0.015) END), 2)),
    jsonb_build_object('source', 'Cashback', 'price', round(base * (CASE WHEN product_hash % 23 = 0 THEN 0.83 ELSE 1 + (((abs(hashtext(name || 'cashback')) % 5) - 2) * 0.02) END), 2)),
    jsonb_build_object('source', 'Card reward', 'price', round(base * (CASE WHEN product_hash % 29 = 0 THEN 1.10 ELSE 1 + (((abs(hashtext(name || 'card')) % 7) - 3) * 0.018) END), 2))
  )
FROM priced
ON CONFLICT (name, unit) DO UPDATE SET
  category = EXCLUDED.category,
  source_prices = EXCLUDED.source_prices;

CREATE OR REPLACE FUNCTION public.search_products(search_term text)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  unit text,
  source_prices jsonb,
  best_source text,
  best_price numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH safe_term AS (
    SELECT replace(replace(replace(lower(trim(search_term)), '\\', '\\\\'), '%', '\\%'), '_', '\\_') AS value
  )
  SELECT p.id, p.name, p.category, p.unit, p.source_prices,
    cheapest.source AS best_source,
    cheapest.price AS best_price
  FROM public.products p
  CROSS JOIN safe_term
  CROSS JOIN LATERAL (
    SELECT item->>'source' AS source, (item->>'price')::numeric AS price
    FROM jsonb_array_elements(p.source_prices) AS item
    ORDER BY (item->>'price')::numeric ASC, item->>'source'
    LIMIT 1
  ) AS cheapest
  WHERE p.name ILIKE '%' || safe_term.value || '%' ESCAPE '\\'
  ORDER BY CASE WHEN lower(p.name) = lower(trim(search_term)) THEN 0 ELSE 1 END, p.name
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text) TO anon, authenticated;