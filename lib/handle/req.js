import { newRes } from "./res.js";

class Req {
  constructor(req, res) {
    res.isApi = this.isApi(
      req.get("content-type") || "",
      req.get("accept") || "",
    );
    res.out = newRes(req, res);
  }

  isApi(contentType, accept) {
    return (
      contentType.includes("application/json") ||
      accept.includes("application/json")
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
