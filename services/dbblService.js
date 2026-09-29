/**
 * DBBL Banking Integration & RTGS Reconciliation Service
 * File: services/dbblService.js
 * 
 * Description:
 * Processes Dutch-Bangla Bank (DBBL) RTGS transaction feeds, matches payment trace IDs,
 * and calculates verified credit balances for dealer accounts.
 */

const settings = require('../config/settings');

class DbblService {
  /**
   * Initializes DBBL service with default API endpoints.
   */
  constructor() {
    this.apiEndpoint = settings.DBBL_API_ENDPOINT;
  }

  /**
   * Reconciles raw RTGS transaction arrays for a target dealer.
   * 
   * @param {Array} transactions - Raw bank transaction objects
   * @param {string} targetDealerId - Dealer ID to filter and verify
   * @returns {Object} Reconciliation summary with cleared credits
   */
  reconcileTransactions(transactions = [], targetDealerId) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        dealerId: targetDealerId,
        totalClearedBDT: 0,
        matchedCount: 0,
        unmatchedCount: 0,
        status: 'NO_TRANSACTIONS_FOUND'
      };
    }

    let totalClearedBDT = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;
    const records = [];

    for (const tx of transactions) {
      const amount = Number(tx.amount_bdt) || 0;
      const isSettled = tx.status === 'SETTLED' || tx.status === 'POSTED';
      const isDealerMatch = tx.dealer_id === targetDealerId;

      if (isSettled && isDealerMatch) {
        totalClearedBDT += amount;
        matchedCount++;
        records.push({
          traceId: tx.trace_id || tx.reference_no,
          amountBDT: amount,
          status: 'CLEARED'
        });
      } else {
        unmatchedCount++;
        records.push({
          traceId: tx.trace_id || tx.reference_no,
          amountBDT: amount,
          status: 'UNMATCHED_OR_PENDING'
        });
      }
    }

    return {
      dealerId: targetDealerId,
      totalClearedBDT,
      matchedCount,
      unmatchedCount,
      records,
      status: matchedCount > 0 ? 'RECONCILIATION_SUCCESSFUL' : 'NO_VERIFIED_MATCHES'
    };
  }
}

module.exports = DbblService;
