const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const scriptRoutes = require('./routes/scripts');
const { authenticateToken } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many auth attempts, please try again later.'
});
app.use('/api/auth/', authLimiter);

app.use(express.json({ limit: '1mb' }));

// Serve static files
app.use(express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/scripts', authenticateToken, scriptRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scripthub';

let mongoConnected = false;
let mongoServer = null;

const connectMongo = async (retries = 3) => {
  try {
    // Try to connect to real MongoDB first
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
      socketTimeoutMS: 2000,
    });
    mongoConnected = true;
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    if (retries > 0) {
      console.log(`⏳ MongoDB connection attempt failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return connectMongo(retries - 1);
    } else {
      // Use in-memory MongoDB for development/testing
      console.log('📦 Starting In-Memory MongoDB for development...');
      try {
        mongoServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoServer.getUri();
        await mongoose.connect(inMemoryUri);
        mongoConnected = true;
        console.log('✅ Connected to In-Memory MongoDB (Development Mode)');
        return true;
      } catch (memErr) {
        console.error('❌ Could not start In-Memory MongoDB:', memErr.message);
        console.log('⚠️  Running without database - features will be limited');
        return false;
      }
    }
  }
};

// Start server
connectMongo().then((connected) => {
  app.listen(PORT, () => {
    const mode = connected ? '✅ Database Connected' : '⚠️ No Database';
    console.log(`\n🚀 ScriptHub API running on http://localhost:${PORT} [${mode}]`);
    console.log(`📝 Frontend available at http://localhost:3000\n`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  process.exit(0);
});

module.exports = app;
