import pg from "pg";
import { getDbConfig } from "./config.js";
import { getTables } from "./schema/index.js";

const { Pool } = pg;
let pool = null;
let dbConnection = null;

async function connectDb() {
  if (dbConnection) {
    return dbConnection;
  }

  const config = getDbConfig();
  pool = new Pool(
    config.connectionString
      ? {
          connectionString: config.connectionString,
          connectionTimeoutMillis: 10000,
        }
      : { ...config, connectionTimeoutMillis: 10000 },
  );

  const client = await pool.connect();
  client.release();
  dbConnection = pool;

  console.log("Database connected successfully");
  return dbConnection;
}

function getDb() {
  return dbConnection;
}

async function disconnectDb() {
  if (pool) {
    await pool.end();
    pool = null;
    dbConnection = null;
    console.log("Disconnected from database");
  }
}

async function migrateDb() {
  const db = getDb();
  getTables("all").forEach(async (table) => {
    await db.query(`DROP TABLE IF EXISTS ${table}`);
    await db.query(
      `CREATE TABLE IF NOT EXISTS ${table} (id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(50))`,
    );
  });
}

export { connectDb, getDb, disconnectDb, migrateDb };
