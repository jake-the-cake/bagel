import Express from "express";
import { handle } from "../handle/index.js";

const apiRouter = Express.Router();

apiRouter.use((req, res, next) => {
  res.isApi = true;
  next();
});

apiRouter.all("/tools", async (req, res) => {
  if (!["GET"].includes(req.method)) {
    return res.out.kill(handle.createError(405));
  }
  const tools = await req.control.read("tools").all();
  res.out.json(200, { data: await tools });
});

export default apiRouter;
