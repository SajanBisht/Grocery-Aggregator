/*
# Create saved comparisons for the price comparison app

1. New Tables
- `saved_comparisons`
- `id` (uuid, primary key) identifies one saved result.
- `user_id` (uuid, required, defaults to the signed-in user) owns the result.
- `query` (text) stores the user's search phrase.
- `best_source` (text) stores the selected deal source.
- `best_price` (numeric) stores the recommended price.
- `best_saving` (numeric) stores the saving amount.
- `result_count` (integer) stores how many deals were compared.
- `created_at` (timestamp) records when the comparison was saved.
2. Security
- Row-level security is enabled.
- Separate authenticated CRUD policies restrict every operation to the row owner.
3. Important Notes
- This table only stores the summary needed for history; live deal data remains mocked by the app.
- The owner default ensures inserts use the authenticated session safely.
*/

CREATE TABLE IF NOT EXISTS public.saved_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  query text NOT NULL CHECK (char_length(query) BETWEEN 1 AND 120),
  best_source text NOT NULL CHECK (char_length(best_source) BETWEEN 1 AND 80),
  best_price numeric(10, 2) NOT NULL CHECK (best_price >= 0),
  best_saving numeric(10, 2) NOT NULL DEFAULT 0 CHECK (best_saving >= 0),
  result_count integer NOT NULL DEFAULT 0 CHECK (result_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_comparisons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_comparisons" ON public.saved_comparisons;
CREATE POLICY "select_own_saved_comparisons" ON public.saved_comparisons
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_comparisons" ON public.saved_comparisons;
CREATE POLICY "insert_own_saved_comparisons" ON public.saved_comparisons
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_saved_comparisons" ON public.saved_comparisons;
CREATE POLICY "update_own_saved_comparisons" ON public.saved_comparisons
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_comparisons" ON public.saved_comparisons;
CREATE POLICY "delete_own_saved_comparisons" ON public.saved_comparisons
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS saved_comparisons_user_created_idx
  ON public.saved_comparisons (user_id, created_at DESC);