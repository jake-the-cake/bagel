import { MongoClient } from "mongodb";
import { getDbConfig } from "../util/env.js";

let mongoClient = null;
let dbConnection = null;

/**
 * Connect to MongoDB using environment configuration.
 * @returns {Promise<Object>} The connected database object.
 */
async function connectDb() {
  if (dbConnection) {
    return dbConnection;
  }

  const { uri } = getDbConfig();

  mongoClient = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
  });

  await mongoClient.connect();
  dbConnection = mongoClient.db();

  console.log(`Connected to database at ${uri}`);
  return dbConnection;
}

/**
 * Get the current database connection.
 * Returns null if not yet connected.
 * @returns {Object | null} The database connection or null.
 */
function getDb() {
  return dbConnection;
}

/**
 * Disconnect from MongoDB.
 * @returns {Promise<void>}
 */
async function disconnectDb() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    dbConnection = null;
    console.log("Disconnected from database");
  }
}

export { connectDb, getDb, disconnectDb };
