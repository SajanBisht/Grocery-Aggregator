import { supabase } from '@/lib/supabase';

export type DealSource = 'Offer' | 'Coupon' | 'Cashback' | 'Card reward';

export type Deal = {
  id: string;
  merchant: string;
  label: string;
  price: number;
  originalPrice: number;
  saving: number;
  source: DealSource;
  detail: string;
  color: string;
  card?: string;
  isBest?: boolean;
};

export type SearchResult = {
  deals: Deal[];
  bestDeal: Deal;
  productName: string;
  unit: string;
  matchCount: number;
} | null;

type SourcePrice = {
  source: string;
  price: number;
};

type ProductRow = {
  id: string;
  name: string;
  category: string;
  unit: string;
  source_prices: SourcePrice[];
  best_source: string;
  best_price: number;
};

const sourceMeta: Record<DealSource, { merchant: string; detail: string; color: string; card?: string }> = {
  'Offer': { merchant: 'Fresh Basket', detail: 'Limited time deal price', color: 'mint' },
  'Coupon': { merchant: 'Market Lane', detail: 'Apply code at checkout', color: 'peach' },
  'Cashback': { merchant: 'Cartwise', detail: 'Earn cashback after purchase', color: 'lavender' },
  'Card reward': { merchant: 'Everyday Card', detail: 'Earn 2x reward points', color: 'sky', card: 'Everyday Card' },
};

const CARD_REWARD_RATE = 0.02;

export async function searchDeals(query: string): Promise<SearchResult> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  const { data, error } = await supabase.rpc('search_products', { search_term: cleanQuery });
  if (error || !data || !Array.isArray(data) || data.length === 0) return null;

  const rows = data as ProductRow[];
  const product = rows[0];

  const prices = product.source_prices.map((sp) => sp.price);
  const highestPrice = Math.max(...prices);

  const deals: Deal[] = product.source_prices
    .map((sp) => {
      const source = sp.source as DealSource;
      const meta = sourceMeta[source] ?? sourceMeta['Offer'];
      return {
        id: `${product.id}-${source}`,
        merchant: meta.merchant,
        label: `${product.name} (${product.unit})`,
        price: Number(sp.price.toFixed(2)),
        originalPrice: Number(highestPrice.toFixed(2)),
        saving: Number((highestPrice - sp.price).toFixed(2)),
        source,
        detail: meta.detail,
        color: meta.color,
        card: meta.card,
      };
    })
    .sort((a, b) => a.price - b.price);

  const cheapest = deals[0];
  const cardDeal = deals.find((d) => d.source === 'Card reward');
  const cardEffectivePrice = cardDeal ? cardDeal.price * (1 - CARD_REWARD_RATE) : Infinity;
  const bestDeal = cardDeal && cardEffectivePrice < cheapest.price ? cardDeal : cheapest;
  bestDeal.isBest = true;

  return {
    deals,
    bestDeal,
    productName: product.name,
    unit: product.unit,
    matchCount: rows.length,
  };
}

export function formatMoney(value: number): string {
  return `\u20B9${value.toFixed(2)}`;
}
