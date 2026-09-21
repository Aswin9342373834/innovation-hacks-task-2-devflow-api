const mongoose = require('mongoose');
const dns = require('dns');

// Configure public DNS servers for Atlas SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  /* ignore DNS override errors in environments with strict permissions */
}

/**
 * Connect to MongoDB Atlas / local MongoDB instance
 * @param {string} [customUri] Optional connection URI override (used in tests)
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'Database connection error: MONGODB_URI environment variable is not defined.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Sanitize connection URI for logging (mask credentials)
  const sanitizedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    });

    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB (${sanitizedUri}): ${error.message}`);
    throw error;
  }
};

/**
 * Disconnect from MongoDB cleanly
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Database] MongoDB disconnected cleanly.');
    }
  } catch (error) {
    console.error('[Database Error] Error during MongoDB disconnection:', error.message);
  }
};

/**
 * Get current database connection status
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 * @returns {'connected'|'connecting'|'disconnecting'|'disconnected'}
 */
const getConnectionStatus = () => {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus
};
