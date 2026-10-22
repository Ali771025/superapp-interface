export const EID_OWNER_DELEGATE_ADMIN_ROUTE = "/admin/eid" as const;

export interface EidOwnerDelegateAdminContract {
  readFirstFreePolicy(): Promise<{ enabled: boolean; version: number }>;
  setFirstFreePolicy(input: { enabled: boolean; expectedVersion: number }): Promise<unknown>;
  readPricingPolicy(): Promise<unknown>;
  updatePricingPolicy(input: unknown): Promise<unknown>;
  readThirdPlusSurchargePolicy(): Promise<unknown>;
  updateThirdPlusSurchargePolicy(input: unknown): Promise<unknown>;
  readBlockedNames(): Promise<readonly string[]>;
  addBlockedName(input: { name: string; expectedVersion: number }): Promise<unknown>;
  removeBlockedName(input: { name: string; expectedVersion: number }): Promise<unknown>;
  sponsorIssuance(input: { recipient: string; quoteId: string; expectedVersion: number }): Promise<unknown>;
}

export const eidOwnerDelegateAdminCapabilityManifest = {
  routeOwnership: EID_OWNER_DELEGATE_ADMIN_ROUTE,
  mountedAuthorizedHost: true,
  uiImplementedInPhase12: true,
  uiScope: "capability-gateway-only",
  productionAuthorizationReady: false,
  publicProductActionMapImportsAdminWrites: false,
  ownerDelegateRestrictionExemption: "provider-enforced",
  capabilities: [
    {
      id: "fan-first-free",
      group: "Identity issuance policy",
      label: "First free FAN EID",
      ownership: "Owner Delegate / provider",
      integrationStatus: "Typed admin contract boundary",
      productionAuthorizationStatus: "Provider/admin authorization not connected",
      actionAvailability: "Unavailable",
    },
    {
      id: "short-name-policy",
      group: "Identity issuance policy",
      label: "1–3 character policy",
      ownership: "Owner Delegate / provider",
      integrationStatus: "Typed admin contract boundary",
      productionAuthorizationStatus: "Provider/admin authorization not connected",
      actionAvailability: "Unavailable",
    },
    {
      id: "third-plus-surcharge",
      group: "Identity issuance policy",
      label: "Third+ surcharge",
      ownership: "Owner Delegate / provider",
      integrationStatus: "Typed admin contract boundary",
      productionAuthorizationStatus: "Provider/admin authorization not connected",
      actionAvailability: "Unavailable",
    },
    {
      id: "blocked-name-policy",
      group: "Safety / naming",
      label: "Blocked-name policy",
      ownership: "Owner Delegate / provider",
      integrationStatus: "Typed admin contract boundary",
      productionAuthorizationStatus: "Provider/admin authorization not connected",
      actionAvailability: "Unavailable",
    },
    {
      id: "issuance-fee-sponsorship",
      group: "Issuance support",
      label: "Network fee sponsorship",
      ownership: "Owner Delegate / provider",
      integrationStatus: "Typed admin contract boundary",
      productionAuthorizationStatus: "Provider/admin authorization not connected",
      actionAvailability: "Unavailable",
    },
    {
      id: "owner-delegate-restriction-exemption",
      group: "Owner Delegate source exemption",
      label: "Restriction exemption",
      ownership: "Owner Delegate / provider",
      integrationStatus: "Provider-enforced actor exemption",
      productionAuthorizationStatus: "Provider/admin authorization not connected",
      actionAvailability: "Not a recipient whitelist control",
    },
  ],
} as const;
