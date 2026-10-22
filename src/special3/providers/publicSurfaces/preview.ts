import { mockUser } from '../../../data/mockAssets';
import type { ArticleRecord, ContractCatalogEntry, LeaderboardDataset, LeaderboardEntry, LeaderboardTimeFilter, PublicSurfaceProvider } from './contracts';

const contracts: ContractCatalogEntry[] = [
  { id:'ETER', label:'ETER', network:'Polygon PoS', standard:'ERC-20', address:'0x7e210000000000000000000000000000000091a0' },
  { id:'SHIELD', label:'SHIELD', network:'Polygon PoS', standard:'ERC-721', address:'0x5a9000000000000000000000000000000000c214' },
  { id:'STOCK', label:'Electoral Stock', network:'Polygon PoS', standard:'ERC-721', address:'0xe35c000000000000000000000000000000000b71' },
  { id:'FORECAST', label:'Forecast', network:'Polygon PoS', standard:'Product contract', address:'0xf024000000000000000000000000000000008de2' },
  { id:'EID', label:'EID', network:'Polygon PoS', standard:'Registry', address:'0x1d31000000000000000000000000000000006a00' },
  { id:'Q', label:'Q', network:'Polygon PoS', standard:'ERC-20', address:'0x901b00000000000000000000000000000000e51f' },
  { id:'ERA', label:'ERA', network:'Polygon PoS', standard:'Governance', address:'0xa77e0000000000000000000000000000000017ca' },
];

const articles: ArticleRecord[] = [
  { slug:'wallet-safety-without-friction', title:'Wallet safety without friction', excerpt:'A practical model for making safer decisions before the signature screen appears.', body:['Security is most useful when it becomes part of the decision flow, not a warning shown after the user has committed. Start by making network, amount, destination and expected outcome visible together.','A strong review step uses plain language, keeps the user in context and never implies that a transaction is reversible. Small structural choices prevent more mistakes than a wall of technical copy.'], category:'Safety', tags:['Wallet','UX','Ownership'], author:'Mira Vale', verified:true, publishedAt:'2026-07-19', readingMinutes:6, echoes:384, cover:'/assets/articles/safety.svg' },
  { slug:'identity-as-a-growing-signal', title:'Identity as a growing signal', excerpt:'Why a useful Web3 identity should reflect verified contribution instead of a static profile.', body:['A digital identity becomes meaningful when it can explain how it changed. Verified learning, participation and governance form a clearer signal than a single balance.','The user should always understand which actions are public, which are private and how a reputation measure was calculated.'], category:'Identity', tags:['EID','Reputation'], author:'Noah Reed', verified:true, publishedAt:'2026-07-23', readingMinutes:5, echoes:291, cover:'/assets/articles/identity.svg' },
  { slug:'designing-readable-onchain-actions', title:'Designing readable on-chain actions', excerpt:'A checklist for turning contract intent into a review experience people can understand.', body:['Readable on-chain interaction begins before the wallet modal. The feature should state the action, amount, network, fee assumptions and expected result.','After confirmation, preserve a human-readable record beside the transaction reference so the user does not have to reconstruct intent from a block explorer.'], category:'Feature', tags:['Transactions','Design'], author:'ETERNITY Research', verified:true, publishedAt:'2026-07-11', updatedAt:'2026-07-21', readingMinutes:8, echoes:418, cover:'/assets/articles/onchain.svg' },
  { slug:'participation-with-context', title:'Participation with context', excerpt:'How bounded choices and clear outcomes create healthier ecosystem participation.', body:['Participation is not improved by showing more controls. It improves when users understand timing, eligibility, consequence and what happens next.','A calm interface can still feel alive through hierarchy, motion and feedback while keeping decisions grounded.'], category:'Participation', tags:['Forecast','Governance'], author:'Ari Chen', verified:false, publishedAt:'2026-07-25', readingMinutes:4, echoes:176, cover:'/assets/articles/participation.svg' },
];

const identity = {
  maria:{ username:'Maria Chen', eid:'MARIA.ETER', level:17, totalPersonalEq:198000 },
  james:{ username:'James Webb', eid:'JAMES.ETER', level:16, totalPersonalEq:155000 },
  sofia:{ username:'Sofia Reyes', eid:'SOFIA.ETER', level:15, totalPersonalEq:128000 },
  noah:{ username:'Noah Kim', eid:'NOAH.ETER', level:14, totalPersonalEq:95000 },
  priya:{ username:'Priya Nair', eid:'PRIYA.ETER', level:13, totalPersonalEq:74000 },
  luca:{ username:'Luca Ferrari', eid:'LUCA.ETER', level:12, totalPersonalEq:59000 },
  yuki:{ username:'Yuki Tanaka', eid:'YUKI.ETER', level:11, totalPersonalEq:42000 },
  amara:{ username:'Amara Diop', eid:'AMARA.ETER', level:10, totalPersonalEq:28000 },
  carlos:{ username:'Carlos Vega', eid:'CARLOS.ETER', level:9, totalPersonalEq:20000 },
  current:{ username:mockUser.username, eid:mockUser.primaryEid, level:5, totalPersonalEq:mockUser.eqPoints, isCurrentUser:true },
} as const;

