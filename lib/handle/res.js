import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";
import { useError } from "../util/err.js";
import { handle } from "./index.js";

class Res {
  constructor(req, res) {
    this.method = req.method;
    this.path = req.path;
    this.ip = req.ip;
    this.res = res;
    this.flags = [];
  }

  // RESPONSE TYPES

  json(status, data) {
    this.run(() => this.res.status(status).json(data));
  }

  html(template, data = {}) {
    this.run(() =>
      this.res.status(data.err?.status ?? 200).render(template, data),
    );
  }

  // RESPONDERS

  error(err) {
    this.flags = [];
    if (this.res.isApi) {
      this.json(err.status, { error: err });
    } else {
      this.html("error", { err: err });
    }
  }

  run(callback) {
    if (this.flags.length > 0) return this.error(this.flags[0]);
    try {
      callback();
      this.end();
    } catch (err) {
      this.error(handle.createError(500, err.message));
    }
  }

  end() {
    console.log(
      new Date(),
      this.method,
      this.path,
      coloredCode(this.res.statusCode || DEFAULT_STATUS),
      `(${this.ip})`,
    );
  }

  // FLAGGING

  flag(flag) {
    flag = this.verifyFlag(flag);
    this.flags.push(flag);
  }

  verifyFlag(flag) {
    return typeof flag !== "object" ||
      !flag.status ||
      !flag.message ||
      !flag.error
      ? useError("default")
      : flag;
  }

  // OTHER

  /** Function to trigger an error response,
   * using the first flagged error as default
   * and a newly created error if there are
   * no flags yet */
  kill(err) {
    this.error([...this.flags, handle.createError(err.status, err.message)][0]);
  }
}

// FUNCTIONS

/** Create A New Response */
function newResponse(req, res) {
  return new Res(req, res);
}

// EXPORTS

export { newResponse };
