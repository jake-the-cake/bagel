import { Router } from "express";
import { errRes, newRes } from "../control/res.js";

const appRouter = Router();

appRouter.all("/", (req, res) => {
  newRes(req, res).html(200, "index", { data: "data" });
});

export default appRouter;
