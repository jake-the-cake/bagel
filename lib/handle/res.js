import { useBaseClass } from "../core/base.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { errorUtil } from "../util/index.js";
import functions from "./functions.js";

class Res extends useBaseClass() {
  constructor(context) {
    super(context, initResponse);
  }

  // INITIALIZE

  init() {
    this.resOut.Json = (status, data) => this.json(status, data);
    this.resOut.Html = (template, data) => this.html(template, data);
  }

  // RESPONSE

  response(response) {
    if (this.details?.body?.password) this.details.body.password = "****";
    return {
      ...response,
      ok: this.context.health.isOk,
      status: this.resOut.statusCode || DEFAULT_STATUS,
      elapsed: `${Date.now() - this.details.start} ms`,
      req: this.details,
    };
  }

  strip() {}

  // RESPONDERS

  json(status, data) {
    !this.dead && this.send(() => this.end({ ...data, status }));
  }

  html(template, data = {}) {
    !this.dead &&
      this.send(() =>
        this.end({ status: this.errors.status || 200, template, data }),
      );
  }

  // ERROR HANDLING

  error() {
    const errors = this.context.health.errors;
    const error =
      typeof errors === "object" && errors?.status
        ? errors
        : errorUtil.defaultError(500);
    this.end({
      status: error.status,
      template: "error",
      error,
    });
  }

  // EXECUTE

  send(callback) {
    try {
      !functions.checkIsCallback(callback) &&
        this.kill(errorUtil.useError("notCallback500"));
      if (!this.ok) return this.error();
      callback();
    } catch (error) {
      this.end(error);
    }
  }

  // OUTPUT

  out(status) {
    return this.resOut.status(status);
  }

  end({
    status = DEFAULT_STATUS,
    template = "error",
    data = null,
    error = null,
  }) {
    this.isApi
      ? this.out(status).json(this.response({ data, error }))
      : this.out(status).render(template, data);
    console.log(this.context.responseLine(status));
  }
}

function initResponse(context) {
  return new Res(context);
}

export { initResponse };
