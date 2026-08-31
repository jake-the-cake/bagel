import { DEFAULT_STATUS } from "./codes.js";
import { createError, errHtml, errJson } from "./err.js";

class Res {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  error(status, message = null) {
    this[this.res.isApi ? "json" : "html"](
      status,
      createError(status, message),
    );
  }

  json(status, data) {
    try {
      this.res.status(status).json(data);
    } catch (err) {
      throw err;
    }
  }

  html(path, data = {}) {
    this.res.status(200).render(path, data);
  }
}

function newRes(req, res) {
  return new Res(req, res);
}

export { newRes };
