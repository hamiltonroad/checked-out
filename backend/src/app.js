const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const { setCsrfCookie, verifyCsrf } = require('./middlewares/csrf');
const logger = require('./config/logger');
const corsOptions = require('./config/cors');

const app = express();

// Security middleware
app.use(helmet());

// CORS — origins configured via CORS_ORIGINS env var (see config/cors.js)
app.use(cors(corsOptions));

// Body parsing — 1MB global limit; add route-specific middleware for larger payloads (e.g., file uploads)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cookie parsing — required for JWT httpOnly cookies and CSRF double-submit
app.use(cookieParser());

// CSRF protection — set token cookie on all responses, verify on mutations
app.use(setCsrfCookie);
app.use(verifyCsrf);

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Health check routes: /health, /health/live, /health/ready
app.use('/health', healthRoutes);

// API routes
const routes = require('./routes');

app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
