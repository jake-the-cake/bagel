import { functions, handle } from "../handle/index.js";
import { initHealth } from "./health.js";
import { errorUtil } from "../util/index.js";

class Context {
  constructor(req, res) {
    this.health = initHealth();
    this.reqIn = req;
    this.resOut = res;
    this.reqDetails = contextDetails(req);
    this.isApi = functions.checkIsApi(req.path);
    this.resOut.context = this;
  }

  init() {
    this.new("req", handle.initRequest);
    this.new("control", handle.initController);
    this.new("auth", handle.initAuth);
    this.new("schema", handle.initSchema);
    this.new("res", handle.initResponse);
  }

  new(label, callback) {
    if (!functions.checkIsCallback(callback)) {
      throw errorUtil.useError("notCallback500");
    }
    this[label] = callback(this);
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
    body: req.body || {},
    headers: req.headers || {},
  };
}

export { initContext };
