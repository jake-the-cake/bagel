import Express from "express";
import { useEnv } from "../util/env.js";

const appRouter = Express.Router();

appRouter.get("/", (_, res) => {
  res.output.res.html("app", { layoutName: "app", title: "Application" });
});

appRouter.use((req, res) => {
  res.redirect(301, useAppRedirect(req.path));
});

export default appRouter;

/** Helper function to generate app redirect URLs */
function useAppRedirect(path) {
  return useEnv("APP_PATH", "/app") + useEnv("APP_REDIRECT", "?path=") + path;
}
