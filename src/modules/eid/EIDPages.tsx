import { lazy, Suspense, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Copy, ExternalLink, Tag, Plus } from '@icons';
import { AppShell } from '../../components/layout/AppShell';
import { TransactionReviewModal } from '../../components/modals/TransactionReviewModal';
import { RiskWarningCard } from '../../components/cards/RiskWarningCard';
import { PaymentTokenSelector } from '../../components/forms/PaymentTokenSelector';
import { useTheme } from '../../lib/theme-context';
import { cn } from '../../lib/utils';
import { mockUser, mockOwnedEids } from '../../data/mockAssets';
import { eidAdapter } from '../../adapters/mock/eidAdapter';
import type { PaymentToken } from '../../lib/types';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { isSpecialProductPresentationEnabled } from '../../special3/products/presentationRegistry';

const SpecialEidPresentation=lazy(async()=>{const module=await import('../../special3/products/eid/SpecialEidPages');return {default:module.SpecialEidPresentation}});
type SpecialEidView='overview'|'search'|'acquire'|'owned'|'active'|'invite'|'settings'|'market';
function HistoricalEidSupersededNotice(){return <AppShell title="EID" showBack><div className="vf-eid-page space-y-4" data-testid="eid-historical-superseded"><RiskWarningCard message="Historical EID view is superseded by the current EID V4 protocol." level="info"/><p className="data-surface p-4 text-sm text-[var(--muted)]">This compatibility view is non-transactional. Historical source is retained for Product DNA only; pricing, acquisition, invite and marketplace actions are unavailable.</p></div></AppShell>}
function EidPresentationBoundary({view,legacy}:{view:SpecialEidView;legacy:ReactNode}){if(!isSpecialProductPresentationEnabled('EID')){void legacy;return <HistoricalEidSupersededNotice/>}return <Suspense fallback={<AppShell title="EID"><div data-special3 role="status">Loading EID presentation…</div></AppShell>}><SpecialEidPresentation view={view}/></Suspense>}

type EIDView = 'mint' | 'search' | 'names';
function EIDNavigation({ active }: { active: EIDView }) {
  const navigate = useNavigate();
  const routes = { mint: '/eid/mint', search: '/eid/search', names: '/eid/my-names' } as const;
  return <SectionTabs label="EID sections" items={[{ key: 'mint', label: 'Mint EID', icon: Plus }, { key: 'search', label: 'Search EID', icon: Search }, { key: 'names', label: 'My EIDs', icon: Tag }]} active={active} onChange={(key) => navigate(routes[key])} />;
}

