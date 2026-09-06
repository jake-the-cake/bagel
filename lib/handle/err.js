import { useError, useErrorMessage } from "../util/err.js";
import { STATUS_CODES, DEFAULT_STATUS } from "../util/codes.js";

class Err {
  constructor(status, message = null) {
    this.status = this.validateStatus(status);
    this.error = STATUS_CODES[this.status] || "Unknown Error";
    this.message = message || useErrorMessage("default");
  }

  validateStatus(status) {
    return typeof status !== "number" || !STATUS_CODES[status]
      ? DEFAULT_STATUS
      : status;
  }

  get object() {
    return {
      status: this.status,
      error: this.error,
      message: this.message,
    };
  }
}

function createError(status, message = null) {
  return new Err(status, message).object;
}

function handleError(status) {
  status = Number(status);
  return handle.createError(status === "NaN" ? DEFAULT_STATUS : status);
}

function errorMiddleware405(req, res, next) {
  req.method !== "GET" &&
    !req.path.startsWith(API_PATH) &&
    res.out.error(useError("getOnly405"));
  next();
}

function errorMiddleware404(req, res, next) {
  res.out.error(useError("general404"));
}

export { createError, handleError, errorMiddleware404, errorMiddleware405 };
