import { useBaseClass } from "../core/base.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { errorUtil } from "../util/index.js";
import functions from "./functions.js";

class Res extends useBaseClass() {
  constructor(context) {
    super(context, initResponse);
    this.sent = false;
  }

  init() {
    this.resOut.Json = (status, data) => this.json(status, data);
    this.resOut.Html = (template, data) => this.html(template, data);
  }

  // RESPONDERS

  json(status, data) {
    this.send(() => this.end({ status, data }));
  }

  html(template, data = {}) {
    this.send(() =>
      this.end({ status: this.errors.status || 200, template, data }),
    );
  }

  // ERROR HANDLING

  get errors() {
    return this.context.health.errors;
  }

  error() {
    const error =
      typeof this.errors === "object" && this.errors?.status
        ? this.errors
        : errorUtil.defaultError(500);
    this.end({
      status: error.status,
      template: "error",
      data: error,
    });
  }

  // EXECUTIONS

  send(callback) {
    try {
      !functions.checkIsCallback(callback) &&
        this.kill(errorUtil.useError("notCallback500"));
      if (!this.context.health.isOk) return this.error();
      callback();
    } catch (error) {
      this.end(error);
    }
  }

  out(status) {
    return this.resOut.status(status);
  }

  end({ status = DEFAULT_STATUS, template = "error", data = null }) {
    this.isApi
      ? this.out(status).json(data)
      : this.out(status).render(template, data);
    console.log(this.context.responseLine(status));
  }
}

function initResponse(context) {
  return new Res(context);
}

export { initResponse };
