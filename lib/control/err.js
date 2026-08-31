import { useErrorMessage } from "../util/err.js";
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

function errJson(res, err) {
  res.status(err.status).json({ ...err });
}

function errHtml(res, err) {
  res.status(err.status).render("error", { err });
}

export { createError, errJson, errHtml };