function LegacyEIDPage() {
  const navigate = useNavigate();
  const { eidName } = useParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const requestedEid = eidName ? `${eidName.replace(/\.eter$/i, '').toUpperCase()}.ETER` : mockUser.primaryEid;
  const ownedEid = mockOwnedEids.find((item) => item.name.toUpperCase() === requestedEid);
  const primaryEid = ownedEid?.name ?? requestedEid;

  return (
    <AppShell title="EID — Identity" showBack>
      <div className="vf-eid-page space-y-4">
        {/* Dedicated EID identity card */}
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-DEFAULT/10 border border-primary-500/30 p-5">
          <p className={cn('text-xs mb-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>{ownedEid?.isPrimary ? 'Primary Identity' : 'ETERNITY Identity'}</p>
          <p className="text-3xl font-bold text-primary-500 tracking-wide">{primaryEid}</p>
          <p className={cn('text-xs mt-1 font-mono', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            {mockUser.walletAddress.slice(0, 12)}...{mockUser.walletAddress.slice(-6)}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(primaryEid)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-500/20 text-primary-500 text-xs font-semibold"
            >
              <Copy size={12} /> Copy EID
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(mockUser.eidInviteLink)}
              className={cn('invite-link-cta flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold', isDark ? 'bg-dark-card border border-dark-border text-dark-textSecondary' : 'bg-light-card border border-light-border text-light-textSecondary')}
            >
              <ExternalLink size={12} /> Invite Link
            </button>
          </div>
        </div>

        <div className="data-surface p-4"><p className="text-sm font-bold text-[var(--text)]">Your name replaces the wallet address inside ETERNITY</p><p className="text-xs leading-relaxed text-[var(--muted)] mt-2">One wallet can have one active EID at a time. Your active name becomes your ecosystem identity and is automatically included in your invitation link. A wallet address can still be entered manually as a referrer.</p></div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => navigate('/eid/mint')} className="flex items-center gap-2 p-4 rounded-2xl gradient-primary text-white font-semibold text-sm">
            <Plus size={16} /> Mint New EID
          </button>
          <button onClick={() => navigate('/eid/search')} className={cn('flex items-center gap-2 p-4 rounded-2xl text-sm font-semibold', isDark ? 'bg-dark-card border border-dark-border text-dark-textPrimary' : 'bg-light-card border border-light-border text-light-textPrimary shadow-sm')}>
            <Search size={16} /> Search EID
          </button>
          <button onClick={() => navigate('/eid/my-names')} className={cn('flex items-center gap-2 p-4 rounded-2xl text-sm font-semibold', isDark ? 'bg-dark-card border border-dark-border text-dark-textPrimary' : 'bg-light-card border border-light-border text-light-textPrimary shadow-sm')}>
            <Tag size={16} /> My Names
          </button>
        </div>

        {/* My EIDs */}
        <div>
          <h2 className={cn('text-sm font-bold mb-2', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>My EID Names</h2>
          {mockOwnedEids.map((eid) => (
            <div key={eid.id} className={cn('flex items-center gap-3 p-4 mb-2 rounded-2xl', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
              <div className="flex-1">
                <p className="font-bold text-primary-500 text-lg tracking-wide">{eid.name}</p>
                <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                  {eid.characterCount} chars · {eid.tokenId} · Royalty {eid.royalty}%
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {eid.isPrimary && (
                  <span className="text-xs bg-primary-500/10 text-primary-500 font-semibold px-2 py-0.5 rounded-full">Primary</span>
                )}
                <button className={cn('text-xs font-semibold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Manage</button>
              </div>
            </div>
          ))}
        </div>

        <RiskWarningCard
          message="EID is an identity NFT. Activating a different name updates your ecosystem identity and invitation link; the wallet still owns every minted EID."
          level="info"
        />
      </div>
    </AppShell>
  );
}

function LegacyEIDSearchPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ available: boolean; price: number; discounted: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const res = await eidAdapter.searchEID(query.trim());
    setResult(res);
    setSearching(false);
  };

  return (
    <AppShell title="Search EID" showBack>
      <div className="vf-eid-page space-y-4">
        <EIDNavigation active="search" />
        <div className={cn('flex gap-2', '')}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter name..."
            className={cn('flex-1 rounded-xl px-4 py-3 text-sm font-bold tracking-widest outline-none border uppercase', isDark ? 'bg-dark-card border-dark-border text-dark-textPrimary placeholder-dark-textSecondary' : 'bg-light-card border-light-border text-light-textPrimary placeholder-light-textSecondary')}
          />
          <button
            onClick={handleSearch}
            disabled={!query || searching}
            className="px-4 py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50"
          >
            {searching ? '...' : 'Search'}
          </button>
        </div>

        {query.length > 0 && (
          <p className={cn('text-xs text-center', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
            Preview: <span className="font-bold text-primary-500">{query}.ETER</span> — {query.length} character{query.length !== 1 ? 's' : ''}
          </p>
        )}

        {result && (
          <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xl font-bold text-primary-500">{query.toUpperCase()}.ETER</p>
              <span className={cn('text-sm font-bold px-3 py-1 rounded-xl', result.available ? 'bg-success-DEFAULT/10 text-success-DEFAULT' : 'bg-danger-DEFAULT/10 text-danger-DEFAULT')}>
                {result.available ? 'Available' : 'Taken'}
              </span>
            </div>
            {result.available && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Standard Price</span><span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>${result.price}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Your Price (FAN discount)</span><span className="text-success-DEFAULT font-bold">${result.discounted}</span></div>
                <button
                  onClick={() => navigate(`/eid/mint?name=${encodeURIComponent(query)}`)}
                  className="w-full mt-2 py-2.5 rounded-xl gradient-primary text-white font-semibold"
                >
                  Mint this EID
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function LegacyEIDMintPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [paymentToken, setPaymentToken] = useState<PaymentToken>('USDT');
  const [reviewOpen, setReviewOpen] = useState(false);

  const len = name.length;
  const basePrice = len >= 8 ? 4 : len === 7 ? 8 : len === 6 ? 12 : len === 5 ? 16 : len === 4 ? 20 : 0;
  const fanDiscount = mockUser.starLevel * 10;
  const discountedPrice = len >= 4 ? parseFloat((basePrice * (1 - fanDiscount / 100)).toFixed(2)) : 0;
  const isFreeForLevel = (mockUser.starLevel >= 4 && len === 4) || (mockUser.starLevel >= 3 && len === 5) || (mockUser.starLevel >= 2 && len === 6) || (mockUser.starLevel >= 1 && len >= 7) || len >= 8;
  const finalPrice = isFreeForLevel ? 0 : discountedPrice;
  const balances = { USDT: mockUser.usdtBalance, ETER: mockUser.eterBalance, ET: mockUser.etBalance, Q: mockUser.qBalance };

  return (
    <AppShell title="Mint New EID" showBack>
      <div className="vf-eid-page space-y-4">
        <EIDNavigation active="mint" />
        <div className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
          <label className={cn('text-xs font-semibold mb-2 block', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>Desired Name</label>
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
              placeholder="YOURNAME"
              maxLength={20}
              className={cn('flex-1 rounded-xl px-4 py-3 text-lg font-bold tracking-widest outline-none border uppercase', isDark ? 'bg-dark-border border-dark-border text-dark-textPrimary placeholder-dark-textSecondary' : 'bg-light-bg border-light-border text-light-textPrimary placeholder-light-textSecondary')}
            />
            <span className={cn('text-sm font-bold', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>.ETER</span>
          </div>
          {name.length > 0 && (
            <p className={cn('text-xs mt-1', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
              {name.length} characters
              {name.length < 4 && <span className="text-danger-DEFAULT ml-1">— Minimum 4 characters required</span>}
            </p>
          )}
        </div>

        {name.length >= 4 && (
          <div className={cn('rounded-2xl p-4 space-y-2', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Standard Price</span>
              <span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>${basePrice}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>FAN Discount ({fanDiscount}%)</span>
              <span className="text-success-DEFAULT">-${(basePrice - discountedPrice).toFixed(2)}</span>
            </div>
            <hr className={isDark ? 'border-dark-border' : 'border-light-border'} />
            <div className="flex justify-between text-sm font-bold">
              <span className={isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'}>Final Price</span>
              <span className={finalPrice === 0 ? 'text-success-DEFAULT' : 'text-primary-500'}>
                {finalPrice === 0 ? 'FREE' : `$${finalPrice}`}
              </span>
            </div>
          </div>
        )}

        {name.length >= 4 && finalPrice > 0 && (
          <PaymentTokenSelector
            selected={paymentToken}
            onChange={setPaymentToken}
            usdAmount={finalPrice}
            balances={balances}
          />
        )}

        <button
          disabled={name.length < 4}
          onClick={() => setReviewOpen(true)}
          className="w-full py-3.5 rounded-2xl gradient-primary text-white font-semibold disabled:opacity-50"
        >
          {name.length >= 4 ? `Mint ${name}.ETER` : 'Enter a name to continue'}
        </button>

        <RiskWarningCard
          message="EID names cannot be recovered if forgotten. Your EID is an NFT and can be traded. Royalties apply to marketplace sales."
          level="info"
        />
      </div>

      <TransactionReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={() => eidAdapter.mintEID(name, paymentToken)}
        action={`Mint EID: ${name}.ETER`}
        amount={finalPrice}
        token={paymentToken}
        riskWarning="EID minting is permanent. Ensure the name is correct before confirming."
      />
    </AppShell>
  );
}

function LegacyEIDMyNamesPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeName, setActiveName] = useState(mockOwnedEids.find((eid) => eid.isPrimary)?.name ?? mockOwnedEids[0]?.name);
  const [primaryState, setPrimaryState] = useState<{ name: string; status: 'pending' | 'success' | 'error' } | null>(null);
  const activateEid = async (name: string) => {
    setPrimaryState({ name, status: 'pending' });
    try {
      await eidAdapter.setPrimaryEID(name);
      setActiveName(name);
      setPrimaryState({ name, status: 'success' });
    } catch {
      setPrimaryState({ name, status: 'error' });
    }
  };

  return (
    <AppShell title="My EID Names" showBack>
      <div className="vf-eid-page space-y-3">
        <EIDNavigation active="names" />
        {mockOwnedEids.map((eid) => (
          <div key={eid.id} className={cn('rounded-2xl p-4', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xl font-bold text-primary-500">{eid.name}</p>
              {eid.name === activeName && <span className="text-xs bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full font-semibold">Active identity</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Token ID</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{eid.tokenId}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Characters</p><p className={cn('font-semibold', isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary')}>{eid.characterCount}</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>Royalty</p><p className="font-semibold text-warning-DEFAULT">{eid.royalty}%</p></div>
              <div><p className={isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'}>For Sale</p><p className={cn('font-semibold', eid.listedForSale ? 'text-success-DEFAULT' : (isDark ? 'text-dark-textPrimary' : 'text-light-textPrimary'))}>{eid.listedForSale ? 'Listed' : 'No'}</p></div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {eid.name !== activeName && (
                <button type="button" disabled={primaryState?.name === eid.name && primaryState.status === 'pending'} onClick={() => void activateEid(eid.name)} className="min-h-11 px-3 rounded-lg bg-primary-500/10 text-primary-500 text-xs font-semibold disabled:opacity-50">{primaryState?.name === eid.name && primaryState.status === 'pending' ? 'Setting…' : 'Set as active'}</button>
              )}
              <button
                onClick={() => navigator.clipboard.writeText(`https://example.invalid/invite/${eid.name === activeName ? activeName : eid.name}`)}
                className={cn('invite-link-cta px-3 py-1.5 rounded-lg text-xs font-semibold', isDark ? 'bg-dark-border text-dark-textSecondary' : 'bg-light-border text-light-textSecondary')}
              >
                Copy Invite Link
              </button>
            </div>
            {eid.name === activeName && <p className="mt-3 text-xs text-success-DEFAULT">Invitation link updated: example.invalid/invite/{activeName}</p>}
            {primaryState?.name === eid.name && primaryState.status === 'error' && <p className="mt-3 text-xs text-danger-DEFAULT" role="alert">Could not update the active EID. Check your wallet and try again.</p>}
          </div>
        ))}
        <button onClick={() => navigate('/eid/mint')} className="w-full py-3 rounded-2xl gradient-primary text-white font-semibold text-sm">
          + Mint New EID
        </button>
      </div>
    </AppShell>
  );
}

function LegacyEIDMarketPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedListing, setSelectedListing] = useState<{ name: string; price: number } | null>(null);

  const listings = [
    { name: 'MOON.ETER', price: 150, seller: '0xABC...789', chars: 4 },
    { name: 'TRADE.ETER', price: 45, seller: '0xDEF...012', chars: 5 },
    { name: 'BUILDS.ETER', price: 28, seller: '0xGHI...345', chars: 6 },
    { name: 'FREEDOM.ETER', price: 18, seller: '0xJKL...678', chars: 7 },
  ];

  return (
    <AppShell title="EID Marketplace" showBack>
      <div className="vf-eid-page space-y-3">
        <RiskWarningCard message="All marketplace purchases include a 19% royalty: 10% to ERA governance, 9% to the original minter." level="info" />
        {listings.map((listing) => (
          <div key={listing.name} className={cn('flex items-center gap-3 p-4 rounded-2xl', isDark ? 'bg-dark-card border border-dark-border' : 'bg-light-card border border-light-border shadow-sm')}>
            <div className="flex-1">
              <p className="font-bold text-primary-500 text-lg">{listing.name}</p>
              <p className={cn('text-xs', isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary')}>
                {listing.chars} chars · Seller: {listing.seller}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">${listing.price}</p>
              <button type="button" onClick={() => setSelectedListing(listing)} className="min-h-11 px-3 text-xs text-primary-500 font-semibold">Buy</button>
            </div>
          </div>
        ))}
      </div>
      <TransactionReviewModal
        open={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        onConfirm={() => eidAdapter.buyEID(selectedListing?.name ?? '', 'USDT')}
        action={`Buy EID: ${selectedListing?.name ?? ''}`}
        amount={selectedListing?.price}
        token="USDT"
        expectedResult={`${selectedListing?.name ?? 'EID'} transferred to the connected wallet after confirmation`}
        riskWarning="Marketplace purchases are irreversible and include the disclosed 19% royalty. Verify the EID and price before signing."
      />
    </AppShell>
  );
}

export const EIDPage=()=> <EidPresentationBoundary view="overview" legacy={<LegacyEIDPage/>}/>;
export const EIDSearchPage=()=> <EidPresentationBoundary view="search" legacy={<LegacyEIDSearchPage/>}/>;
export const EIDMintPage=()=> <EidPresentationBoundary view="acquire" legacy={<LegacyEIDMintPage/>}/>;
export const EIDMyNamesPage=()=> <EidPresentationBoundary view="owned" legacy={<LegacyEIDMyNamesPage/>}/>;
export const EIDActivePage=()=> <EidPresentationBoundary view="active" legacy={<LegacyEIDMyNamesPage/>}/>;
export const EIDInvitePage=()=> <EidPresentationBoundary view="invite" legacy={<LegacyEIDMyNamesPage/>}/>;
export const EIDSettingsPage=()=> <EidPresentationBoundary view="settings" legacy={<LegacyEIDMyNamesPage/>}/>;
export const EIDMarketPage=()=> <EidPresentationBoundary view="market" legacy={<LegacyEIDMarketPage/>}/>;
