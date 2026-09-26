import { coloredCode } from "../util/codes.js";
import { useEnv } from "../util/env.js";

function checkIsApi(path) {
  return path.startsWith(useEnv("API_PATH"));
}

function checkIsCallback(callback) {
  return typeof callback === "function";
}

function callback(callback, ...params) {
  return () => callback(...params);
}

function callbackAsync(callback, ...params) {
  return async () => await callback(...params);
}

function formatTimestamp(date) {
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const meridiem = hours >= 12 ? "pm" : "am";
  const hour = hours % 12 || 12;
  return `\x1b[35m${day}${month.slice(0, 3)}${year}-${hour}:${minutes}:${seconds}${meridiem}\x1b[0m`;
}

function formatResponseLine({ method, path, ip, start }, status) {
  const date = new Date();
  const timestamp = formatTimestamp(date);
  return [
    timestamp,
    method,
    path,
    coloredCode(status),
    `(@ ${ip})`,
    start && `in ${Number(date) - start} ms`,
  ].join(" ");
}

export default {
  checkIsApi,
  checkIsCallback,
  callback,
  callbackAsync,
  formatResponseLine,
};
