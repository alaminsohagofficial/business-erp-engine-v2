/**
 * Main Express Application Server
 * File: server.js
 * 
 * Description:
 * Primary entry point for Node.js API server. Connects to MongoDB,
 * registers middleware, attaches API routes, and listens on configured port.
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const settings = require('./config/settings');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach API Routes under /api prefix
app.use('/api', apiRoutes);

// Root Route
app.get('/', (req, res) => {
  res.send('Business ERP Engine v2.0 - Core Reconciliation API');
});

// Connect to MongoDB and Start Server
mongoose
  .connect(settings.MONGO_URI)
  .then(() => {
    console.log('[Database] MongoDB connection established successfully.');
    app.listen(settings.PORT, () => {
      console.log(`[Server] Express API running on port ${settings.PORT} in ${settings.NODE_ENV} mode.`);
    });
  })
  .catch((err) => {
    console.error('[Database] MongoDB connection error:', err.message);
    process.exit(1);
  });
