# Billwise™

**Billwise™** is a full-stack grocery price-comparison application that helps users find the cheapest available way to purchase everyday grocery products.

Users can search for products, compare normalized prices across multiple mocked sources, identify the cheapest deal, see the best available payment/reward recommendation, and save comparisons to their private history.

> **Status:** Core price-comparison functionality is implemented.
> **Payment/checkout system:** Yet to be implemented.

---

## Features

* 🔍 Product search with case-insensitive matching
* 💰 Price comparison across 4 mocked sources
* 🏷️ Clear cheapest-price highlighting
* 💳 Best-way-to-pay recommendation based on seeded card reward rates
* 🎤 Voice search where browser support is available
* ⚡ Debounced and cancellable search
* 📉 Persistent and stable product pricing
* 👤 Email/password authentication
* 🔒 Strict per-user ownership of saved comparisons
* 💾 Save and view personal comparison history
* 📱 Responsive interface
* 🛡️ Database-level security with Row Level Security (RLS)

---

## How It Works

1. Create an account or sign in.
2. Search for a grocery product such as:

   * Potato
   * Tomato
   * Apple
   * Mango
   * Onion
3. Billwise™ searches the persistent product catalog.
4. Prices are returned from four mocked sources in a normalized format.
5. The cheapest source is automatically identified and highlighted.
6. The application calculates the **Best way to pay** using the available seeded card reward rates.
7. Save the comparison to access it later from your private history.

### Example

For a product priced as:

| Source   | Price |
| -------- | ----: |
| Source A |   ₹45 |
| Source B |   ₹42 |
| Source C |   ₹44 |
| Source D |   ₹47 |

Billwise™ identifies **Source B — ₹42** as the cheapest option.

If a seeded payment card provides a better effective reward, the application can recommend that card in the **Best way to pay** section.

---

## Product Catalog

Billwise™ currently uses a persistent database catalog containing **315 Indian grocery/produce products**.

The catalog includes categories such as:

* Vegetables
* Root vegetables
* Leafy greens
* Herbs
* Fruits
* Citrus fruits
* Tropical fruits
* Melons
* Berries
* Other commonly purchased produce

Each product contains:

* Product name
* Category
* Unit
* Source-specific prices
* INR pricing

### Stable Pricing

Prices are generated once using the product's category base price and a deterministic variation based on the product name, then persisted in the database.

This ensures:

* Different products have different realistic price ranges.
* Each mocked source can have a slightly different price.
* Some sources may have similar or occasionally identical prices.
* Repeated searches return the same stored prices.
* Prices do not randomly change on every request.

The seed operation is idempotent and uses an upsert based on the unique `(name, unit)` constraint, preventing duplicate products when the seed process is run again.

---

## Price Comparison

Search is handled by a read-only database function:

```text
search_products
```

The search function:

1. Performs case-insensitive product matching.
2. Returns matching products.
3. Retrieves the persisted source prices.
4. Calculates the cheapest source.
5. Returns normalized data to the application.

The frontend then presents the results and applies the **Best way to pay** logic using the seeded payment/card reward data.

No live shopping APIs or web scraping are required.

---

## Mock Sources

The application uses **four mocked price sources** to simulate a real-world price comparison service.

These sources are intentionally mocked for the take-home project.

There are:

* No live retailer integrations
* No web scraping
* No external shopping APIs
* No live price feeds

The purpose is to demonstrate the comparison, normalization, recommendation, and user-ownership logic without depending on external services.

---

## Payment & Checkout

### Current Status: 🚧 Yet to be implemented

The payment/checkout flow is **not currently implemented**.

The planned mock checkout flow will support:

* UPI

  * Google Pay
  * PhonePe
  * Paytm
* Visa Credit Card — 2% mock discount
* Mastercard Credit Card — 1.5% mock discount
* Mock payment processing
* Mock order confirmation

This will be a **simulation only**.

No real money will be charged and no real payment gateway will be integrated.

---

## Authentication & Security

Billwise™ uses email/password authentication.

User-specific data is protected using database-level ownership controls.

### Saved Comparisons

Saved comparisons are private to the authenticated user.

A user can:

* Create their own saved comparisons
* View their own saved comparisons
* Access their own comparison history

A user cannot:

* View another user's comparisons
* Modify another user's saved data
* Access another user's data by changing request parameters

