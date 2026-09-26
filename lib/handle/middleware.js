import functions from "./functions.js";
import { useEnv } from "../util/env.js";
import { errorUtil } from "../util/index.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { initContext } from "../core/context.js";

function contextSetup(req, res, next) {
  const context = initContext(req, res);
  try {
    context.init();
  } catch (error) {
    const status = error.status || DEFAULT_STATUS;
    functions.checkIsApi(req.path)
      ? res.status(status).json({ error })
      : res.status(status).render("error", { error });
    console.log(functions.formatResponseLine(req, error.status));
    return;
  }
  next();
}

function errorApp405(_, res, next) {
  const { method, path } = res.context.reqDetails;
  const error = () => res.context.res.flag(errorUtil.useError("getOnlyApp405"));
  method !== "GET" && !path.startsWith(useEnv("API_PATH")) && error();
  next();
}

function error404(_, res) {
  res.context.res.kill(errorUtil.useError("general404"));
}

export default { contextSetup, error404, errorApp405 };
