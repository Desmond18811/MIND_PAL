import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectToDatabase from './database/mongodb.js';
import { initializeSocketHandlers } from './handlers/socketHandlers.js';
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
import communityRoutes from './routes/community.js';
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
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { isSpoofedBot } from "@arcjet/inspect";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DB_URI) {
  console.error('Error: DB_URI is not defined in .env.development.local');
  process.exit(1);
}

if (!process.env.ARCJET_KEY) {
  console.warn('Warning: ARCJET_KEY is not defined. Arcjet protection will be disabled');
}

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not defined. Serenity AI will use mock responses');
}

// Initialize Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "DRY_RUN", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        "PostmanRuntime"
        // Uncomment to allow these other common bot categories
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
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

// Arcjet protection middleware
const protectWithArcjet = async (req, res, next) => {
  if (!process.env.ARCJET_KEY) {
    return next(); // Skip protection if Arcjet is not configured
  }

  const decision = await aj.protect(req, { requested: 1 }); // Deduct 1 token per request
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return res.status(429).json({ error: "Too Many Requests" });
    } else if (decision.reason.isBot()) {
      return res.status(403).json({ error: "No bots allowed" });
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }
  } else if (decision.results.some(isSpoofedBot)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
};

// Apply Arcjet protection to all routes
app.use(protectWithArcjet);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MindPal API is running',
    version: '1.0.0',
    features: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      protected: process.env.ARCJET_KEY ? true : false,
      serenityAI: process.env.OPENAI_API_KEY ? 'enabled' : 'mock-mode',
      socketIO: 'enabled'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
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

  // Initialize Socket.io handlers for Serenity
  initializeSocketHandlers(io);

  // Start server with Socket.io support
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`🛡️ Arcjet protection: ${process.env.ARCJET_KEY ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🧠 Serenity AI: ${process.env.OPENAI_API_KEY ? 'ENABLED' : 'MOCK MODE'}`);
    console.log(`🔌 Socket.io: ENABLED`);
  });
};

startServer();

export { app, io };
