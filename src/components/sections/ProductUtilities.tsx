import type { ContractDetailsProps } from './ContractDetailsSection';

export type ProductKey = 'generator' | 'swap' | 'eid' | 'fan' | 'forecast' | 'shield' | 'ees' | 'era' | 'qora';

export const PRODUCT_CONTRACTS: Record<ProductKey, ContractDetailsProps> = {
  generator: { productName: 'ETER', address: '0xE7ER...1001', stats: [{ label: 'Network', value: 'Polygon PoS' }, { label: 'Status', value: 'Active', accent: 'success' }, { label: 'ETER price', value: '$1.350000' }, { label: 'Treasury', value: '4.28M ETER' }], lastSynced: 'Block 19,842,310' },
  swap: { productName: 'ETERNITY Swap', address: '0x5WAP...2002', stats: [{ label: 'Router', value: 'Active', accent: 'success' }, { label: 'Fee', value: '0.30%' }, { label: 'Pairs', value: 12 }, { label: 'Network', value: 'Polygon PoS' }] },
  eid: { productName: 'EID Registry', address: '0xE1D0...3003', stats: [{ label: 'Standard', value: 'ERC-721' }, { label: 'Active names', value: '18,420' }, { label: 'Primary rule', value: 'One / wallet' }, { label: 'Status', value: 'Active', accent: 'success' }] },
  fan: { productName: 'FAN Community', address: '0xFAN0...4004', stats: [{ label: 'Levels', value: 15 }, { label: 'Distribution', value: 'Instant', accent: 'success' }, { label: 'Renewal', value: 'Annual' }, { label: 'Indie', value: '$910 once' }] },
  forecast: { productName: 'Forecast', address: '0xF0RE...5005', stats: [{ label: 'Cycle', value: 'Weekly' }, { label: 'Round', value: '#28' }, { label: 'Status', value: 'Open', accent: 'success' }, { label: 'Treasury', value: '125,400 ETER' }] },
  shield: { productName: 'SHIELD', address: '0x5H1E...6006', stats: [{ label: 'Standard', value: 'ERC-721' }, { label: 'Max supply', value: '53,568' }, { label: 'Capacity', value: '$17.28M' }, { label: 'Status', value: 'Active', accent: 'success' }] },
  ees: { productName: 'STOCK', address: '0xEE50...7007', stats: [{ label: 'Phase-one supply', value: '4,000' }, { label: 'Standard', value: 'ERC-721' }, { label: 'Transfer fee', value: '19 ETER' }, { label: 'Voting', value: '1 right / stock' }] },
  era: { productName: 'ERA Governance', address: '0xERA0...8008', stats: [{ label: 'DAO', value: 'Active', accent: 'success' }, { label: 'Voting asset', value: 'STOCK' }, { label: 'Execution', value: 'On-chain' }, { label: 'Network', value: 'Polygon PoS' }] },
  qora: { productName: 'Q', address: '0xQ0RA...9009', stats: [{ label: 'Agent', value: 'Active', accent: 'success' }, { label: 'Token', value: 'Q' }, { label: 'Actions', value: 'Review first' }, { label: 'Network', value: 'Polygon PoS' }] },
};
