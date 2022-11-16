import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongoose } from 'mongoose';
import mongoose from 'mongoose';

declare let global: typeof globalThis & {
  cached: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
    mongod: MongoMemoryServer | null;
  };
};

type CachedType = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  mongod: MongoMemoryServer | null;
};

let cached: CachedType = global.cached;
if (!cached) {
  cached = global.cached = { conn: null, promise: null, mongod: null };
}

export async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  cached.mongod = await MongoMemoryServer.create();
  const uri: string = cached.mongod.getUri();

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function close() {
  if (cached.mongod) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await cached.mongod.stop();
    cached = { conn: null, mongod: null, promise: null };
  }
}

export async function clear() {
  if (cached.mongod && cached.conn) {
    const collections = cached.conn.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
}
