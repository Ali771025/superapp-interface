import type { EIDName } from '../../lib/types';

export type EidInviteLinkStatus = 'resolving' | 'available' | 'unavailable' | 'error';

export type EidInviteLinkResolution = {
  status: EidInviteLinkStatus;
  url: string | null;
  source: 'product-record' | 'product-adapter' | 'unavailable';
};

const unavailable: EidInviteLinkResolution = {
  status: 'unavailable',
  url: null,
  source: 'unavailable',
};

function isCanonicalHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function resolveOwnedEidInviteLink(
  eid: EIDName,
  connectedWallet: string | null | undefined,
): Promise<EidInviteLinkResolution> {
  if (!connectedWallet || eid.owner.toLowerCase() !== connectedWallet.toLowerCase()) return unavailable;

  if (isCanonicalHttpUrl(eid.inviteLink)) {
    return { status: 'available', url: eid.inviteLink, source: 'product-record' };
  }

  // Phase12: reading an EID must never create a link. The current owner uses
  // the explicit requestEidInviteLink Product action from the EID v4 surface.
  return unavailable;
}