### Row Level Security

Supabase Row Level Security (RLS) is used to enforce ownership at the database level.

The frontend does not rely on client-side filtering as the security mechanism.

---

## Data Architecture

The application follows a simple full-stack architecture:

```text
┌──────────────────────────────┐
│      React + Vite + TS       │
│                              │
│  Search / Comparison / UI    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Supabase Backend       │
│                              │
│ Authentication              │
│ Database                    │
│ Search Function             │
│ Row Level Security          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Persistent Product Data    │
│                              │
│ 315 Products × 4 Sources     │
└──────────────────────────────┘
```

---

## Tech Stack

### Frontend

* React
* Vite
* TypeScript

### Backend / Data

* Supabase
* PostgreSQL
* PostgreSQL database functions
* Row Level Security (RLS)

### Additional Features

* Browser Speech Recognition API for voice search where supported
* Cancellable asynchronous search requests
* Debounced search input

---

## Project Structure

```text
Billwise/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   └── ...
├── supabase/
│   ├── migrations/
│   └── seed/
├── public/
├── .env
├── package.json
├── vite.config.ts
└── README.md
```

> The exact structure may vary depending on the current implementation.

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/SajanBisht/Grocery-Aggregator.git
cd Grocery-Aggregator
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file containing the required Supabase configuration.

Example:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env` to Git.

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local Vite development URL.

---

## Current Implementation Status

| Feature                       | Status                        |
| ----------------------------- | ----------------------------- |
| Product search                | ✅ Implemented                 |
| 315-product catalog           | ✅ Implemented                 |
| Persistent source prices      | ✅ Implemented                 |
| 4 mocked sources              | ✅ Implemented                 |
| Normalized comparison results | ✅ Implemented                 |
| Cheapest-price detection      | ✅ Implemented                 |
| Cheapest badge                | ✅ Implemented                 |
| Best-way-to-pay logic         | ✅ Implemented                 |
| Card reward data              | ✅ Implemented                 |
| Email authentication          | ✅ Implemented                 |
| Saved comparisons             | ✅ Implemented                 |
| Strict user ownership         | ✅ Implemented                 |
| Row Level Security            | ✅ Implemented                 |
| Input validation              | ✅ Implemented                 |
| Loading states                | ✅ Implemented                 |
| Error states                  | ✅ Implemented                 |
| Empty states                  | ✅ Implemented                 |
| Voice search                  | ✅ Implemented where supported |
| Debounced search              | ✅ Implemented                 |
| Cancellable search            | ✅ Implemented                 |
| Price-drop indicator          | 🚧 Planned                    |
| Mock checkout                 | 🚧 Yet to be implemented      |
| Mock UPI payment              | 🚧 Yet to be implemented      |
| Mock card payment             | 🚧 Yet to be implemented      |
| Mock order confirmation       | 🚧 Yet to be implemented      |

---

## Design

Billwise™ follows the visual language of the provided reference screens:

* Yellow primary surface
* Cream-colored cards
* Black typography
* Rounded UI elements
* Deal chips
* Prominent cheapest-price badge
* Clear information hierarchy
* Responsive layout

The goal is to keep the comparison experience simple and immediately understandable.

---

## Security Notes

* Authentication is handled through Supabase.
* Saved comparisons are protected using Row Level Security.
* Product data is read-only from the frontend.
* No live retailer credentials are required.
* No payment credentials are currently collected or processed.
* No real payment processing is implemented.

---

## Known Limitations

* Price sources are mocked rather than live.
* Product prices are seeded rather than real-time.
* The catalog currently contains 315 products.
* Payment/checkout is yet to be implemented.
* Voice input depends on browser support.
* The price-drop indicator is planned but not currently implemented.

---

## Future Improvements

Potential future enhancements include:

* Real retailer/API integrations
* Larger product catalog
* Real-time price updates
* Price history and charts
* Price-drop notifications
* Mock checkout and order history
* More payment/reward providers
* Personalized deal recommendations
* Location-aware availability
* Product quantity comparison

---

## Repository

**GitHub:**
https://github.com/SajanBisht/Grocery-Aggregator

---

## Disclaimer

Billwise™ is a demonstration/take-home project.

All product prices and comparison sources are mocked or seeded for demonstration purposes. The application does not currently perform real purchases or process real payments.
