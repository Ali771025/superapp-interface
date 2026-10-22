import { eesAdapter } from "../../../../adapters/mock/eesAdapter";
import { eidAdapter } from "../../../../adapters/mock/eidAdapter";
import { eraAdapter } from "../../../../adapters/mock/eraAdapter";
import { fanAdapter } from "../../../../adapters/mock/fanAdapter";
import { forecastAdapter } from "../../../../adapters/mock/forecastAdapter";
import { generatorAdapter } from "../../../../adapters/mock/generatorAdapter";
import { insuranceAdapter } from "../../../../adapters/mock/insuranceAdapter";
import { swapAdapter } from "../../../../adapters/mock/swapAdapter";
import type {
  ProductActionMap,
  ProductPresentationProvider,
} from "../contracts";
import {
  getPreviewEraProtocolContext,
  getPreviewEidExecutionContext,
  getPreviewForecastProtocolContext,
  getPreviewStockProtocolContext,
  previewProductData,
} from "./data";
import {
  getPreviewFanExecutionContext,
  getPreviewFanProtocolContext,
} from "./fanData";

// Phase08.3 migration note: direct income?.checkedEntitlement and
// income?.withdrawableEntitlement forwarding was replaced by authoritative context validation.

const previewStockActions: ProductActionMap["stock"] = {
  buyStock: async ({ amount }) => {
    const result = await eesAdapter.buyStocks(
      { quantity: 1, initialPaymentETER: amount },
      getPreviewStockProtocolContext(),
    );
    return { txHash: result.txHash, tokenId: result.positions[0]?.tokenId };
  },
  buyStocks: (params) =>
    eesAdapter.buyStocks(params, getPreviewStockProtocolContext()),
  completeStock: ({ tokenId, amountETER }) =>
    eesAdapter.completeStock(
      { tokenId, amount: amountETER },
      previewProductData.stocks,
    ),
  verifyFanMember: (address) => eesAdapter.verifyFanMember(address),
  transferStocks: (params) => eesAdapter.transferStocks(params),
  checkStockIncome: () =>
    eesAdapter.checkStockIncome(
      getPreviewStockProtocolContext(),
      previewProductData.stocks,
    ),
  withdrawStockIncome: (expected) =>
    eesAdapter.withdrawStockIncome(
      getPreviewStockProtocolContext(),
      previewProductData.stocks,
      expected,
    ),
  claimDividends: (tokenId) => eesAdapter.claimDividends(tokenId),
};

const previewEidActions: ProductActionMap["eid"] = {
  checkEidAvailability: (params) => eidAdapter.checkEidAvailability(params, getPreviewEidExecutionContext()),
  quoteEidAcquisition: (params) => eidAdapter.quoteEidAcquisition(params, getPreviewEidExecutionContext()),
  acquireEid: (params) => eidAdapter.acquireEid(params, getPreviewEidExecutionContext()),
  setActiveEid: (params) => eidAdapter.setActiveEid(params, getPreviewEidExecutionContext()),
  requestEidInviteLink: (params) => eidAdapter.requestEidInviteLink(params, getPreviewEidExecutionContext()),
  listEidForSale: (params) => eidAdapter.listEidForSale(params, getPreviewEidExecutionContext()),
  quoteEidMarketBuy: (params) => eidAdapter.quoteEidMarketBuy(params, getPreviewEidExecutionContext()),
  buyEid: (params) => eidAdapter.buyEid(params, getPreviewEidExecutionContext()),
};

