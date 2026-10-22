/**
 * Polygon is the single source of truth for the Eternity DApp.
 * Contract addresses are injected per environment so a preview can never
 * silently sign against a placeholder address.
 */
export const CHAIN_CONFIG = {
  chainId: 137,
  chainIdHex: '0x89',
  name: 'Polygon PoS',
  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
  rpcUrl: import.meta.env.VITE_POLYGON_RPC_URL || 'https://polygon-rpc.com',
  explorerUrl: 'https://polygonscan.com',
} as const;

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * The supplied contract adapters still return fixture data. Preview mode keeps
 * the interface honest by never presenting a simulated response as an
 * on-chain submission. Set this to false only after wiring every adapter used
 * in a release to its audited contract.
 */
export const IS_PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE !== 'false';
export const ARE_ADAPTERS_AUDITED = import.meta.env.VITE_ADAPTERS_AUDITED === 'true';
/**
 * QA builds start with the documented preview identity connected so every
 * protected screen can be reviewed. Production can never enable this path,
 * and preview reviewers can still disconnect to exercise the guest flow.
 */
export const IS_QA_CONNECTED_USER = IS_PREVIEW_MODE && import.meta.env.VITE_QA_CONNECTED_USER !== 'false';

export const CONTRACT_ADDRESSES = {
  GENERATOR: import.meta.env.VITE_GENERATOR_ADDRESS || EMPTY_ADDRESS,
  FAN: import.meta.env.VITE_FAN_ADDRESS || EMPTY_ADDRESS,
  FORECAST: import.meta.env.VITE_FORECAST_ADDRESS || EMPTY_ADDRESS,
  INSURANCE: import.meta.env.VITE_INSURANCE_ADDRESS || EMPTY_ADDRESS,
  EES: import.meta.env.VITE_EES_ADDRESS || EMPTY_ADDRESS,
  ERA: import.meta.env.VITE_ERA_ADDRESS || EMPTY_ADDRESS,
  QORA: import.meta.env.VITE_QORA_ADDRESS || EMPTY_ADDRESS,
  ETER_TOKEN: import.meta.env.VITE_ETER_TOKEN_ADDRESS || EMPTY_ADDRESS,
  Q_TOKEN: import.meta.env.VITE_Q_TOKEN_ADDRESS || EMPTY_ADDRESS,
  ET_TOKEN: import.meta.env.VITE_ET_TOKEN_ADDRESS || EMPTY_ADDRESS,
} as const;

export type ContractKey = keyof typeof CONTRACT_ADDRESSES;

export function getContractAddress(key: ContractKey): string {
  const address = CONTRACT_ADDRESSES[key];
  if (address === EMPTY_ADDRESS) {
    throw new Error(`${key} contract is not configured for this environment.`);
  }
  return address;
}

export function getReleaseReadiness() {
  const missingContracts = (Object.entries(CONTRACT_ADDRESSES) as Array<[ContractKey, string]>)
    .filter(([, address]) => address === EMPTY_ADDRESS)
    .map(([key]) => key);
  return {
    ready: IS_PREVIEW_MODE || (ARE_ADAPTERS_AUDITED && missingContracts.length === 0),
    missingContracts,
    adaptersAudited: ARE_ADAPTERS_AUDITED,
    mode: IS_PREVIEW_MODE ? 'preview' as const : 'production' as const,
  };
}

export const SUPPORTED_CHAINS = [CHAIN_CONFIG.chainId] as const;
