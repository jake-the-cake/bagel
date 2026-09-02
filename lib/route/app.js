import { Router } from "express";
import { createError } from "../handle/err.js";
import { useErrorMessage } from "../util/err.js";
import { DEFAULT_STATUS, STATUS_CODES } from "../util/codes.js";

const appRouter = Router();

appRouter.get("/", (req, res) => {
  res.out.html("index", { data: "data" });
});

appRouter.get("/error/:status", (req, res) => {
  const status = Number(req.params.status);
  const error = createError(status === "NaN" ? DEFAULT_STATUS : status);
  res.out.error(error);
});

// appRouter.use((req, res, next) => {});

export default appRouter;
