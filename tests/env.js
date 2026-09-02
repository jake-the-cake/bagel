import assert from "node:assert/strict";
import { useEnv, getDbConfig } from "../lib/util/env.js";

const originalPort = process.env.PORT;
const originalDbUri = process.env.DB_URI;

try {
  delete process.env.PORT;
  delete process.env.DB_URI;
  delete process.env.DB_NAME;
  delete process.env.DB_HOST;
  delete process.env.DB_PORT;

  assert.equal(useEnv("PORT", 3000), 3000);
  assert.equal(useEnv("DB_HOST", "localhost"), "localhost");

  const dbConfig = getDbConfig();
  assert.equal(dbConfig.host, "localhost");
  assert.equal(dbConfig.port, 27017);
  assert.equal(dbConfig.name, "bagel");
  assert.equal(dbConfig.uri, "mongodb://localhost:27017/bagel");

  console.log("env utility fallback checks passed");
} finally {
  if (originalPort === undefined) {
    delete process.env.PORT;
  } else {
    process.env.PORT = originalPort;
  }

  if (originalDbUri === undefined) {
    delete process.env.DB_URI;
  } else {
    process.env.DB_URI = originalDbUri;
  }
}
