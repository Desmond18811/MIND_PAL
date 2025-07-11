import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectToDatabase from './database/mongodb.mjs';
import authRoutes from './routes/auth.mjs';
import palScoreRouter from './routes/palScoreRoutes.mjs';
import meditationRouter from './routes/meditationRoutes.mjs';
import musicRouter from './routes/musicRoutes.mjs';
import mentalHealthRoutes from './routes/mentalHealth.mjs';
import { scheduleReminders } from './services/notificationService.mjs';
import goalRoutes from './routes/goalRoutes.mjs';
import stressRoutes from './routes/stressRoutes.mjs';
import notificationRoutes from './routes/notificationRoutes.mjs';
import utilityRoutes from './routes/utilityRoutes.mjs';
import resourcesRoutes from './routes/resourcesRoutes.mjs';
import sleepRoutes from './routes/sleepRoutes.mjs';
import searchRoutes from './routes/search.mjs';
import communityRoutes from './routes/community.mjs';
import moodRoutes from './routes/mood.mjs';
import journalRoutes from './routes/journal.mjs';
import chatbotRoutes from './routes/chatbot.mjs';
import helpRoutes from './routes/help.mjs';
import assessmentRoutes from './routes/assessmentRoutes.mjs';
import profileRoutes from './routes/profile.mjs';
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

// Initialize Arcjet
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
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

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MindPal API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    protected: process.env.ARCJET_KEY ? true : false
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
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`🛡️ Arcjet protection: ${process.env.ARCJET_KEY ? 'ENABLED' : 'DISABLED'}`);
  });
};

startServer();
