import Express from "express";
import { handle } from "../handle/index.js";

const apiRouter = Express.Router();

apiRouter.use((req, res, next) => {
  res.isApi = true;
  req.check405 = (...accepted) => {
    if (!accepted.includes(req.method)) {
      res.out.kill(handle.createError(405));
      return false;
    }
    return true;
  };
  next();
});

apiRouter.all("/tools", async (req, res) => {
  if (!req.check405("GET")) return;
  const data = await req.control.read("tools").all();
  res.out.json(200, { data });
});

apiRouter.all("/tools/create", async (req, res) => {
  if (!req.check405("POST")) return;
  const body = req.body;
  const data = await req.control.create(body).save();
  res.out.json(201, { added: data });
});

export default apiRouter;
