import Express from "express";
import authRouter from "./api/auth.js";

const apiRouter = Express.Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/user", authRouter);
apiRouter.use("/company", authRouter);
apiRouter.use("/employee", authRouter);
apiRouter.use("/service", authRouter);
apiRouter.use("/sales", authRouter);

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
