import { control } from "../control/index.js";
import { newResponse } from "./res.js";

class Req {
  constructor(req, res) {
    res.isApi = this.checkApi(req);
    res.out = newResponse(req, res);
    req.control = control.crudController(res.out);
  }

  isApi(contentType, accept, path) {
    return (
      contentType.includes("application/json") ||
      accept.includes("application/json") ||
      path.startsWith("/api")
    );
  }

  checkApi(req) {
    return this.isApi(
      req.get("content-type") || "",
      req.get("accept") || "",
      req.get("path") || "",
    );
  }
}

function newReq(req, res) {
  new Req(req, res);
}

function reqMiddleware(req, res, next) {
  newReq(req, res);
  next();
}

export { reqMiddleware };
