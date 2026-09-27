import Express from "express";

const apiRouter = Express.Router();

apiRouter.all("/auth/register", async (_, res) => {
  res.Allow("POST");
  res.Require("email", "password");
  const data = await res.Create("users").save();
  res.Json(201, { data });
});

apiRouter.all("/auth/login", async (_, res) => {
  res.Allow("POST");
  res.Require("email", "password");
  const result = await res.Login();
  res.Json(200, { data: result });
});

apiRouter.all("/users/all", async (_, res) => {
  res.Allow("GET");
  const data = await res.Read("users").all();
  res.Json(200, { data });
});

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
