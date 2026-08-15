/*
# Fix search_products escape string error

1. Changes
- Replaces the ILIKE wildcard matching in `search_products` with `strpos`-based matching.
- This avoids invalid escape string errors when the search term contains special characters like backslash, percent, or underscore.
2. Security
- No policy changes. The function remains SECURITY INVOKER, read-only, and executable by anon and authenticated.
3. Important Notes
- Matching is still case-insensitive and substring-based.
- Exact name matches are still ranked first.
*/

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
  SELECT p.id, p.name, p.category, p.unit, p.source_prices,
    cheapest.source AS best_source,
    cheapest.price AS best_price
  FROM public.products p
  CROSS JOIN LATERAL (
    SELECT item->>'source' AS source, (item->>'price')::numeric AS price
    FROM jsonb_array_elements(p.source_prices) AS item
    ORDER BY (item->>'price')::numeric ASC, item->>'source'
    LIMIT 1
  ) AS cheapest
  WHERE strpos(lower(p.name), lower(trim(search_term))) > 0
  ORDER BY CASE WHEN lower(p.name) = lower(trim(search_term)) THEN 0 ELSE 1 END, p.name
  LIMIT 20;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text) TO anon, authenticated;