import { Router } from "express";

const appRouter = Router();

appRouter.all("/", (req, res) => {
  res.out.html("index", { data: "data" });
});

export default appRouter;
