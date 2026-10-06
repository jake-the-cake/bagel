import Express from "express";

const authRouter = Express.Router();

authRouter.all("/register/user", async (_, res) => {
  res.Allow("POST");
  res.Require("email", "password");
  const data = await res.Create("users").save();
  res.Json(201, { data });
});

authRouter.all("/register/company", async (_, res) => {
  res.Allow("POST");
  // res.User();
  const data = await res.Create("companies").save();
  res.Json(201, { data });
});

authRouter.all("/auth/login", async (_, res) => {
  res.Allow("POST");
  res.Require("email", "password");
  const result = await res.Login();
  res.Json(200, { data: result });
});

authRouter.all("/auth/session", async (_, res) => {
  res.Allow("GET");
  const session = res.Session();
  res.Json(200, { data: session });
});

const apiRouter = Express.Router();
apiRouter.use("/auth", authRouter);

apiRouter.all("/users/all", async (_, res) => {
  res.Allow("GET");
  const data = await res.Read("users").all();
  res.Json(200, { data });
});

apiRouter.all("/companies/all", async (_, res) => {
  res.Allow("GET");
  const data = await res.Read("companies").all();
  res.Json(200, { data });
});

apiRouter.all("/companies/hire", async (_, res) => {
  res.Allow("POST");
  const data = await res.Create("company_users").save();
  res.Json(200, { data });
});

export default apiRouter;
