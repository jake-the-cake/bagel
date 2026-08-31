const DEFAULT_STATUS = 500;
const STATUS_CODES = {
  // 1xx Informational
  100: "Continue",
  101: "Switching Protocols",

  // 2xx Success
  200: "OK",
  201: "Created",
  202: "Accepted",
  204: "No Content",

  // 3xx Redirection
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  304: "Not Modified",
  307: "Temporary Redirect",

  // 4xx Client Error
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  422: "Unprocessable Entity",
  429: "Too Many Requests",

  // 5xx Server Error
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
};

function coloredCode(status) {
  const color =
    status >= 200 && status < 300
      ? "\x1b[32m" // green
      : status >= 300 && status < 400
        ? "\x1b[36m" // cyan
        : status >= 400 && status < 500
          ? "\x1b[33m" // yellow
          : status >= 500
            ? "\x1b[31m" // red
            : "\x1b[0m";
  return `${color}${status}\x1b[0m`;
}

export { STATUS_CODES, DEFAULT_STATUS, coloredCode };
