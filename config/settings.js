/**
 * Application Settings Configuration
 * File: config/settings.js
 * 
 * Description:
 * Centralizes environment variable management for database URIs,
 * API keys, secret credentials, and server defaults.
 */

require('dotenv').config();

const settings = {
  // Application Environment & Port
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database Connection Strings
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/vatone_erp',

  // Security Credentials
  DISPATCH_SECRET_KEY: process.env.DISPATCH_SECRET_KEY || 'salsabilah_erp_dispatch_secret_2026',

  // Third-Party Integrations
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  DBBL_API_ENDPOINT: process.env.DBBL_API_ENDPOINT || 'https://api.dbbl.com/v1/rtgs'
};

module.exports = settings;
