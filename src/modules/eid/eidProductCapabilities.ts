import type { PaymentToken } from "../../lib/types";

/** @deprecated Superseded by EidProtocolContext policy and marketplace capabilities. */
export type EidPaymentCapabilities = {
  userPaymentAssets: PaymentToken[];
  settlementModel: "provider-legs";
  source: "unavailable";
  freshness: "unavailable";
};

/** @deprecated Current EID runtime reads capabilities from its configured Product provider. */
export function readEidPaymentCapabilities(): EidPaymentCapabilities {
  return { userPaymentAssets: [], settlementModel: "provider-legs", source: "unavailable", freshness: "unavailable" };
}
