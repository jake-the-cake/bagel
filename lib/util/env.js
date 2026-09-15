import dotenv from "dotenv";
dotenv.config();

/** Fetch an environment variable value or return a default value. */
function useEnv(key, defaultValue = undefined) {
  const value = process.env[key];
  return value !== undefined ? value : defaultValue;
}

/** Fetch multiple environment variable values or return undefined for any that are not set. */
function useEnvs(...keys) {
  const values = {};
  keys.forEach((key) => {
    const value = useEnv(key, null);
    if (value) values[key] = value;
  });
  return values;
}

export { useEnv, useEnvs };
