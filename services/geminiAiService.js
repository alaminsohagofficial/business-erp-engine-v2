/**
 * Gemini AI Audit Service
 * File: services/geminiAiService.js
 * 
 * Description:
 * Connects to Google Gen AI using `@google/genai` SDK to evaluate 
 * financial ledger discrepancies and generate structured JSON audit notices.
 */

const { GoogleGenAI } = require('@google/genai');
const settings = require('../config/settings');

class GeminiAiService {
  /**
   * Initializes the Gemini AI client with configured settings.
   */
  constructor() {
    // Initialize client with the API key from settings or environment
    this.ai = new GoogleGenAI({
      apiKey: settings.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    });
    // Fast, modern default model for financial audit evaluation
    this.modelName = 'gemini-2.5-flash';
  }

  /**
   * Analyzes ledger discrepancies between central ERP and partner invoices.
   * 
   * @param {Object} params
   * @param {string} params.dealerId - Unique ID of the dealer/partner
   * @param {Array} params.centralLedger - Array of ledger records from ERP
   * @param {Array} params.partnerInvoices - Array of claimed partner invoices
   * @returns {Promise<Object>} Structured audit report containing discrepancies
   */
  async analyzeDispute({ dealerId, centralLedger, partnerInvoices }) {
    try {
      const prompt = `
You are an expert ERP Financial Auditor for Salsabilah Enterprise.
Analyze the following ledger reconciliation data for Dealer ID: "${dealerId}".

Central Ledger Records:
${JSON.stringify(centralLedger, null, 2)}

Partner Invoices / Claims:
${JSON.stringify(partnerInvoices, null, 2)}

Instructions:
1. Compare invoice numbers, amounts, and payment reference IDs between both datasets.
2. Identify missing, unposted, or variance entries.
3. Calculate total variance in BDT.
4. Return ONLY a valid JSON object matching this exact structure:
{
  "audit_notice_ref": "AUD-${Date.now()}",
  "dealer_id": "${dealerId}",
  "analysis": {
    "is_balanced": boolean,
    "total_discrepancy_bdt": number,
    "mismatched_invoices": [
      {
        "invoice_no": "string",
        "central_amount": number,
        "partner_amount": number,
        "variance_bdt": number,
        "reason": "string"
      }
    ],
    "audit_summary": "string"
  }
}
`;

      // Request content generation using GoogleGenAI SDK
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      // Parse and return structured JSON result
      const parsedAudit = JSON.parse(response.text);
      return parsedAudit;
    } catch (error) {
      console.error('[GeminiAiService] Audit analysis failed:', error.message);

      // Return fallback payload on network or parsing errors
      return {
        audit_notice_ref: `AUD-FALLBACK-${Date.now()}`,
        dealer_id: dealerId,
        analysis: {
          is_balanced: false,
          total_discrepancy_bdt: 0,
          mismatched_invoices: [],
          audit_summary: `AI analysis offline or failed: ${error.message}. Fallback audit triggered.`,
        },
      };
    }
  }
}

module.exports = GeminiAiService;
