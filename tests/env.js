import assert from "node:assert/strict";
import { useEnv } from "../lib/util/env.js";
import { getDbConfig } from "../lib/data/config.js";

const originalPort = process.env.PORT;
const originalPgUri = process.env.PG_URI;

try {
  delete process.env.PORT;
  delete process.env.PG_URI;
  delete process.env.PG_DATABASE;
  delete process.env.PG_HOST;
  delete process.env.PG_PORT;

  assert.equal(useEnv("PORT", 3000), 3000);
  assert.equal(useEnv("PG_HOST", "localhost"), "localhost");

  const dbConfig = getDbConfig();
  assert.equal(dbConfig.host, "localhost");
  assert.equal(dbConfig.port, 5432);
  assert.equal(dbConfig.database, "bagel");

  console.log("env utility fallback checks passed");
} finally {
  if (originalPort === undefined) {
    delete process.env.PORT;
  } else {
    process.env.PORT = originalPort;
  }

  if (originalPgUri === undefined) {
    delete process.env.PG_URI;
  } else {
    process.env.PG_URI = originalDbUri;
  }
}
