import Express from "express";

const apiRouter = Express.Router();

apiRouter.all("/tools", async (_, res) => {
  res.Allow("GET");
  res.Json(200, { data: await res.Read("tools").all() });
});

apiRouter.all("/tools/create", async (_, res) => {
  res.Allow("POST");
  res.Admin("tools:create:one");
  const result = await res.Create("tools").save();
  res.Json(201, { added: result.length !== 1 ? result : result[0] });
});

export default apiRouter;
