import Express from "express";

const apiRouter = Express.Router();

apiRouter.use((req, res, next) => {
  next();
});

apiRouter.use("/tools", (req, res) => {
  res.out.json(200, { data: "data" });
});

export default apiRouter;
