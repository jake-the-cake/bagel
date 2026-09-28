import pg from "pg";
import { useEnv, useEnvs } from "../util/env.js";
import { migrate } from "./migrate.js";

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
  migrate(dbConnection);
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

function getDbConfig() {
  const connectionString = useEnv("PG_URI", useEnv("DATABASE_URL", null));

  if (connectionString) {
    return {
      connectionString,
      uri: connectionString,
      host: null,
      port: null,
      name: null,
      user: null,
      password: null,
    };
  }

  const envs = useEnvs(
    "PG_HOST",
    "PG_PORT",
    "PG_DATABASE",
    "PG_USER",
    "PG_PASSWORD",
  );

  return {
    host: envs.PG_HOST ?? "localhost",
    port: Number(envs.PG_PORT ?? 5432),
    database: envs.PG_DATABASE ?? "dev",
    user: envs.PG_USER ?? undefined,
    password: envs.PG_PASSWORD ?? undefined,
  };
}
export { connectDb, getDb, disconnectDb };
