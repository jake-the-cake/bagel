import { coloredCode, DEFAULT_STATUS } from "../util/codes.js";
import { useError, useErrorMessage } from "../util/err.js";
import { createError, errHtml, errJson } from "./err.js";

class Res {
  constructor(req, res) {
    this.method = req.method;
    this.path = req.path;
    this.ip = req.ip;
    this.res = res;
  }

  error(err) {
    this.res.isApi ? this.json(err.status, err) : this.html("error", { err });
  }

  json(status, data) {
    this.run(() => this.res.status(status).json(data));
  }

  html(path, data = {}) {
    this.run(() => this.res.status(data.err?.status ?? 200).render(path, data));
  }

  run(callback) {
    try {
      callback();
      this.end();
    } catch (err) {
      this.kill(err);
    }
  }

  end() {
    console.log(
      new Date(),
      this.method,
      this.path,
      coloredCode(this.res.statusCode),
      `(${this.ip})`,
    );
  }

  kill(err) {
    this.error(createError(500, err.message));
  }
}

function newRes(req, res) {
  return new Res(req, res);
}

export { newRes };
