import { STATUS_CODES, DEFAULT_STATUS } from "../util/codes.js";

const ERRORS = {
  general404: [404, "There are no files or endpoints found at this URL."],
  general405: [405, "The requested method is not allowed."],
  getOnlyApp405: [405, "This application only accepts 'GET' requests."],
  default: [500, "An error occurred while processing your request."],
};

const ERROR_FUNCTIONS = {
  init500: (module) => [500, `Could not initialize '${module}'`],
};

class Err {
  constructor(status, message = null) {
    this.status = this.validateStatus(status);
    this.label = STATUS_CODES[this.status] || "Unknown Error";
    this.message = message || useError("default").message;
  }

  validateStatus(status) {
    return typeof status !== "number" || !STATUS_CODES[status]
      ? DEFAULT_STATUS
      : status;
  }

  get object() {
    return {
      status: this.status,
      label: this.label,
      message: this.message,
    };
  }
}

function createError(status, message = null) {
  return new Err(status, message).object;
}

function defaultError(status) {
  return createError(
    Number(status) === "NaN" ? DEFAULT_STATUS : Number(status),
  );
}

function useError(key) {
  return createError(...(ERRORS[key] || ERRORS["default"]));
}

function useErrorFunction(key, ...params) {
  const error = ERROR_FUNCTIONS[key] || null(...params);
  return createError(...(error ? error(...params) : ERRORS["default"]));
}

export default {
  createError,
  defaultError,
  useError,
  useErrorFunction,
};
