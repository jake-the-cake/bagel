import { useBaseClass } from "../core/base.js";
import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";
import { errorUtil } from "../util/index.js";

class Res extends useBaseClass() {
  constructor(res, context) {
    super(context);
    this.flags = [];
    this.resOut = res;
  }

  // RESPONDERS

  json(status, data) {
    this.run(() => this.resOut.status(status).json(data));
  }

  html(template, data = {}) {
    this.run(() => this.resOut.status(200).render(template, data));
  }

  // ERROR HANDLING

  error(error) {
    console.log("error", error);
    this.flags = [];
    if (this.isApi) {
      this.json(error.status, { error });
    } else {
      this.html("error", { error });
    }
  }

  kill(error = null) {
    console.log("kill", error);
    if (error) this.flag(errorUtil.createError(error.status, error.message));
    this.error(this.compileErrors());
  }

  andThen(error, next) {
    if (!error.then) {
      error.then = { ...next };
      return;
    }
    this.andThen(error.then, next);
  }

  compileErrors() {
    const length = this.flags.length || 0;
    if (length === 0)
      return errorUtil.createError(DEFAULT_STATUS, "No errors to compile.");
    const error = { ...this.flags[0] };
    if (length > 1) {
      for (let i = 1; i < length; i++) {
        this.andThen(error, this.flags[i]);
      }
    }
    return error;
  }

  // EXECUTIONS

  run(callback) {
    console.log("run", callback);
    if (this.flags.length > 0) return this.kill();
    try {
      callback();
      this.end();
    } catch (err) {
      this.error(errorUtil.createError(500, err.message));
    }
  }

  end() {
    const { start, method, path, ip } = this.context.details;
    const elapsed = Number(new Date()) - start;
    console.log(
      new Date(),
      method,
      path,
      coloredCode(this.res.statusCode || DEFAULT_STATUS),
      `(${ip})`,
      `in ${elapsed} ms`,
    );
  }

  // FLAGGING

  flag(flag) {
    console.log("flag", flag);
    flag = this.verifyFlag(flag);
    this.flags.unshift(flag);
  }

  verifyFlag(flag) {
    return typeof flag !== "object" ||
      !flag.status ||
      !flag.message ||
      !flag.label
      ? errorUtil.useError("default")
      : flag;
  }
}

// FUNCTIONS

/** Create A New Response */
function initResponse(res, context) {
  return new Res(res, context);
}

// EXPORTS

export { initResponse };
