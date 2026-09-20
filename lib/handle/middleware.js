import { initRequest } from "./req.js";
import { initResponse } from "./res.js";
import { initController } from "./control.js";
import { initDatabase } from "./data.js";
import { useEnv } from "../util/env.js";
import { errorUtil } from "../util/index.js";
import { DEFAULT_STATUS } from "../util/codes.js";
import { checkIsApi } from "./functions.js";
import { initContext } from "../core/context.js";

function contextSetup(req, res, next) {
  try {
    const context = initContext(req, res);
    context.req = initRequest(context);
    context.auth = null;
    context.control = initController(context);
    context.validate = null;
    context.data = initDatabase(context);
    context.res = initResponse(context);
  } catch (error) {
    return checkIsApi(req.path)
      ? res.status(error.status || DEFAULT_STATUS).json({ error })
      : res.status(error.status).render("error", { error });
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
