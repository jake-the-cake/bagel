import path from "path";
import Express from "express";
import handle from "../handle/index.js";
import { useErrorMessage } from "../util/err.js";
import { DEFAULT_STATUS, STATUS_CODES } from "../util/codes.js";

const appRouter = Express.Router();

appRouter.get("/", (req, res) => {
  res.out.html("index");
});

appRouter.get("/error/:status", (req, res) => {
  const status = Number(req.params.status);
  res.out.error(handle.createError(status === "NaN" ? DEFAULT_STATUS : status));
});

appRouter.use((req, res) => {
  res.redirect(301, `/app?path=${req.path}`);
});

export default appRouter;
