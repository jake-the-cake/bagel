import Express from "express";
import { handle } from "../handle/index.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { useEnv } from "../util/env.js";

const appRouter = Express.Router();

appRouter.get("/", (_, res) => {
  res.out.html("index");
});

appRouter.get("/error/:status", (req, res) => {
  res.out.error(handle.handleError(req.params.status));
});

appRouter.use((req, res) => {
  res.redirect(301, useAppRedirect(req.path));
});

export default appRouter;

/** Helper function to generate app redirect URLs */
function useAppRedirect(path) {
  return useEnv("APP_PATH", "/app") + useEnv("APP_REDIRECT", "?path=") + path;
}