// Every period is an explicit QA fixture. No cumulative Personal EQ scaling or client-side sorting is used.
const leaderboardFixtures: Record<LeaderboardTimeFilter, LeaderboardEntry[]> = {
  Daily:[
    { ...identity.sofia, rank:1, rankValue:18, rankUnit:'verified events', movement:'up' },
    { ...identity.maria, rank:2, rankValue:16, rankUnit:'verified events', movement:'same' },
    { ...identity.priya, rank:3, rankValue:14, rankUnit:'verified events', movement:'up' },
    { ...identity.james, rank:4, rankValue:12, rankUnit:'verified events', movement:'down' },
    { ...identity.current, rank:5, rankValue:11, rankUnit:'verified events', movement:'up' },
    { ...identity.noah, rank:6, rankValue:9, rankUnit:'verified events', movement:'same' },
    { ...identity.yuki, rank:7, rankValue:8, rankUnit:'verified events', movement:'up' },
    { ...identity.luca, rank:8, rankValue:7, rankUnit:'verified events', movement:'down' },
  ],
  Weekly:[
    { ...identity.maria, rank:1, rankValue:86, rankUnit:'participation pts', movement:'same' },
    { ...identity.james, rank:2, rankValue:79, rankUnit:'participation pts', movement:'up' },
    { ...identity.noah, rank:3, rankValue:72, rankUnit:'participation pts', movement:'up' },
    { ...identity.sofia, rank:4, rankValue:68, rankUnit:'participation pts', movement:'down' },
    { ...identity.current, rank:5, rankValue:61, rankUnit:'participation pts', movement:'up' },
    { ...identity.priya, rank:6, rankValue:57, rankUnit:'participation pts', movement:'same' },
    { ...identity.amara, rank:7, rankValue:49, rankUnit:'participation pts', movement:'up' },
    { ...identity.luca, rank:8, rankValue:44, rankUnit:'participation pts', movement:'down' },
  ],
  Monthly:[
    { ...identity.james, rank:1, rankValue:318, rankUnit:'participation pts', movement:'up' },
    { ...identity.maria, rank:2, rankValue:306, rankUnit:'participation pts', movement:'down' },
    { ...identity.priya, rank:3, rankValue:287, rankUnit:'participation pts', movement:'up' },
    { ...identity.sofia, rank:4, rankValue:264, rankUnit:'participation pts', movement:'same' },
    { ...identity.noah, rank:5, rankValue:241, rankUnit:'participation pts', movement:'up' },
    { ...identity.current, rank:6, rankValue:228, rankUnit:'participation pts', movement:'up' },
    { ...identity.yuki, rank:7, rankValue:205, rankUnit:'participation pts', movement:'same' },
    { ...identity.carlos, rank:8, rankValue:184, rankUnit:'participation pts', movement:'down' },
  ],
  'All-time':[
    { ...identity.maria, rank:1, rankValue:4820, rankUnit:'index pts', movement:'up' },
    { ...identity.james, rank:2, rankValue:3950, rankUnit:'index pts', movement:'same' },
    { ...identity.sofia, rank:3, rankValue:3100, rankUnit:'index pts', movement:'up' },
    { ...identity.noah, rank:4, rankValue:2700, rankUnit:'index pts', movement:'down' },
    { ...identity.priya, rank:5, rankValue:2200, rankUnit:'index pts', movement:'up' },
    { ...identity.luca, rank:6, rankValue:1900, rankUnit:'index pts', movement:'down' },
    { ...identity.yuki, rank:7, rankValue:1600, rankUnit:'index pts', movement:'same' },
    { ...identity.current, rank:8, rankValue:1480, rankUnit:'index pts', movement:'up' },
    { ...identity.amara, rank:9, rankValue:1300, rankUnit:'index pts', movement:'up' },
    { ...identity.carlos, rank:10, rankValue:1100, rankUnit:'index pts', movement:'down' },
  ],
};

const rankingBasis: Record<LeaderboardTimeFilter, LeaderboardDataset['rankingBasis']> = {
  Daily:{ label:'Provider-supplied daily participation', unit:'verified events', detail:'Explicit QA fixture values for the selected Daily period.', formulaStatus:'unavailable' },
  Weekly:{ label:'Provider-supplied weekly participation', unit:'participation pts', detail:'Explicit QA fixture values for the selected Weekly period.', formulaStatus:'unavailable' },
  Monthly:{ label:'Provider-supplied monthly participation', unit:'participation pts', detail:'Explicit QA fixture values for the selected Monthly period.', formulaStatus:'unavailable' },
  'All-time':{ label:'Provider-supplied participation index', unit:'index pts', detail:'Explicit QA fixture values for the All-time presentation state.', formulaStatus:'unavailable' },
};

const ready = <T,>(data:T, detail:string) => ({ state:'ready' as const, mode:'preview' as const, sourceLabel:'Preview fixture', detail, data });

export const previewPublicSurfaceProvider: PublicSurfaceProvider = {
  mode:'preview',
  contractCatalog: () => ready({ entries:contracts, source:{ source:'preview', label:'Preview · Contract catalog fixture', freshness:'unknown', detail:'Static catalog entries; no indexer, holder, supply, activity, or freshness claim.' } }, 'Static Preview catalog only.'),
  articles: () => ready({ entries:articles, source:{ source:'preview', label:'Preview · Editorial fixture', freshness:'unknown', detail:'Controlled article catalog for presentation review; publishing is unavailable.' }, publishing:{ canPublish:false, reason:'Contributor qualification and publishing service are not configured.' } }, 'Preview editorial catalog.'),
  leaderboard: (filter:LeaderboardTimeFilter) => {
    const entries = leaderboardFixtures[filter];
    const current = entries.find((entry) => entry.isCurrentUser);
    return ready({
      period:filter,
      entries,
      source:{ source:'preview', label:'Preview · QA fixture', freshness:'unknown', detail:'Explicit provider-owned period fixtures for presentation review; not production ranking.' },
      rankingBasis:rankingBasis[filter],
      currentUserPosition:current ? { rank:current.rank, eid:current.eid, label:'Preview position' } : undefined,
    }, 'Explicit Preview ranking fixture only; no production formula claim.');
  },
};
