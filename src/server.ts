import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database';
import { errorHandler, notFound } from './middleware/error';
import cronJobs from './services/cronJobs';

// Load env vars
dotenv.config();

// Initialize app
const app: Application = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration MUST come before helmet for preflight requests
// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://dairy-management-frontend-production.up.railway.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🔐 CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('✅ CORS: Allowing request with no origin');
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log(`✅ CORS: Allowing origin: ${origin}`);
        callback(null, true);
      } else {
        // In production, log rejected origins for debugging
        console.log(`⚠️  CORS blocked origin: ${origin}`);
        console.log(`   Allowed origins:`, allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

// Security middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression
app.use(compression());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

// Health check endpoints FIRST (before DB connection)
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    environment: process.env.NODE_ENV || 'production',
    version: process.env.API_VERSION || 'v1',
    timestamp: new Date().toISOString(),
  });
});

// Home route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dairy Management System API',
    version: process.env.API_VERSION || 'v1',
    documentation: '/api-docs',
  });
});

// Import routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import clientRoutes from './routes/clientRoutes';
import orderRoutes from './routes/orderRoutes';
import batchRoutes from './routes/batchRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Mount routes
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, authRoutes);
app.use(`/api/${apiVersion}/products`, productRoutes);
app.use(`/api/${apiVersion}/clients`, clientRoutes);
app.use(`/api/${apiVersion}/orders`, orderRoutes);
app.use(`/api/${apiVersion}/batches`, batchRoutes);
app.use(`/api/${apiVersion}/invoices`, invoiceRoutes);
app.use(`/api/${apiVersion}`, dashboardRoutes);

// Error handler
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   🥛 Dairy Management System API      ║
  ║   Server running on port ${PORT}        ║
  ║   Environment: ${process.env.NODE_ENV || 'production'}           ║
  ╚════════════════════════════════════════╝
  `);
  
  // Connect to database (non-blocking)
  connectDB()
    .then(() => {
      console.log('✅ Database connected successfully');
      
      // Start cron jobs for automated notifications (optional)
      // Email notifications will only work if email service is configured
      if (process.env.CRON_ENABLED === 'true') {
        try {
          cronJobs.startAllCronJobs();
          console.log('✅ Cron jobs started (email notifications enabled)');
        } catch (err: any) {
          console.error('⚠️  Cron jobs failed to start:', err.message);
        }
      } else {
        console.log('⏸️  Cron jobs disabled (set CRON_ENABLED=true to enable)');
      }
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      console.log('⚠️  Server will continue running without database');
      console.log('⚠️  Please check your database configuration');
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  // Don't crash the server, just log the error
  console.log('⚠️  Server continues running');
});

// Handle SIGTERM gracefully
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  try {
    cronJobs.stopAllCronJobs();
  } catch (err) {
    console.error('Error stopping cron jobs:', err);
  }
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  try {
    cronJobs.stopAllCronJobs();
  } catch (err) {
    console.error('Error stopping cron jobs:', err);
  }
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

export default app;
