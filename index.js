import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';
import connectToDatabase from './database/mongodb.js';
import { initializeSocketHandlers } from './handlers/socketHandlers.js';
import { initializeCronJobs } from './jobs/cronJobs.js';
import { initializeScraperService } from './services/scraperService.js';
import authRoutes from './routes/auth.js';
import palScoreRouter from './routes/palScoreRoutes.js';
import meditationRouter from './routes/meditationRoutes.js';
import musicRouter from './routes/musicRoutes.js';
import mentalHealthRoutes from './routes/mentalHealth.js';
import { scheduleReminders } from './services/notificationService.js';
import goalRoutes from './routes/goalRoutes.js';
import stressRoutes from './routes/stressRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import utilityRoutes from './routes/utilityRoutes.js';
import resourcesRoutes from './routes/resourcesRoutes.js';
import sleepRoutes from './routes/sleepRoutes.js';
import searchRoutes from './routes/search.js';
import communityRoutes from './routes/communityRoutes.js';
import moodRoutes from './routes/mood.js';
import journalRoutes from './routes/journal.js';
import chatbotRoutes from './routes/chatbot.js';
import helpRoutes from './routes/help.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import profileRoutes from './routes/profile.js';
import therapistRoutes from './routes/therapistRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import serenityRoutes from './routes/serenityRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DB_URI) {
  console.error('Error: DB_URI is not defined in .env.development.local');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not defined. Serenity AI will use mock responses');
}

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 min
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later.'
  }
});

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io with CORS for mobile app
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(express.json());

// Enhanced MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    // Retry after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to DB');
});

mongoose.connection.on('disconnected', () => {
  console.log('🔴 Mongoose disconnected');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

// Apply rate limiting to all routes
app.use(limiter);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MindPal API is running',
    version: '1.0.0',
    features: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      rateLimit: 'enabled',
      serenityAI: process.env.OPENAI_API_KEY ? 'enabled' : 'mock-mode',
      socketIO: 'enabled'
    }
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/freud-score', palScoreRouter);
app.use('/api/journal', journalRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/meditation', meditationRouter);
app.use('/api/music', musicRouter);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stress', stressRoutes);
app.use('/api/utility', utilityRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/sleep', sleepRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/appointments', appointmentRoutes);

// Serenity AI Routes
app.use('/api/serenity', serenityRoutes);
app.use('/api/voice', voiceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found'
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

const startServer = async () => {
  await connectToDatabase();

  // Initialize background services
  initializeSocketHandlers(io);
  initializeCronJobs();
  initializeScraperService();

  // Start server with Socket.io support
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`🛡️ Rate limiting: ENABLED`);
    console.log(`🧠 Serenity AI: ${process.env.OPENAI_API_KEY ? 'ENABLED' : 'MOCK MODE'}`);
    console.log(`🔌 Socket.io: ENABLED`);
  });
};

startServer();

export { app, io };
