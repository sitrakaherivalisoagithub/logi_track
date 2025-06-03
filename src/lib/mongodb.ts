import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable inside .env');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

export { clientPromise };

// --- Mongoose Connection ---
import mongoose from 'mongoose';

// Re-use MONGODB_URI from above, assuming it's the same for Mongoose
// const MONGODB_URI_MONGOOSE = process.env.MONGODB_URI; // Already defined as 'uri'

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectMongoose() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    if (!uri) { // uri is const MONGODB_URI from the top of the file
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }
    cached.promise = mongoose.connect(uri, {
      // bufferCommands: false, // Consider this if issues persist
    }).then((mongooseInstance) => {
      console.log("Mongoose connected.");
      return mongooseInstance;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
