/**
 * Main Express Server
 * Simple, modular, and easy to explain.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// URL normalization for Vercel serverless rewrites
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api') && !req.url.startsWith('/api')) {
    req.url = req.originalUrl;
  }
  next();
});

// Serve frontend static files directly from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes (supports both /api/* and direct /* rewrite)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Student Management API is running smoothly',
    timestamp: new Date()
  });
});

// Catch-all 404 for unhandled API routes (returns JSON, never crashes)
app.all(/\/api\/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// SPA Fallback: serve frontend index.html for all non-API paths
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler (converts all exceptions into safe JSON responses, preventing 500 crashes)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` Server is running on: http://localhost:${PORT}`);
    console.log(` Web UI available at:  http://localhost:${PORT}`);
    console.log(` API Base URL:         http://localhost:${PORT}/api`);
    console.log(`=================================================`);
  });
}

module.exports = app;
