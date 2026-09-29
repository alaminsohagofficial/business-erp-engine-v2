/**
 * Express API Routes
 * File: routes/api.js
 * 
 * Description:
 * Defines RESTful endpoints for ledger reconciliation, Gemini AI audits,
 * and dispatch force-release operations.
 */

const express = require('express');
const router = express.Router();
const controller = require('../reconciliation/controller');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// Ledger Lookup Endpoint
router.get('/reconciliation/ledger/:dealerId', controller.getLedgerByDealer);

// Gemini AI Audit Endpoint
router.post('/reconciliation/audit', controller.runAiAudit);

// Force Release Execution Endpoint
router.post('/reconciliation/force-release', controller.executeForceRelease);

module.exports = router;
