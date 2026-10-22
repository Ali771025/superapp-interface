export interface DisplayIdentityReadModel {
  wallet: string;
  activeEid?: string;
}

export function resolveDisplayIdentity(value: DisplayIdentityReadModel) {
  return {
    friendly: value.activeEid ?? value.wallet,
    activeEid: value.activeEid,
    wallet: value.wallet,
    walletRemainsAuthoritative: true as const,
  };
}
