import { Router } from "express";

const apiRouter = Router();

apiRouter.use((req, res, next) => {
  next();
});

apiRouter.use("/tools", (req, res) => {
  res.out.json(200, { data: "data" });
});

export default apiRouter;
