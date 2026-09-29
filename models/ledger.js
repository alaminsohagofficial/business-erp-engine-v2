/**
 * Ledger Override & Reconciliation Model
 * File: models/ledger.js
 * 
 * Description:
 * Mongoose schema for persisting financial reconciliation logs, 
 * credit override flags, and warehouse dispatch release statuses.
 */

const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    dealerId: {
      type: String,
      required: [true, 'Dealer ID is required'],
      index: true,
      trim: true,
    },
    dealerName: {
      type: String,
      required: [true, 'Dealer Name is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Dhaka, Bangladesh',
      trim: true,
    },
    totalMayRTGSBDT: {
      type: Number,
      default: 0,
      min: [0, 'RTGS credit cannot be negative'],
    },
    totalJulyPaymentsBDT: {
      type: Number,
      default: 0,
      min: [0, 'July payments cannot be negative'],
    },
    totalVerifiedCreditsBDT: {
      type: Number,
      default: 0,
      min: [0, 'Verified credits cannot be negative'],
    },
    unblockStatus: {
      type: String,
      required: true,
      enum: [
        'RESOLVED_SURPLUS_CREDIT_ACTIVE',
        'PENDING_VERIFICATION',
        'HOLD_MAINTAINED',
        'MANUAL_OVERRIDE_APPROVED',
      ],
      default: 'PENDING_VERIFICATION',
    },
    bypassReason: {
      type: String,
      required: true,
      default: 'AUTOMATED_GEMINI_AUDIT_MATCH',
    },
    authorizedBy: {
      type: String,
      required: true,
      default: 'ERP_V2_Middleware',
    },
    targetArticle: {
      type: String,
      default: 'UNSPECIFIED_ARTICLE',
    },
    dispatchCentre: {
      type: String,
      default: 'MAIN_HUB_DHAKA',
    },
    dispatchStatus: {
      type: String,
      required: true,
      enum: [
        'FORCE_RELEASE_ORDER_APPROVED',
        'DISPATCH_PENDING',
        'SYNC_FAILED',
        'DISPATCH_COMPLETED',
      ],
      default: 'DISPATCH_PENDING',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound index for fast lookup by dealer and status
ledgerSchema.index({ dealerId: 1, unblockStatus: 1 });

const Ledger = mongoose.model('Ledger', ledgerSchema);

module.exports = Ledger;
