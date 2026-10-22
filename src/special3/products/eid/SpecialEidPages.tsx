import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Copy,
  Fingerprint,
  Link2,
  Search,
  ShieldCheck,
  Tag,
  UserRound,
} from "@icons";
import { AppShell } from "../../../components/layout/AppShell";
import { TransactionReviewModal } from "../../../components/modals/TransactionReviewModal";
import { PaymentTokenSelector } from "../../../components/forms/PaymentTokenSelector";
import type { PaymentToken } from "../../../lib/types";
import {
  Field,
  FieldDescription,
  FieldInput,
  FieldLabel,
  LocalNav,
  PrimaryAction,
  SecondaryAction,
  SourceDisclosure,
} from "../../interaction";
import {
  productActions,
  productPresentationProvider,
} from "../../providers/products";
import { ProductProviderGate } from "../../providers/products/ProductProviderGate";
import { SpecialMetricCard } from "../../ui/SpecialMetricCard";
import { ProductHeroActions } from "../ProductHeroActions";
import type {
  EidAcquisitionQuote,
  EidMarketplaceQuote,
  EidOwnedIdentity,
  EidProtocolContext,
} from "./eidProtocol";
import { eidQuoteReviewable } from "./eidProtocol";
import "./eid.css";

export type EidSpecialView =
  | "overview"
  | "search"
  | "acquire"
  | "owned"
  | "active"
  | "invite"
  | "settings"
  | "market";

export type EidInviteReceiptById = Record<string, string>;

export const bindInviteReceiptToEid = (
  current: EidInviteReceiptById,
  eidId: string,
  inviteLink: string,
): EidInviteReceiptById => ({ ...current, [eidId]: inviteLink });
type MainView = "overview" | "acquire" | "owned" | "invite";
const nav = [
  { id: "overview", label: "Overview", to: "/eid" },
  { id: "acquire", label: "EID Mint", to: "/eid/mint" },
  { id: "owned", label: "My EIDs", to: "/eid/my-names" },
  { id: "invite", label: "Referral", to: "/eid/referral" },
] as const;
function routeView(view: EidSpecialView): MainView {
  if (view === "search" || view === "acquire") return "acquire";
  if (view === "invite") return "invite";
  if (["owned", "active", "settings", "market"].includes(view)) return "owned";
  return "overview";
}
function Source({ context }: { context: EidProtocolContext }) {
  return (
    <SourceDisclosure
      value={{
        source: context.source.source,
        freshness:
          context.source.freshness === "fresh"
            ? "fresh"
            : context.source.freshness === "stale"
              ? "stale"
              : "unavailable",
        label: context.source.label,
        detail: context.source.detail,
      }}
    />
  );
}
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Overview({ context }: { context: EidProtocolContext }) {
  return (
    <div className="s3-eid__stack">
      <section className="s3-eid__identity">
        <span className="s3-eid__mark">
          <Fingerprint />
        </span>
        <div>
          <small>Friendly ecosystem identity</small>
          <h2>{context.user.activeEid ?? "No active EID"}</h2>
          <code>{context.user.wallet}</code>
        </div>
        <b>{context.user.activeEid ? "ACTIVE" : "WALLET ONLY"}</b>
      </section>
      <section className="s3-eid__boundary">
        <ShieldCheck />
        <div>
          <strong>Friendly display, technical wallet truth</strong>
          <span>
            Your active EID can label ordinary ecosystem surfaces. Protected
            Review continues to show the complete wallet address.
          </span>
        </div>
      </section>
      <section className="s3-eid__actions">
        <a href="/eid/search">
          <Search />
          <span>
            <strong>Mint EID</strong>
            <small>Provider availability, naming and quote</small>
          </span>
        </a>
        <a href="/eid/my-names">
          <Tag />
          <span>
            <strong>My EIDs</strong>
            <small>NFT ownership and active identity</small>
          </span>
        </a>
      </section>
      <section className="s3-eid__progress">
        <CheckCircle2 />
        <div>
          <strong>Achievement owns progression</strong>
          <span>
            Verified acquisition evidence can be evaluated by Achievement. EID
            confirmation does not assign a client-side EQ value or cap.
          </span>
        </div>
      </section>
    </div>
  );
}

