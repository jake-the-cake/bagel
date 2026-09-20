import { useBaseClass } from "../core/base.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { errorUtil } from "../util/index.js";

class Res extends useBaseClass() {
  constructor(context) {
    super(context, initResponse);
  }

  init() {
    this.flags = [];
    this.failed = false;
  }

  // RESPONDERS

  out(status) {
    return this.resOut.status(status);
  }

  end({ status = DEFAULT_STATUS, template = "error", data = null }) {
    this.isApi
      ? this.out(status).json(data)
      : this.out(200).render(template, data);
    this.printResponseLine(status);
  }

  json(status, data) {
    this.run(() => this.end({ status, data }));
  }

  html(template, data = {}) {
    this.run(() => this.end({ status: 200, template, data }));
  }

  // ERROR HANDLING

  error(error) {
    this.flags = [];
    this.isApi
      ? this.json(error.status, { error })
      : this.html("error", { error });
  }

  kill(error = null) {
    if (!this.failed) this.failed = true;
    error && this.flag(errorUtil.createError(error.status, error.message));
    this.error(this.compileErrors());
  }

  andThen(error, next) {
    if (!error.then) {
      error.then = { ...next };
      return;
    }
    this.andThen(error.then, next);
  }

  stackErrors(length) {
    const error = { ...this.flags[0] };
    if (length > 1) {
      for (let i = 1; i < length; i++) {
        this.andThen(error, this.flags[i]);
      }
    }
    return error;
  }

  compileErrors() {
    const length = this.flags.length || 0;
    return length === 0
      ? errorUtil.createError(DEFAULT_STATUS, "No errors to compile.")
      : this.stackErrors(length);
  }

  // EXECUTIONS

  run(callback) {
    this.checkIsCallback(callback);
    if (this.flags.length > 0) return this.kill();
    try {
      callback();
    } catch (error) {
      console.log(error);
      this.end(error);
    }
  }

  // FLAGGING

  flag(flag) {
    console.log("flag", flag);
    flag = this.verifyFlag(flag);
    this.flags.push(flag);
  }

  verifyFlag(flag) {
    return this.isValidFlag(flag) ? flag : errorUtil.useError("default");
  }

  isValidFlag(flag) {
    return (
      typeof flag === "object" &&
      this.hasAllProps(flag, "status", "label", "message")
    );
  }

  hasAllProps(object, ...props) {
    return props.every((prop) => object[prop]);
  }

  // LOG

  printResponseLine(status) {
    console.log(...this.context.responseLine(status));
  }
}

// FUNCTIONS

/** Create A New Response */
function initResponse(context) {
  return new Res(context);
}

// EXPORTS

export { initResponse };
