import dotenv from "dotenv";

// Load .env file if it exists
dotenv.config();

/**
 * Get an environment variable with a fallback default.
 * @param {string} key - The environment variable name.
 * @param {*} defaultValue - The value to return if the variable is not set.
 * @returns {string | *} The environment variable value or the default.
 */
function useEnv(key, defaultValue = undefined) {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

/**
 * Get database configuration from environment or defaults.
 * Supports both full URI (DB_URI) and individual components (DB_HOST, DB_PORT, DB_NAME).
 * @returns {Object} Database config with host, port, name, and uri.
 */
function getDbConfig() {
  const dbUri = process.env.DB_URI;

  if (dbUri) {
    return {
      uri: dbUri,
      host: null,
      port: null,
      name: null,
    };
  }

  const host = useEnv("DB_HOST", "localhost");
  const port = parseInt(useEnv("DB_PORT", "27017"), 10);
  const name = useEnv("DB_NAME", "bagel");
  const uri = `mongodb://${host}:${port}/${name}`;

  return {
    uri,
    host,
    port,
    name,
  };
}

export { useEnv, getDbConfig };