function AcquisitionQuote({ quote }: { quote: EidAcquisitionQuote }) {
  return (
    <section
      className={`s3-eid__quote is-${quote.freshness}`}
      data-testid="eid-acquisition-quote"
    >
      <header>
        <div>
          <span>{quote.source}</span>
          <strong>{quote.canonicalName}</strong>
        </div>
        <b>{quote.availability}</b>
      </header>
      <div className="s3-eid__facts">
        <Fact
          label="Provider base"
          value={
            quote.basePriceUsd === null
              ? "Unavailable"
              : `$${quote.basePriceUsd.toFixed(2)}`
          }
        />
        <Fact
          label="Acquisition order"
          value={`#${quote.acquisitionOrdinal}`}
        />
        <Fact
          label="First EID benefit"
          value={quote.firstFreeApplied ? "FREE" : "Not applied"}
        />
        <Fact label="Provider surcharge" value={`${quote.surchargePercent}%`} />
        <Fact
          label="Cumulative discount"
          value={`${quote.totalDiscountPercent}%`}
        />
        <Fact
          label="Final provider price"
          value={
            quote.finalPriceUsd === 0
              ? "FREE"
              : `$${quote.finalPriceUsd.toFixed(2)}`
          }
        />
        <Fact
          label="Network fee"
          value={
            quote.networkFeeResponsibility === "owner-delegate-sponsored"
              ? "Owner Delegate sponsored"
              : "User pays"
          }
        />
        <Fact label="Freshness" value={quote.freshness} />
      </div>
      <details open>
        <summary>Provider qualification</summary>
        {quote.discountBreakdown.map((line) => (
          <p key={line.id}>
            {line.qualified ? "✓" : "—"} {line.label} · {line.percent}%
          </p>
        ))}
      </details>
      <div className="s3-eid__payments" aria-label="Accepted EID payments">
        {quote.acceptedPaymentAssets.map((asset) => (
          <span key={asset}>{asset}</span>
        ))}
      </div>
      {quote.settlementLegs.length > 0 && (
        <div className="s3-eid__allocations">
          <strong>Provider settlement</strong>
          {quote.settlementLegs.map((leg) => (
            <span key={leg.destination}>
              {leg.percent}% {leg.destination} · {leg.asset}
              {leg.amount ? ` · ${leg.amount}` : ""}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function Acquire({ context }: { context: EidProtocolContext }) {
  const [name, setName] = useState("");
  const [payment, setPayment] = useState<PaymentToken>("USDT");
  const [quote, setQuote] = useState<EidAcquisitionQuote>();
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const requestSequence = useRef(0);
  const reviewedPaymentLeg = quote?.paymentLegs.find(
    (leg) => leg.asset === quote.selectedPaymentAsset,
  );
  const reviewedPaymentAmount = reviewedPaymentLeg
    ? Number(reviewedPaymentLeg.amount)
    : undefined;
  const requestQuote = async (requestedName = name, requestedPayment = payment) => {
    const sequence = ++requestSequence.current;
    setError("");
    setReview(false);
    try {
      await productActions.eid.checkEidAvailability({ name: requestedName });
      if (sequence !== requestSequence.current) return;
      const result = await productActions.eid.quoteEidAcquisition({
        name: requestedName,
        paymentAsset: requestedPayment,
      });
      if (sequence !== requestSequence.current) return;
      setQuote(result);
    } catch (reason) {
      if (sequence !== requestSequence.current) return;
      setError(
        reason instanceof Error
          ? reason.message
          : "Provider quote unavailable.",
      );
    }
  };
  const confirm = () =>
    productActions.eid.acquireEid({
      name: quote!.canonicalName,
      expectedQuoteId: quote!.quoteId,
      expectedVersion: quote!.version,
      expectedExpiresAt: quote!.expiresAt,
      expectedAcquisitionOrdinal: quote!.acquisitionOrdinal,
      paymentAsset: quote!.selectedPaymentAsset,
      expectedPaymentLegs: quote!.paymentLegs.map((leg) => ({ ...leg })),
      expectedFinalPriceUsd: quote!.finalPriceUsd,
      expectedNetworkFeeResponsibility: quote!.networkFeeResponsibility,
    });
  return (
    <div className="s3-eid__stack">
      <section className="s3-product__panel s3-eid__find">
        <div>
          <p className="s3-product__eyebrow">Provider availability</p>
          <h2>Find your EID</h2>
          <p>
            Letters and numbers only. Public names with 1–3 characters are Owner
            Delegate-managed.
          </p>
        </div>
        <Field
          id="eid-name"
          state={!quote ? "default" : quote.availability === "available" ? "valid" : "invalid"}
        >
          <FieldLabel htmlFor="eid-name-input">EID name</FieldLabel>
          <FieldDescription id="eid-name-help">
            Input is validated exactly; symbols are not silently removed.
          </FieldDescription>
          <div className="s3-eid__input">
            <FieldInput
              id="eid-name-input"
              value={name}
              onChange={(event) => {
                requestSequence.current += 1;
                setName(event.target.value.toUpperCase());
                setQuote(undefined);
                setReview(false);
              }}
            />
            <b>.ETER</b>
            <PrimaryAction onClick={() => void requestQuote()}>Check</PrimaryAction>
          </div>
        </Field>
        {error && (
          <p role="alert" className="s3-eid__error">
            {error}
          </p>
        )}
      </section>
      {quote && (
        <>
          <AcquisitionQuote quote={quote} />
          {quote.finalPriceUsd > 0 && quote.availability === "available" && (
            <section className="s3-eid__payment">
              <PaymentTokenSelector
                label="Payment token"
                selected={payment}
                tokens={[...context.policy.acceptedPaymentAssets]}
                usdAmount={quote.finalPriceUsd}
                onChange={(asset) => {
                  setPayment(asset);
                  void requestQuote(name, asset);
                }}
              />
            </section>
          )}
          {quote.freshness !== "fresh" && (
            <p role="alert" className="s3-eid__error">
              This provider quote is {quote.freshness}. Request a fresh quote before Review.
            </p>
          )}
          <PrimaryAction
            disabled={!eidQuoteReviewable(quote)}
            onClick={() => setReview(true)}
          >
            {quote.finalPriceUsd === 0
              ? "Review free EID"
              : "Review EID acquisition"}
          </PrimaryAction>
          <TransactionReviewModal
            open={review && eidQuoteReviewable(quote)}
            onClose={() => setReview(false)}
            onConfirm={confirm}
            action="Acquire EID"
            amount={quote.finalPriceUsd > 0 ? reviewedPaymentAmount : undefined}
            token={quote.finalPriceUsd > 0 ? quote.selectedPaymentAsset : undefined}
            to={context.user.wallet}
            expectedResult={`${quote.canonicalName} issued as an owned EID NFT`}
            additionalReviewFields={[
              {
                id: "quote",
                label: "Quote / version",
                value: `${quote.quoteId} · v${quote.version}`,
              },
              {
                id: "expiry",
                label: "Reviewed quote expiry",
                value: quote.expiresAt,
              },
              {
                id: "ordinal",
                label: "Acquisition ordinal",
                value: `#${quote.acquisitionOrdinal}`,
              },
              {
                id: "price",
                label: "Final provider price",
                value:
                  quote.finalPriceUsd === 0
                    ? "FREE · no payment token"
                    : `$${quote.finalPriceUsd.toFixed(2)} USD`,
              },
              {
                id: "payment",
                label: "Payment amount",
                value: reviewedPaymentLeg
                  ? `${reviewedPaymentLeg.amount} ${reviewedPaymentLeg.asset}`
                  : "No token payment",
              },
              {
                id: "fee-owner",
                label: "Network fee responsibility",
                value: quote.networkFeeResponsibility,
              },
              {
                id: "settlement",
                label: "Provider settlement",
                value: quote.settlementLegs.length
                  ? quote.settlementLegs
                      .map(
                        (leg) =>
                          `${leg.percent}% ${leg.destination} ${leg.asset}`,
                      )
                      .join(" · ")
                  : "No paid settlement",
              },
            ]}
          />
        </>
      )}
    </div>
  );
}

function OwnedCard({
  item,
  onActive,
  onInvite,
  invitePending,
}: {
  item: EidOwnedIdentity;
  onActive: () => void;
  onInvite: () => void;
  invitePending: boolean;
}) {
  return (
    <article data-eid-id={item.id} data-eid-invite-status={invitePending ? "pending" : item.inviteStatus}>
      <header>
        <div>
          <span>{item.tokenId}</span>
          <h2>{item.name}</h2>
        </div>
        {item.active && <b>ACTIVE</b>}
      </header>
      <dl>
        <div>
          <dt>NFT owner</dt>
          <dd>{item.ownerWallet}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>v{item.version}</dd>
        </div>
        <div>
          <dt>Original minter</dt>
          <dd>{item.originalMinter}</dd>
        </div>
        <div>
          <dt>Invite</dt>
          <dd>{item.inviteStatus}</dd>
        </div>
      </dl>
      {item.contractAddress && (
        <details>
          <summary>Per-EID provenance</summary>
          <code>{item.contractAddress}</code>
          {item.originalMinterReferrer && (
            <code>Referrer · {item.originalMinterReferrer}</code>
          )}
        </details>
      )}
      <div className="s3-eid__owned-actions">
        {!item.active && (
          <SecondaryAction onClick={onActive}>Set active</SecondaryAction>
        )}
        {item.inviteStatus === "none" ? (
          <SecondaryAction onClick={onInvite} disabled={invitePending} aria-busy={invitePending}>
            {invitePending ? "Invite request pending" : "Request invite link"}
          </SecondaryAction>
        ) : item.inviteLink ? (
          <SecondaryAction
            onClick={() => navigator.clipboard.writeText(item.inviteLink!)}
          >
            <Copy /> Copy exact provider URL
          </SecondaryAction>
        ) : null}
      </div>
      {item.inviteLink && (
        <p>
          <Link2 />
          {item.inviteLink}
        </p>
      )}
    </article>
  );
}

function Owned({
  context,
  initial,
}: {
  context: EidProtocolContext;
  initial: EidSpecialView;
}) {
  const initialMode =
    initial === "active" ? "active" : initial === "invite" ? "invite" : "owned";
  const [mode, setMode] = useState(initialMode);
  const [selected, setSelected] = useState(context.owned[0]);
  const [review, setReview] = useState(false);
  const [inviteResultByEidId, setInviteResultByEidId] = useState<EidInviteReceiptById>({});
  const [invitePendingByEidId, setInvitePendingByEidId] = useState<Record<string, boolean>>({});
  const inviteRequestsInFlight = useRef(new Set<string>());
  const activate = () =>
    productActions.eid.setActiveEid({
      eidId: selected.id,
      expectedVersion: selected.version,
    });
  const requestInvite = async (item: EidOwnedIdentity) => {
    const eidId = item.id;
    const expectedVersion = item.version;
    if (inviteRequestsInFlight.current.has(eidId)) return;
    inviteRequestsInFlight.current.add(eidId);
    setInvitePendingByEidId((current) => ({ ...current, [eidId]: true }));
    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 120)),
      );
      const result = await productActions.eid.requestEidInviteLink({
        eidId,
        expectedVersion,
      });
      setInviteResultByEidId((current) =>
        bindInviteReceiptToEid(current, eidId, result.inviteLink),
      );
    } finally {
      inviteRequestsInFlight.current.delete(eidId);
      setInvitePendingByEidId((current) => ({ ...current, [eidId]: false }));
    }
  };
  return (
    <div className="s3-eid__stack">
      <div className="s3-eid__subnav">
        {(["owned", "active", "invite"] as const).map((id) => (
          <button
            key={id}
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
          >
            {id === "owned"
              ? "Owned NFTs"
              : id === "active"
                ? "Active identity"
                : "Referral"}
          </button>
        ))}
      </div>
      {mode === "active" && (
        <section className="s3-eid__identity">
          <span className="s3-eid__mark">
            <UserRound />
          </span>
          <div>
            <small>Friendly active EID</small>
            <h2>{context.user.activeEid ?? "Not selected"}</h2>
            <code>Technical wallet · {context.user.wallet}</code>
          </div>
          <b>PROVIDER</b>
        </section>
      )}
      <section className="s3-eid__owned">
        {context.owned.map((item) => (
          <OwnedCard
            key={item.id}
            item={{
              ...item,
              inviteLink: inviteResultByEidId[item.id] ?? item.inviteLink,
              inviteStatus: inviteResultByEidId[item.id]
                ? "available"
                : item.inviteStatus,
            }}
            invitePending={Boolean(invitePendingByEidId[item.id])}
            onActive={() => {
              setSelected(item);
              setReview(true);
            }}
            onInvite={() => {
              setSelected(item);
              void requestInvite(item);
            }}
          />
        ))}
      </section>
      {mode === "invite" && (
        <div className="s3-eid__stack">
          <p className="s3-eid__market-note">
            Referral links are never fabricated by the client. The owner must
            explicitly request one; the exact canonical URL is supplied by the
            EID provider.
          </p>
          <section className="s3-product__panel" aria-label="EID monetary referral policy">
            <p className="s3-product__eyebrow">DIRECT · LEVEL 1</p>
            <h2>10% paid instantly in Q</h2>
            <p className="s3-product__muted">
              When a qualifying new user pays for an EID through your provider-issued
              referral link, the protocol pays 10% of the qualifying payment value to
              you in Q. This automatic payout has no receive-token selector and is
              separate from Achievement Referral EQ.
            </p>
            <div className="s3-eid__facts">
              <Fact label="Depth" value="L1 only" />
              <Fact label="Payout asset" value="Q · fixed" />
              <Fact label="Timing" value="Instant" />
              <Fact label="Amount" value="Provider result" />
            </div>
          </section>
        </div>
      )}
      {selected && (
        <TransactionReviewModal
          open={review}
          onClose={() => setReview(false)}
          onConfirm={activate}
          action="Set active EID"
          to={context.user.wallet}
          expectedResult={`${selected.name} becomes the friendly ecosystem display identity`}
          additionalReviewFields={[
            {
              id: "eid",
              label: "Owned EID NFT",
              value: `${selected.name} · ${selected.tokenId} · v${selected.version}`,
            },
            {
              id: "owner",
              label: "Ownership wallet",
              value: selected.ownerWallet,
            },
          ]}
        />
      )}
    </div>
  );
}

function Market({ context }: { context: EidProtocolContext }) {
  const [buyQuote, setBuyQuote] = useState<EidMarketplaceQuote>();
  const [buyReview, setBuyReview] = useState(false);
  const [listReview, setListReview] = useState(false);
  const [listAmount, setListAmount] = useState("");
  const [listAsset, setListAsset] = useState<PaymentToken>(
    context.marketplace.supportedListingPaymentAssets[0] ?? "USDT",
  );
  const [marketError, setMarketError] = useState("");
  const buyRequestSequence = useRef(0);
  const owned = context.owned.find((item) => item.listable);
  const numericListAmount = Number(listAmount);
  const quoteBuy = async (listingId: string) => {
    const sequence = ++buyRequestSequence.current;
    setMarketError("");
    setBuyQuote(undefined);
    setBuyReview(false);
    try {
      const quote = await productActions.eid.quoteEidMarketBuy({ listingId });
      if (sequence !== buyRequestSequence.current) return;
      setBuyQuote(quote);
      if (quote.freshness !== "fresh" || Date.parse(quote.providerNow) >= Date.parse(quote.expiresAt)) {
        setMarketError("This marketplace quote is expired. Request a fresh listing quote.");
        setBuyReview(false);
        return;
      }
      setBuyReview(true);
    } catch (reason) {
      if (sequence !== buyRequestSequence.current) return;
      setMarketError(reason instanceof Error ? reason.message : "Marketplace quote unavailable.");
    }
  };
  return (
    <div className="s3-eid__stack">
      <section className="s3-eid__market-note">
        <strong>19% marketplace loyalty</strong>
        <span>
          8% ERA · 8% original Minter · 3% original Minter referrer. Amounts and
          eligibility are provider-owned.
        </span>
      </section>
      <section className="s3-eid__market">
        {context.listings.map((item) => (
          <article key={item.id}>
            <div>
              <span>
                {item.tokenId} · provider listing v{item.version}
              </span>
              <h2>{item.name}</h2>
              <code>{item.sellerWallet}</code>
            </div>
            <strong>
              {item.amount} {item.paymentAsset}
            </strong>
            <PrimaryAction onClick={() => void quoteBuy(item.id)}>
              Review buy
            </PrimaryAction>
          </article>
        ))}
      </section>
      {marketError && <p role="alert" className="s3-eid__error">{marketError}</p>}
      {context.marketplace.canList && !owned && (
        <section className="s3-eid__market-note">
          <strong>No owned EID is currently available to list.</strong>
          <span>Marketplace browse and protected Buy Review remain available.</span>
        </section>
      )}
      {context.marketplace.canList && owned && (
        <section className="s3-eid__payment">
          <strong>List owned {owned.name} for sale</strong>
          <Field id="eid-list-amount" state={listAmount && !(numericListAmount > 0) ? "invalid" : "default"}>
            <FieldLabel htmlFor="eid-list-amount-input">Listing amount</FieldLabel>
            <FieldDescription id="eid-list-amount-help">Enter your terms. The provider revalidates amount, asset, ownership and NFT version.</FieldDescription>
            <FieldInput id="eid-list-amount-input" inputMode="decimal" value={listAmount} onChange={(event) => setListAmount(event.target.value)} placeholder="Amount" />
          </Field>
          <div>
            {context.marketplace.supportedListingPaymentAssets.map((asset) => (
              <button key={asset} type="button" aria-pressed={listAsset === asset} onClick={() => setListAsset(asset)}>{asset}</button>
            ))}
          </div>
          <PrimaryAction disabled={!Number.isFinite(numericListAmount) || numericListAmount <= 0} onClick={() => setListReview(true)}>Review listing terms</PrimaryAction>
        </section>
      )}
      {owned && <TransactionReviewModal
        open={listReview}
        onClose={() => setListReview(false)}
        onConfirm={() =>
          productActions.eid.listEidForSale({
            eidId: owned.id,
            amount: numericListAmount,
            paymentAsset: listAsset,
            expectedVersion: owned.version,
          })
        }
        action="List owned EID for sale"
        amount={numericListAmount}
        token={listAsset}
        expectedResult={`${owned.name} listed by its current owner`}
        additionalReviewFields={[
          {
            id: "nft",
            label: "Owned NFT",
            value: `${owned.tokenId} · v${owned.version}`,
          },
          { id: "owner", label: "Current owner", value: owned.ownerWallet },
        ]}
      />}
      {buyQuote && (
        <TransactionReviewModal
          open={buyReview && buyQuote.freshness === "fresh"}
          onClose={() => setBuyReview(false)}
          onConfirm={() =>
            productActions.eid.buyEid({
              listingId: buyQuote.listingId,
              expectedListingVersion: buyQuote.listingVersion,
              expectedQuoteId: buyQuote.quoteId,
              expectedQuoteVersion: buyQuote.version,
              expectedExpiresAt: buyQuote.expiresAt,
              expectedOwner: buyQuote.sellerWallet,
              expectedAmount: buyQuote.amount,
              expectedPaymentAsset: buyQuote.paymentAsset,
              expectedLoyaltySplit: buyQuote.loyaltySplit.map((line) => ({ ...line })),
            })
          }
          action="Buy listed EID"
          amount={buyQuote.amount}
          token={buyQuote.paymentAsset}
          to={buyQuote.sellerWallet}
          expectedResult={`${buyQuote.eidName} ownership transfers after provider revalidation`}
          additionalReviewFields={[
            {
              id: "quote",
              label: "Listing / quote versions",
              value: `listing v${buyQuote.listingVersion} · quote v${buyQuote.version}`,
            },
            {
              id: "expiry",
              label: "Reviewed market quote expiry",
              value: buyQuote.expiresAt,
            },
            {
              id: "loyalty",
              label: "19% loyalty",
                value: buyQuote.loyaltySplit
                .map((line) => `${line.percent}% ${line.destination} → ${line.recipient}`)
                .join(" · "),
            },
            {
              id: "seller",
              label: "Bound seller",
              value: buyQuote.sellerWallet,
            },
          ]}
        />
      )}
    </div>
  );
}
void Market;

function Workspace({ requestedView }: { requestedView: EidSpecialView }) {
  const navigate = useNavigate();
  const context = productPresentationProvider.data.eidProtocolContext;
  if (!context) return null;
  const active = routeView(requestedView);
  return (
    <AppShell title="EID" showBack wide>
      <section data-special3 className="s3-product s3-product--eid s3-eid">
        <header className="s3-product__hero s3-eid__hero">
          <div className="s3-product__hero-row">
            <div>
              <p className="s3-product__eyebrow">EID v4 · Identity protocol</p>
              <h1>EID</h1>
              <p>Optional ETERNITY identity backed by an owned EID NFT.</p>
            </div>
            <ProductHeroActions product="EID" />
          </div>
        </header>
        <section className="s3-product__metrics s3-eid__metrics">
          <SpecialMetricCard
            label="Active identity"
            value={context.user.activeEid ?? "Wallet"}
            detail="Friendly display"
            icon={<Fingerprint />}
          />
          <SpecialMetricCard
            label="Owned EIDs"
            value={String(context.owned.length)}
            detail="NFT records"
            icon={<Tag />}
          />
          <SpecialMetricCard
            label="Next acquisition"
            value={`#${context.user.nextAcquisitionOrdinal}`}
            detail="Provider ordinal"
            icon={<Search />}
          />
          <SpecialMetricCard
            label="Qualified discount"
            value={`${context.user.currentDiscountPercent}%`}
            detail="Provider result"
            icon={<ShieldCheck />}
          />
        </section>
        <LocalNav
          label="EID"
          activeId={active}
          items={nav}
          onChange={(id) =>
            navigate(nav.find((item) => item.id === id)?.to ?? "/eid")
          }
        />
        <main className="s3-eid__workspace">
          {active === "overview" ? (
            <Overview context={context} />
          ) : active === "acquire" ? (
            <Acquire context={context} />
          ) : active === "owned" || active === "invite" ? (
            <Owned context={context} initial={requestedView} />
          ) : null}
        </main>
        <Source context={context} />
      </section>
    </AppShell>
  );
}
export function SpecialEidPresentation({ view }: { view: EidSpecialView }) {
  return (
    <ProductProviderGate title="EID">
      <Workspace requestedView={view} />
    </ProductProviderGate>
  );
}

export function SpecialEidPage() {
  const { pathname } = useLocation();
  const view: EidSpecialView = pathname === "/eid/mint" || pathname === "/eid/search" ? "acquire"
    : pathname === "/eid/my-names" ? "owned"
    : pathname === "/eid/active" ? "active"
    : pathname === "/eid/referral" || pathname === "/eid/invite" ? "invite"
    : pathname === "/eid/settings" ? "settings"
    : pathname === "/eid/market" ? "market"
    : "overview";
  return <SpecialEidPresentation view={view} />;
}
