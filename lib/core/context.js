import { getDb } from "../data/db.js";
import { checkIsApi, checkIsCallback } from "../handle/functions.js";
import { errorUtil } from "../util/index.js";

class Context {
  constructor(req, res) {
    this.reqIn = req;
    this.resOut = res;
    this.isApi = checkIsApi(req.path);
    this.reqDetails = contextDetails(req);
    this.db = getDb();
    this.resOut.context = this;
  }

  new(label, callback) {
    if (!checkIsCallback(callback)) throw errorUtil.useError("notCallback500");
    this[label] = callback;
  }
}

function initContext(req, res) {
  return new Context(req, res);
}

function contextDetails(req) {
  return {
    path: req.path,
    method: req.method,
    ip: req.ip,
    start: Number(new Date()),
  };
}

export { initContext };
