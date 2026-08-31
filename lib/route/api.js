import { Router } from "express";

const apiRouter = Router();

apiRouter.use((req, res, next) => {
  next();
});

apiRouter.use("/tools", (req, res) => {
  req.end.json({ data: "data" }, 200);
});

export default apiRouter;
