import { useEnv, useEnvs } from "../util/env.js";

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

export { getDbConfig };
