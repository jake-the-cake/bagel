import { Router } from "express";
import { createError } from "../control/err.js";

const webRouter = Router();

webRouter.get("/", (req, res) => {
  res.out.html("index", { err: createError(401) });
});

export default webRouter;
