import Express from "express";

const apiRouter = Express.Router();

apiRouter.all("/tools", async (_, res) => {
  return res.Json(200, { data: await res.Read("tools").all() });
});

apiRouter.all("/tools/create", async (req, res) => {
  return res.Json(201, { added: await res.Create("tools", req.body).save() });
});

export default apiRouter;
