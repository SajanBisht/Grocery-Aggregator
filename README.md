# Billwise

Billwise is a price comparison app for finding the cheapest way to pay for everyday groceries. It includes email/password accounts, a persistent catalog of 315 Indian produce products with stable per-source prices, four mocked comparison sources (Offer, Coupon, Cashback, Card reward), card reward comparisons, cancellable search, voice input where supported, and private saved comparison history.

## How it works

1. Create an account or sign in.
2. Search for any vegetable or fruit (e.g. potato, tomato, apple, mango).
3. Review normalized results from the four mocked sources, with the cheapest clearly badged and a single "Best way to pay" line.
4. Save a comparison to see it again in your private history.

## Product catalog

The app uses a persistent database catalog of 315 grocery products seeded into Supabase, covering vegetables, root vegetables, leafy greens, herbs, fruits, citrus, tropical fruit, melons, berries, and more. Each product has a name, category, unit (kg, 500g, 250g, dozen, piece, etc.), and four stable source prices in INR.

Prices are generated once from each product's category base price and a deterministic hash of the product name, then persisted. This means:

- Different products have different price ranges (e.g. Potato ~₹41–44/kg, Apple ~₹163–175/kg).
- The four sources have slightly different prices with realistic variation.
- Some sources occasionally tie or offer larger discounts.
- Searching for the same product repeatedly returns the same prices.

The seed operation is idempotent — re-running it updates existing products via an upsert on the unique (name, unit) constraint rather than creating duplicates.

## Search

Search is handled by a read-only database function (`search_products`) that performs case-insensitive substring matching, returns stored prices from all four sources, and calculates the cheapest source on the database side. The frontend then normalizes the results and applies the "best way to pay" logic (cheapest source, or a card reward that earns more back).

## Data and security

- Product catalog: public read access (anon + authenticated), no writes from the frontend.
- Saved comparisons: per-user with row-level security — each signed-in user only sees their own saved comparisons.
- No external shopping APIs or live price sources are used.
