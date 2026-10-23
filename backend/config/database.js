const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/web_backend';
  const enableInMemory = process.env.ENABLE_IN_MEMORY_DB === 'true';

  try {
    // Attempt connecting to the configured MongoDB URI with a fast timeout if in-memory fallback is enabled
    console.log(`[Database] Attempting connection to MongoDB: ${uri}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: enableInMemory ? 2500 : 5000,
      dbName: 'web_backend'
    });
    console.log(`[Database] Connected successfully to MongoDB (database: ${mongoose.connection.name})`);
    return mongoose.connection;
  } catch (primaryError) {
    if (enableInMemory) {
      console.warn(`[Database] Could not connect to primary MongoDB (${primaryError.message}).`);
      console.log('[Database] Starting embedded in-memory MongoDB instance for development/testing...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create({
          instance: {
            dbName: 'web_backend'
          }
        });
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri, {
          dbName: 'web_backend'
        });
        console.log(`[Database] Connected to in-memory MongoDB instance: ${memoryUri}`);
        return mongoose.connection;
      } catch (memError) {
        console.error('[Database] Failed to start in-memory MongoDB:', memError.message);
        throw memError;
      }
    } else {
      console.error(`[Database] MongoDB connection error: ${primaryError.message}`);
      throw primaryError;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error('[Database] Error while disconnecting:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
