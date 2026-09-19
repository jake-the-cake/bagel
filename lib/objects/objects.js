import { noContext } from "../core/context.js";
import { getDb } from "../data/db.js";

function contextDetails(req) {
  return {
    path: req.path,
    method: req.method,
    ip: req.ip,
    start: Number(new Date()),
  };
}

function initContext(req) {
  return {
    ...noContext,
    details: contextDetails(req),
    db: getDb(),
  };
}

export { contextDetails, initContext };
