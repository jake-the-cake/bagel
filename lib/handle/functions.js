import { useEnv } from "../util/env.js";

function checkIsApi(path) {
  return path.startsWith(useEnv("API_PATH"));
}

function checkIsCallback(callback) {
  return typeof callback === "function";
}

export { checkIsApi, checkIsCallback };
