import dotenv from "dotenv";
dotenv.config();

function useEnv(key, defaultValue = undefined) {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

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
