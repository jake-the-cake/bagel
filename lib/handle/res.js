import { useBaseClass } from "../core/base.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { errorUtil } from "../util/index.js";

class Res extends useBaseClass() {
  constructor(context) {
    super(context, initResponse);
  }

  init() {
    this.flags = [];
    this.resOut.Flag = (flag) => this.flag(flag);
    this.resOut.Kill = (error = null) => this.kill(error);
    this.resOut.Json = (status, data) => this.json(status, data);
    this.resOut.Html = (template, data) => this.html(template, data);
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
    error && this.flag(errorUtil.createError(error.status, error.message));
    this.error(this.compileErrors());
  }

  // EXECUTIONS

  run(callback) {
    try {
      this.checkIsCallback(callback);
      if (this.flags.length > 0) return this.kill();
      callback();
    } catch (error) {
      console.log(error);
      this.end(error);
    }
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
