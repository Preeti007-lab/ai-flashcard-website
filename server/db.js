import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://preetirevankar753_db_user:AF22N1YUc7g6H1l8@cluster0.l6d2lr9.mongodb.net/papercard-ai?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in .env file');
}

/**
 * Global cache across hot reloads in Node.js
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB Atlas via Mongoose
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 15000,
    };

    console.log('[MongoDB] Connecting to Atlas cluster...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('[MongoDB] Successfully connected to MongoDB Atlas!');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('[MongoDB] Connection error:', e);
    throw e;
  }

  return cached.conn;
}

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('[MongoDB] Mongoose connection opened');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Mongoose connection disconnected');
});

export default connectDB;
