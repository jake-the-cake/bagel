import { getDbConfig } from "../lib/util/env.js";

// Test database config building
const config = getDbConfig();

console.log("Database Configuration:");
console.log(`  URI: ${config.uri}`);
console.log(`  Host: ${config.host}`);
console.log(`  Port: ${config.port}`);
console.log(`  Name: ${config.name}`);

// Test with DB_URI override
process.env.DB_URI = "mongodb+srv://user:pass@cluster.mongodb.net/mydb";
const overrideConfig = getDbConfig();
console.log("\nWith DB_URI override:");
console.log(`  URI: ${overrideConfig.uri}`);
console.log(`  Host: ${overrideConfig.host} (null when using full URI)`);
