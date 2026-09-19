import Express from "express";
import { errorUtil } from "../util/index.js";

const apiRouter = Express.Router();

apiRouter.use((req, res, next) => {
  req.check405 = (...accepted) => {
    if (!accepted.includes(req.method)) {
      res.output.res.kill(errorUtil.useError("general405"));
      return false;
    }
    return true;
  };
  next();
});

apiRouter.all("/tools", async (req, res) => {
  if (!req.check405("GET")) return;
  const data = await req.input.control.read("tools").all();
  res.output.res.json(200, { data });
});

apiRouter.all("/tools/create", async (req, res) => {
  if (!req.check405("POST")) return;
  const body = req.body;
  const data = await req.input.control.create(body).save();
  res.output.res.json(201, { added: data });
});

export default apiRouter;
