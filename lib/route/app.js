import Express from "express";
import { errorUtil } from "../util/index.js";
import { useEnv } from "../util/env.js";

const appRouter = Express.Router();

appRouter.get("/", (_, res) => {
  res.Html("app");
});

appRouter.get("/error/:code", (req, res) => {
  const code = Number(req.params.code);
  const error = errorUtil.defaultError(code !== "NaN" ? code : 500);
  res.Html("error", { error });
});

appRouter.use((req, res) => {
  res.redirect(301, useAppRedirect(req.path));
});

export default appRouter;

/** Helper function to generate app redirect URLs */
function useAppRedirect(path) {
  return useEnv("APP_PATH", "/app") + useEnv("APP_REDIRECT", "?path=") + path;
}
