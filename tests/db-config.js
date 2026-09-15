import { getDbConfig } from "../lib/data/config.js";

// Test database config building
const config = getDbConfig();

console.log("Database Configuration:");
console.log(`  URI: ${config.uri}`);
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Database: ${config.database}`);

// Test with PG_URI override
process.env.PG_URI = "postgresql://user:pass@localhost/mydb";
const overrideConfig = getDbConfig();
console.log("\nWith PG_URI override:");
console.log(`  URI: ${overrideConfig.uri}`);
console.log(`  Host: ${overrideConfig.host} (null when using full URI)`);
