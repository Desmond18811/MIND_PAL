import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectToDatabase from './database/mongodb.mjs'; // Adjust the import path as needed
import authRoutes from './routes/auth.mjs';
import userRoutes from './routes/user.mjs';
import mentalHealthRoutes from './routes/mentalHealth.mjs';
import resourcesRoutes from './routes/resources.mjs';
import sleepRoutes from './routes/sleep.mjs';
import searchRoutes from './routes/search.mjs';
import communityRoutes from './routes/community.mjs';
import moodRoutes from './routes/mood.mjs';
import stressRoutes from './routes/stress.mjs';
import journalRoutes from './routes/journal.mjs';
import chatbotRoutes from './routes/chatbot.mjs';
import notificationRoutes from './routes/notifications.mjs';
import helpRoutes from './routes/help.mjs';


// Load environment variables
dotenv.config();

// Validate required environment variable
if (!process.env.DB_URI) {
  console.error('Error: DB_URI is not defined in .env.development.local');
  process.exit(1);
}

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

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'MindPal API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes); // Authentication routes (e.g., login, register)
//app.use('/api/user', userRoutes); // User profile routes
app.use('/api/mental-health', mentalHealthRoutes); // Mental health score routes
app.use('/api/resources', resourcesRoutes); // Resource routes (some public)
app.use('/api/sleep', sleepRoutes); // Sleep quality routes
app.use('/api/search', searchRoutes); // Search routes (some public)
app.use('/api/community', communityRoutes); // Community post routes
app.use('/api/mood', moodRoutes); // Mood tracking routes
app.use('/api/stress', stressRoutes); // Stress management routes
app.use('/api/journal', journalRoutes); // Journal entry routes
app.use('/api/chatbot', chatbotRoutes); // Chatbot session routes
app.use('/api/notifications', notificationRoutes); // Notification routes
app.use('/api/help', helpRoutes); // Help center routes (some public)



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
  });
};

startServer();
