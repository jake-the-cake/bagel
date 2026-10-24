import Express from "express";

const authRouter = Express.Router();

authRouter.all("/register/user", async (_, res) => {
  res.Allow("POST");
  res.Require("email", "password");
  const data = await res.Create("users").save();
  if (data) await res.Login();
  res.Json(201, { data });
});

authRouter.all("/register/company", async (_, res) => {
  res.Allow("POST");
  res.User();
  const data = await res.Create("companies").save();
  res.Json(201, { data });
});

authRouter.all("/login", async (_, res) => {
  res.Allow("POST");
  res.Require("email", "password");
  const result = await res.Login();
  res.Json(200, { data: result });
});

authRouter.all("/logout", async (_, res) => {
  res.Allow("POST");
  res.User();
  await res.Logout();
  res.Json(200, { data: "Logged out" });
});

authRouter.all("/switch", async (_, res) => {
  res.Allow("POST");
  res.User();
  res.Require("companyId");
  const companyUser = await res.Read("company_users").where({});
  res.Json(200, { data: "" });
});

authRouter.all("/session", async (_, res) => {
  res.Allow("GET");
  const session = await res.Session();
  res.Json(200, { data: session });
});

export default authRouter;
