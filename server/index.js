require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const winston = require('winston');
const { schedulePriceUpdates } = require('./utils/cron');

// Debug environment variables
console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('AZURE_SUBSCRIPTION_ID:', process.env.AZURE_SUBSCRIPTION_ID);
console.log('AZURE_TENANT_ID:', process.env.AZURE_TENANT_ID);
console.log('AZURE_CLIENT_ID:', process.env.AZURE_CLIENT_ID);
console.log('AZURE_CLIENT_SECRET:', process.env.AZURE_CLIENT_SECRET ? 'Set' : 'Not set');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('GOOGLE_PROJECT_ID:', process.env.GOOGLE_PROJECT_ID);
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Initialize Express app
const app = express();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100
});
app.use(limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
const pricingRoutes = require('./routes/pricing');
const comparisonRoutes = require('./routes/comparison');
const providerRoutes = require('./routes/providers');

app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/comparison', comparisonRoutes);
app.use('/api/v1/providers', providerRoutes);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'success', message: 'Server is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Schedule price updates
try {
  schedulePriceUpdates();
} catch (error) {
  logger.error('Failed to schedule price updates:', error);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});