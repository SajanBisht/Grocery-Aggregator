import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock3, Mic, Search, ShieldCheck, Sparkles, Star, Trash2, X, Zap } from 'lucide-react';
import { formatMoney, searchDeals, type Deal, type SearchResult } from '@/data/deals';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

type SavedComparison = {
  id: string;
  query: string;
  best_source: string;
  best_price: number;
  best_saving: number;
  result_count: number;
  created_at: string;
};

type RecognitionEvent = { results: { 0: { transcript: string } } };
type Recognition = { lang: string; start: () => void; onresult: ((event: RecognitionEvent) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
type RecognitionWindow = Window & typeof globalThis & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };

const quickSearches = ['Potato', 'Tomato', 'Apple', 'Mango', 'Spinach'];

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchResult, setSearchResult] = useState<SearchResult>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [saved, setSaved] = useState<SavedComparison[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
      if (nextSession) setAuthOpen(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void loadSaved();
    else setSaved([]);
  }, [session]);

  async function loadSaved() {
    setSavedLoading(true);
    const { data, error } = await supabase.from('saved_comparisons').select('id, query, best_source, best_price, best_saving, result_count, created_at').order('created_at', { ascending: false });
    if (!error && data) setSaved(data as SavedComparison[]);
    setSavedLoading(false);
  }

  async function runSearch(nextQuery = query) {
    const cleanQuery = nextQuery.trim();
    if (!cleanQuery) {
      setNotice('Tell us what you want to buy first.');
      return;
    }
    setNotice('');
    setSearchError('');
    setSearching(true);
    setSubmittedQuery(cleanQuery);
    setDeals([]);
    setSearchResult(null);
    try {
      const result = await searchDeals(cleanQuery);
      if (!result) {
        setDeals([]);
        setSearchResult(null);
        setSearchError(`We couldn't find "${cleanQuery}" in our catalog. Try another vegetable or fruit.`);
      } else {
        setDeals(result.deals);
        setSearchResult(result);
      }
    } catch {
      setSearchError('Something went wrong while searching. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  async function saveComparison() {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    const best = searchResult?.bestDeal ?? deals[0];
    if (!best) return;
    const optimistic: SavedComparison = {
      id: `optimistic-${Date.now()}`,
      query: submittedQuery,
      best_source: best.source,
      best_price: best.price,
      best_saving: best.saving,
      result_count: deals.length,
      created_at: new Date().toISOString(),
    };
    setSaved((current) => [optimistic, ...current]);
    const { data, error } = await supabase.from('saved_comparisons').insert({ query: submittedQuery, best_source: best.source, best_price: best.price, best_saving: best.saving, result_count: deals.length }).select().maybeSingle();
    if (error) {
      setSaved((current) => current.filter((item) => item.id !== optimistic.id));
      setNotice('We could not save that comparison. Please try again.');
      return;
    }
    if (data) setSaved((current) => current.map((item) => item.id === optimistic.id ? data as SavedComparison : item));
    setNotice('Comparison saved to your history.');
  }

  async function deleteSaved(id: string) {
    const previous = saved;
    setSaved((current) => current.filter((item) => item.id !== id));
    const { error } = await supabase.from('saved_comparisons').delete().eq('id', id);
    if (error) setSaved(previous);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setShowHistory(false);
    setDeals([]);
    setSubmittedQuery('');
  }

  if (authLoading) return <div className="min-h-screen bg-[#f7cf45] flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" /></div>;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7cf45]">
      <div className="mx-auto min-h-screen max-w-[1440px] px-5 py-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-black/15 pb-5">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 rotate-[-6deg] items-center justify-center rounded-[13px] bg-[#1d1d1a] text-[#f7cf45] shadow-[4px_4px_0_#f0b900]"><Zap size={20} fill="currentColor" strokeWidth={2.5} /></div><span className="text-lg font-extrabold tracking-[-.04em]">billwise<span className="text-[10px] align-top">™</span></span></div>
          <div className="flex items-center gap-2 sm:gap-3">
            {session ? <><button onClick={() => setShowHistory(true)} className="hidden rounded-full border border-black/20 bg-[#fff9e9] px-4 py-2 text-sm font-bold transition hover:-translate-y-0.5 sm:block">My history <span className="ml-1 text-black/45">{saved.length}</span></button><button onClick={signOut} className="rounded-full bg-[#1d1d1a] px-4 py-2 text-sm font-bold text-[#fff9e9] transition hover:-translate-y-0.5">Sign out</button></> : <button onClick={() => setAuthOpen(true)} className="rounded-full bg-[#1d1d1a] px-4 py-2 text-sm font-bold text-[#fff9e9] transition hover:-translate-y-0.5">Sign in</button>}
          </div>
        </header>

        <section className="grid gap-10 pb-16 pt-16 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20 lg:pt-24">
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/20 bg-[#fff2be] px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.12em]"><Sparkles size={14} /> Spend less, without the spreadsheet</div>
            <h1 className="max-w-2xl text-[clamp(3.2rem,8vw,6.8rem)] font-extrabold leading-[.92] tracking-[-.09em]">The smarter way to <span className="relative inline-block"><span className="relative z-10">pay less.</span><span className="absolute bottom-1 left-0 z-0 h-3 w-full -rotate-2 bg-[#ffec94]" /></span></h1>
            <p className="mt-7 max-w-md text-base font-medium leading-7 text-black/65 sm:text-lg">Tell us what produce you’re buying. We’ll scan the deals, coupons, cashback, and cards to find your best move.</p>
            <SearchBox query={query} setQuery={setQuery} onSearch={() => void runSearch()} onVoice={(value) => { setQuery(value); void runSearch(value); }} />
            <div className="mt-5 flex flex-wrap gap-2">{quickSearches.map((item) => <button key={item} onClick={() => { setQuery(item); void runSearch(item); }} className="rounded-full border border-black/20 bg-[#fff8df]/70 px-3 py-2 text-xs font-bold transition hover:bg-[#fff8df]">{item}</button>)}</div>
            {notice && <p className="mt-4 text-sm font-bold text-[#9b2f1f]">{notice}</p>}
          </div>
          <div className="relative min-h-[380px] rounded-[36px] border border-black/10 bg-[#ffdc62] p-4 shadow-[0_20px_60px_rgba(120,80,0,.12)] sm:p-7">
            <div className="absolute right-8 top-6 rotate-6 rounded-2xl bg-[#1d1d1a] px-3 py-2 text-xs font-extrabold text-[#f7cf45] shadow-[4px_4px_0_#fff4c7]">LESS WORK. MORE SAVINGS.</div>
            <div className="flex h-full flex-col justify-end rounded-[28px] border border-black/10 bg-[#fff8df] p-5 pt-28 sm:p-8 sm:pt-32">
              {searching ? <LoadingCard /> : deals.length > 0 && searchResult ? <Results result={searchResult} deals={deals} onSave={() => void saveComparison()} /> : searchError ? <NotFoundState message={searchError} /> : <EmptyState />}
            </div>
          </div>
        </section>
        <section className="grid gap-4 border-t border-black/15 py-8 text-sm font-bold sm:grid-cols-3"><TrustItem icon={<ShieldCheck size={18} />} text="Private by account" /><TrustItem icon={<Star size={18} />} text="4 ways to compare" /><TrustItem icon={<Clock3 size={18} />} text="Save your best finds" /></section>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      {showHistory && <HistoryModal saved={saved} loading={savedLoading} onClose={() => setShowHistory(false)} onDelete={(id) => void deleteSaved(id)} onPick={(value) => { setShowHistory(false); setQuery(value); void runSearch(value); }} />}
    </main>
  );
}

function SearchBox({ query, setQuery, onSearch, onVoice }: { query: string; setQuery: (value: string) => void; onSearch: () => void; onVoice: (value: string) => void }) {
  const recognitionRef = useRef<Recognition | null>(null);
  const [listening, setListening] = useState(false);
  function startVoice() {
    const SpeechRecognition = (window as RecognitionWindow).SpeechRecognition ?? (window as RecognitionWindow).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => onVoice(event.results[0].transcript);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }
  return <div className="mt-9 flex max-w-xl items-center gap-2 rounded-[22px] border-2 border-black bg-[#fff9e9] p-2 shadow-[6px_6px_0_#1d1d1a] focus-within:-translate-y-0.5 transition-transform"><Search className="ml-3 shrink-0" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') onSearch(); }} placeholder="What do you want to buy?" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none placeholder:text-black/35" aria-label="What do you want to buy" /><button type="button" onClick={startVoice} aria-label="Search by voice" className={`rounded-xl p-3 transition ${listening ? 'bg-[#ffdb62] text-[#9b2f1f]' : 'hover:bg-black/5'}`}><Mic size={18} /></button><button type="button" onClick={onSearch} className="flex items-center gap-1 rounded-[15px] bg-[#1d1d1a] px-4 py-3 text-sm font-extrabold text-[#fff9e9] transition hover:bg-black/80">Go <ArrowRight size={16} /></button></div>;
}

function EmptyState() { return <div className="flex min-h-[230px] flex-col items-center justify-center text-center"><div className="animate-float mb-6 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f7cf45] text-3xl shadow-[5px_5px_0_#1d1d1a]">₹</div><h2 className="text-2xl font-extrabold tracking-[-.05em]">Your best deal is waiting.</h2><p className="mt-2 max-w-xs text-sm leading-6 text-black/55">Search for a vegetable or fruit and we’ll do the comparing.</p></div>; }
function NotFoundState({ message }: { message: string }) { return <div className="flex min-h-[230px] flex-col items-center justify-center text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#ffd9bd] text-2xl shadow-[5px_5px_0_#1d1d1a]">?</div><h2 className="text-2xl font-extrabold tracking-[-.05em]">No matches found.</h2><p className="mt-2 max-w-xs text-sm leading-6 text-black/55">{message}</p></div>; }
function LoadingCard() { return <div className="space-y-5"><div className="skeleton h-8 w-2/3 rounded-lg" /><div className="skeleton h-4 w-1/2 rounded" /><div className="space-y-3 pt-4"><div className="skeleton h-16 rounded-2xl" /><div className="skeleton h-16 rounded-2xl" /><div className="skeleton h-16 rounded-2xl" /></div></div>; }
function Results({ result, deals, onSave }: { result: NonNullable<SearchResult>; deals: Deal[]; onSave: () => void }) { const best = result.bestDeal; const cheapest = deals[0]; return <div><div className="mb-6 flex items-end justify-between gap-3"><div><p className="mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-black/45">Best ways to pay for</p><h2 className="text-2xl font-extrabold capitalize tracking-[-.06em] sm:text-3xl">{result.productName} <span className="text-base font-bold text-black/40">({result.unit})</span></h2></div><span className="rounded-full bg-[#d7f3dc] px-3 py-1.5 text-xs font-extrabold text-[#1b6840]">{deals.length} sources</span></div><div className="mb-5 rounded-2xl bg-[#1d1d1a] p-4 text-[#fff9e9] shadow-[5px_5px_0_#f7cf45]"><div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.12em] text-[#f7cf45]"><Sparkles size={14} /> Best way to pay</div><p className="mt-2 text-sm font-bold leading-6">{best.source === cheapest.source ? <>Pay with <span className="text-[#f7cf45]">{best.source}</span> at {formatMoney(best.price)} — you save {formatMoney(best.saving)}.</> : <>Pay with <span className="text-[#f7cf45]">{best.source}</span> — reward points make it cheaper than the lowest price.</>}</p></div><div className="space-y-3">{deals.map((deal) => <DealRow key={deal.id} deal={deal} best={!!deal.isBest} />)}</div><button onClick={onSave} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#f7cf45] px-4 py-3.5 text-sm font-extrabold transition hover:-translate-y-0.5 hover:bg-[#ffdc62]">Save this comparison <Star size={17} /></button></div>; }
function DealRow({ deal, best }: { deal: Deal; best: boolean }) { return <div className={`relative flex items-center gap-3 rounded-2xl border p-3 transition hover:-translate-y-0.5 ${best ? 'border-black bg-[#f7cf45] shadow-[4px_4px_0_#1d1d1a]' : 'border-black/10 bg-white/60'}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${deal.color === 'mint' ? 'bg-[#d7f3dc]' : deal.color === 'peach' ? 'bg-[#ffd9bd]' : deal.color === 'sky' ? 'bg-[#cce8f7]' : 'bg-[#e7ddf4]'}`}>{deal.source === 'Card reward' ? <Star size={18} fill="currentColor" /> : <span>{deal.source.slice(0, 2).toUpperCase()}</span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-extrabold">{deal.source}</p>{best && <span className="rounded-full bg-[#1d1d1a] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#f7cf45]">Cheapest</span>}</div><p className="mt-1 truncate text-xs font-medium text-black/50">{deal.merchant} · {deal.detail}</p></div><div className="text-right"><p className="text-base font-extrabold">{formatMoney(deal.price)}</p><p className="text-[11px] font-bold text-[#23814e]">-{formatMoney(deal.saving)}</p></div></div>; }
function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="flex items-center gap-3 text-black/65"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff2be] text-black">{icon}</span>{text}</div>; }

function AuthModal({ onClose }: { onClose: () => void }) { const [mode, setMode] = useState<'signin' | 'signup'>('signin'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); async function submit(event: FormEvent) { event.preventDefault(); if (!email || password.length < 6) { setError('Enter an email and a password with at least 6 characters.'); return; } setBusy(true); setError(''); const result = mode === 'signin' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password }); if (result.error) setError(result.error.message); else if (mode === 'signup') setError('Account created. You can now sign in.'); else onClose(); setBusy(false); } return <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/35 p-4 backdrop-blur-sm sm:items-center"><div className="w-full max-w-md rounded-[30px] border-2 border-black bg-[#fff9e9] p-6 shadow-[8px_8px_0_#1d1d1a] sm:p-8"><div className="mb-7 flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.13em] text-black/45">Your private wallet</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.07em]">{mode === 'signin' ? 'Welcome back.' : 'Start saving.'}</h2></div><button onClick={onClose} className="rounded-full p-2 hover:bg-black/5" aria-label="Close"><X size={20} /></button></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-extrabold">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-black/20 bg-white/70 px-4 py-3 outline-none focus:border-black" placeholder="you@example.com" /></label><label className="block text-sm font-extrabold">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-black/20 bg-white/70 px-4 py-3 outline-none focus:border-black" placeholder="At least 6 characters" /></label>{error && <p className="text-sm font-bold text-[#9b2f1f]">{error}</p>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1a] px-4 py-3.5 text-sm font-extrabold text-[#fff9e9] disabled:opacity-60">{busy ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button></form><button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }} className="mt-5 w-full text-center text-sm font-bold text-black/55 underline decoration-black/20 underline-offset-4">{mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button></div></div>; }
function HistoryModal({ saved, loading, onClose, onDelete, onPick }: { saved: SavedComparison[]; loading: boolean; onClose: () => void; onDelete: (id: string) => void; onPick: (query: string) => void }) { return <div className="fixed inset-0 z-20 flex justify-end bg-black/35 backdrop-blur-sm"><div className="h-full w-full max-w-md overflow-y-auto border-l-2 border-black bg-[#fff9e9] p-6 shadow-[-8px_0_0_#1d1d1a] sm:p-8"><div className="mb-8 flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.13em] text-black/45">Private history</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.07em]">Your saved finds.</h2></div><button onClick={onClose} className="rounded-full p-2 hover:bg-black/5" aria-label="Close"><X size={20} /></button></div>{loading ? <div className="space-y-3"><div className="skeleton h-24 rounded-2xl" /><div className="skeleton h-24 rounded-2xl" /></div> : saved.length === 0 ? <div className="rounded-2xl border border-dashed border-black/25 p-6 text-center"><p className="text-sm font-bold">Nothing saved yet.</p><p className="mt-2 text-sm leading-6 text-black/50">Save a comparison and it will show up here.</p></div> : <div className="space-y-3">{saved.map((item) => <div key={item.id} className="group rounded-2xl border border-black/15 bg-white/70 p-4"><button onClick={() => onPick(item.query)} className="w-full text-left"><p className="text-sm font-extrabold capitalize">{item.query}</p><p className="mt-2 text-xs font-bold text-black/50">{item.best_source} · {formatMoney(item.best_price)} · saved {new Date(item.created_at).toLocaleDateString()}</p></button><div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3"><span className="text-xs font-extrabold text-[#23814e]">Saved {formatMoney(item.best_saving)}</span><button onClick={() => onDelete(item.id)} className="rounded-lg p-1.5 text-black/35 transition hover:bg-[#ffd9bd] hover:text-[#9b2f1f]" aria-label={`Delete ${item.query}`}><Trash2 size={15} /></button></div></div>)}</div>}</div></div>; }

export default App;
