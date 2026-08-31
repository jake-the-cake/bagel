import { DEFAULT_STATUS } from "./codes.js";
import { createError, errHtml, errJson } from "./err.js";

class Res {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  error(status, err = null) {
    this.res.isApi
      ? this.json(status, createError(status, err))
      : this.html(status, createError(status, message));
  }

  json(status, data) {
    try {
      this.res.status(status).json(data);
    } catch (err) {
      throw err;
    }
  }

  html(status, path, data = {}) {
    this.res.status(status).render(path, data);
  }
}

function newRes(req, res) {
  return new Res(req, res);
}

function errRes(req, res, status, message = null) {
  return new Res(req, res, createError(status).customMessage(message));
}

export { newRes, errRes };
