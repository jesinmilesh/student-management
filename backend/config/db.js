const mongoose = require('mongoose');
const dns = require('dns');

// Fix DNS SRV lookup issues for MongoDB Atlas on Windows & cloud environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  // 1 = connected: reuse existing connection in serverless warm container
  if (mongoose.connection.readyState === 1) {
    return;
  }

  // 2 = connecting: wait for current connection attempt to complete
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve) => mongoose.connection.once('connected', resolve));
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb+srv://jesinmilesh:JesinBackend123@cluster0.1hmtgyn.mongodb.net/web_backend?retryWrites=true&w=majority&appName=Cluster0';
  const enableInMemory = process.env.ENABLE_IN_MEMORY_DB === 'true';

  try {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[Database] Connecting to MongoDB: ${maskedUri}`);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: enableInMemory ? 6000 : 10000
    });
    console.log('[Database] MongoDB Atlas connected successfully!');
  } catch (error) {
    console.warn(`[Database] MongoDB connection issue: ${error.message}`);
    if (enableInMemory) {
      console.log('[Database] Falling back to in-memory MongoDB for uninterrupted operation...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`[Database] In-memory MongoDB connected: ${memoryUri}`);
      } catch (memErr) {
        console.error('[Database] In-memory fallback error:', memErr.message);
      }
    } else {
      console.error('[Database] Failed to connect to MongoDB. Check MONGODB_URI in environment variables.');
    }
  }
};

module.exports = connectDB;
