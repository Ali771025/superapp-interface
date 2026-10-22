import type { Shield, ShieldProtocolColor, ShieldVisualKey } from '../../../lib/types';

export const shieldVisualMap: Record<ShieldVisualKey, { image: string; label: string; shortCode: string }> = {
  blue: { image:'/assets/shield-nft/eternity_neon_shield_emblem.png', label:'Blue SHIELD', shortCode:'BLU' },
  green: { image:'/assets/shield-nft/eternity_neon_green_shield_emblem.png', label:'Green SHIELD', shortCode:'GRN' },
  graphite: { image:'/assets/shield-nft/eternity_graphite_shield_badge.png', label:'Black SHIELD', shortCode:'BLK' },
  gold: { image:'/assets/shield-nft/eternity_gold_trimmed_shield_emblem.png', label:'Yellow SHIELD', shortCode:'YLW' },
  crimson: { image:'/assets/shield-nft/eternity_crimson_shield_emblem.png', label:'Red SHIELD', shortCode:'RED' },
};

export const shieldColorIdVisualMap: Record<1 | 2 | 3 | 4 | 5, ShieldVisualKey> = {
  1:'blue', 2:'green', 3:'crimson', 4:'graphite', 5:'gold',
};

export const shieldProtocolColorById: Record<1 | 2 | 3 | 4 | 5, ShieldProtocolColor> = {
  1:'Blue', 2:'Green', 3:'Red', 4:'Black', 5:'Yellow',
};

export const shieldProtocolColorVisualMap: Record<ShieldProtocolColor, ShieldVisualKey> = {
  Blue:'blue', Green:'green', Black:'graphite', Yellow:'gold', Red:'crimson',
};

export const shieldMintColorFamily: ShieldVisualKey[] = ['blue','green','crimson','graphite','gold'];

type ShieldVisualIdentity = Pick<Shield, 'shieldVisualKey' | 'color' | 'colorId'>;

export function canonicalShieldVisualKeyFor(shield: Pick<ShieldVisualIdentity, 'color' | 'colorId'>): ShieldVisualKey | undefined {
  if (shield.colorId && shield.colorId in shieldColorIdVisualMap) return shieldColorIdVisualMap[shield.colorId as keyof typeof shieldColorIdVisualMap];
  if (shield.color && shield.color in shieldProtocolColorVisualMap) return shieldProtocolColorVisualMap[shield.color as ShieldProtocolColor];
  return undefined;
}

export function shieldVisualKeyFor(shield: ShieldVisualIdentity): ShieldVisualKey {
  return canonicalShieldVisualKeyFor(shield) ?? shield.shieldVisualKey ?? 'graphite';
}

export function shieldVisualFor(shield: ShieldVisualIdentity) {
  return shieldVisualMap[shieldVisualKeyFor(shield)];
}

export function normalizeShieldTokenId(tokenId: string): string {
  const raw = tokenId.trim().replace(/^#/, '');
  return /^\d+$/.test(raw) ? `#${raw.padStart(4, '0')}` : `#${raw}`;
}

export function shieldAssetKeyFor(shield: Pick<Shield, 'priceGroup' | 'tokenId' | 'shieldAssetKey'>): string {
  return shield.shieldAssetKey ?? `${shield.priceGroup}:${normalizeShieldTokenId(shield.tokenId)}`;
}

export function shieldDetailPath(shield: Pick<Shield, 'priceGroup' | 'tokenId'>): string {
  return `/shield/${shield.priceGroup}/${normalizeShieldTokenId(shield.tokenId).slice(1)}`;
}
