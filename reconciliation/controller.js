/**
 * Reconciliation Controller
 * File: reconciliation/controller.js
 * 
 * Description:
 * Express route handler functions bridging database models and enterprise
 * service layers for ledger queries, AI audits, and force releases.
 */

const Ledger = require('../models/ledger');
const GeminiAiService = require('../services/geminiAiService');
const DbblService = require('../services/dbblService');
const DispatchSyncEngine = require('../services/dispatchSyncEngine');

const aiService = new GeminiAiService();
const dbblService = new DbblService();
const dispatchEngine = new DispatchSyncEngine();

/**
 * GET /api/reconciliation/ledger/:dealerId
 * Fetches ledger status for a specific dealer.
 */
exports.getLedgerByDealer = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const ledger = await Ledger.findOne({ dealerId });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: `No ledger entry found for Dealer ID: ${dealerId}`
      });
    }

    return res.status(200).json({
      success: true,
      data: ledger
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching ledger record',
      error: error.message
    });
  }
};

/**
 * POST /api/reconciliation/audit
 * Runs a Gemini AI discrepancy audit between central ledger and partner invoices.
 */
exports.runAiAudit = async (req, res) => {
  try {
    const { dealer_id, central_ledger, partner_invoices } = req.body;

    if (!dealer_id || !central_ledger || !partner_invoices) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: dealer_id, central_ledger, or partner_invoices.'
      });
    }

    const auditResult = await aiService.analyzeDispute({
      dealerId: dealer_id,
      centralLedger: central_ledger,
      partnerInvoices: partner_invoices
    });

    return res.status(200).json({
      success: true,
      audit: auditResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'AI Audit execution failed',
      error: error.message
    });
  }
};

/**
 * POST /api/reconciliation/force-release
 * Executes force-release authorization and updates dispatch status.
 */
exports.executeForceRelease = async (req, res) => {
  try {
    const { dealerId, dealerName, targetArticle, dispatchCentre, bypassReason } = req.body;

    if (!dealerId) {
      return res.status(400).json({
        success: false,
        message: 'Dealer ID is required for force-release authorization.'
      });
    }

    // Upsert override record in MongoDB
    const ledger = await Ledger.findOneAndUpdate(
      { dealerId },
      {
        $set: {
          dealerName: dealerName || 'Partner Dealer',
          unblockStatus: 'MANUAL_OVERRIDE_APPROVED',
          dispatchStatus: 'FORCE_RELEASE_ORDER_APPROVED',
          bypassReason: bypassReason || 'AUTOMATED_GEMINI_AUDIT_MATCH',
          targetArticle: targetArticle || 'UNSPECIFIED_ARTICLE',
          dispatchCentre: dispatchCentre || 'MAIN_HUB_DHAKA'
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    // Sync release with warehouse engine
    const syncResult = await dispatchEngine.syncRelease(ledger);

    return res.status(200).json({
      success: true,
      message: 'Force release authorized and dispatch synced successfully.',
      ledger,
      dispatchSync: syncResult
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Force release execution failed',
      error: error.message
    });
  }
};
