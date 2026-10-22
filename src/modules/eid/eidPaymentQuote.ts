import type { PaymentToken } from "../../lib/types";

/** @deprecated Superseded by provider-owned EID v4 acquisition quotes. */
export type EidPaymentQuote = {
  paymentAsset?: PaymentToken;
  paymentLegs: Array<{ asset: PaymentToken; amount: string }>;
  settlementLegs: Array<{ destination: string; asset: "Q" | "ETER"; percent: number; amount?: string }>;
  status: "unavailable";
};

/** @deprecated Current EID runtime must use ProductActionMap.eid.quoteEidAcquisition. */
export function pendingEidPaymentQuote(): EidPaymentQuote {
  return { paymentLegs: [], settlementLegs: [], status: "unavailable" };
}

/** @deprecated Fail-closed compatibility entry point; no single-asset settlement is authoritative. */
export async function resolveEidPaymentQuote(): Promise<never> {
  throw new Error("Superseded EID payment helper. Use the provider-owned EID v4 quote with Q and ETER settlement legs.");
}