const previewForecastActions: ProductActionMap["forecast"] = {
  enterForecast: (params) =>
    forecastAdapter.enterForecast(params, getPreviewForecastProtocolContext()),
  quoteForecastParticipation: (params) =>
    forecastAdapter.quoteForecastParticipation(
      params,
      getPreviewForecastProtocolContext(),
    ),
  verifyForecastBeneficiary: (address) =>
    forecastAdapter.verifyForecastBeneficiary(
      address,
      getPreviewForecastProtocolContext(),
    ),
  quoteForecastTicketGift: (params) =>
    forecastAdapter.quoteForecastTicketGift(
      params,
      getPreviewForecastProtocolContext(),
    ),
  giftForecastTicket: (params) =>
    forecastAdapter.giftForecastTicket(
      params,
      getPreviewForecastProtocolContext(),
    ),
  checkForecastPrize: () =>
    forecastAdapter.checkForecastPrize(getPreviewForecastProtocolContext()),
  withdrawForecastPrize: (expected) =>
    forecastAdapter.withdrawForecastPrize(
      getPreviewForecastProtocolContext(),
      expected,
    ),
  donateForecastPool: (params) =>
    forecastAdapter.donateForecastPool(
      params,
      getPreviewForecastProtocolContext(),
    ),
  checkContributorReward: () =>
    forecastAdapter.checkContributorReward(getPreviewForecastProtocolContext()),
  withdrawContributorReward: (expected) =>
    forecastAdapter.withdrawContributorReward(
      getPreviewForecastProtocolContext(),
      expected,
    ),
};
const previewFanActions: ProductActionMap["fan"] = {
  quoteFanMembership: (params) =>
    fanAdapter.quoteFanMembership(params, getPreviewFanProtocolContext()),
  joinFan: (params) =>
    fanAdapter.joinFan(params, getPreviewFanExecutionContext()),
  upgradeFanRank: (params) =>
    fanAdapter.upgradeFanRank(params, getPreviewFanExecutionContext()),
  renewFan: (params) =>
    fanAdapter.renewFan(params, getPreviewFanExecutionContext()),
  sendFanCommunityMessage: (params) =>
    fanAdapter.sendFanCommunityMessage(params, getPreviewFanExecutionContext()),
  upgradeFan: fanAdapter.upgradeFan,
  claimFanRewards: fanAdapter.claimFanRewards,
};
const previewEraActions: ProductActionMap["era"] = {
  createSuggestion: (params) =>
    eraAdapter.createSuggestion(params, getPreviewEraProtocolContext()),
  reviewSuggestion: (params) =>
    eraAdapter.reviewSuggestion(params, getPreviewEraProtocolContext()),
  amendSuggestion: (params) =>
    eraAdapter.amendSuggestion(params, getPreviewEraProtocolContext()),
  advanceSuggestion: (params) =>
    eraAdapter.advanceSuggestion(params, getPreviewEraProtocolContext()),
  cancelProposal: (params) =>
    eraAdapter.cancelProposal(params, getPreviewEraProtocolContext()),
  vote: (params) => eraAdapter.vote(params, getPreviewEraProtocolContext()),
  executeProposal: (params) =>
    eraAdapter.executeProposal(params, getPreviewEraProtocolContext()),
  submitEraCodePreparationProof: (params) =>
    eraAdapter.submitEraCodePreparationProof(
      params,
      getPreviewEraProtocolContext(),
    ),
  submitOwnerDiscretionProposal: (params) =>
    eraAdapter.submitOwnerDiscretionProposal(
      params,
      getPreviewEraProtocolContext(),
    ),
  submitOwnerFinalCode: (params) =>
    eraAdapter.submitOwnerFinalCode(params, getPreviewEraProtocolContext()),
  donateEliteFund: (params) =>
    eraAdapter.donateEliteFund(params, getPreviewEraProtocolContext()),
  withdrawEliteFund: (params) =>
    eraAdapter.withdrawEliteFund(params, getPreviewEraProtocolContext()),
  donateStockholderFund: (params) =>
    eraAdapter.donateStockholderFund(params, getPreviewEraProtocolContext()),
  adjustStockholderAllocation: (params) =>
    eraAdapter.adjustStockholderAllocation(
      params,
      getPreviewEraProtocolContext(),
    ),
};

export const previewProductActions: ProductActionMap = {
  fan: previewFanActions,
  era: previewEraActions,
  eid: previewEidActions,
  forecast: previewForecastActions,
  shield: insuranceAdapter,
  stock: previewStockActions,
  swap: swapAdapter,
  generator: generatorAdapter,
};
export const previewProductProvider: ProductPresentationProvider = {
  mode: "preview",
  available: true,
  data: previewProductData,
  actions: previewProductActions,
};
