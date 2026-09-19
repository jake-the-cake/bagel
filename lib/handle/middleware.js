import { initRequest } from "./req.js";
import { initResponse } from "./res.js";
import { initController } from "./control.js";
import { initDatabase } from "./data.js";
import { useEnv } from "../util/env.js";
import { initContext } from "../objects/objects.js";
import { errorUtil } from "../util/index.js";

function contextSetup(req, res, next) {
  const context = initContext(req);
  res.isApi = req.path.startsWith(useEnv("API_PATH"));
  try {
    context.req = initRequest(context);
    context.auth = null;
    context.control = initController(context);
    context.validate = null;
    context.data = initDatabase(context);
    context.res = initResponse(res, context);
  } catch (err) {
    return initResponse(res, context).kill(err);
  }

  req.input = {
    req: context.req,
    auth: context.auth,
    control: context.control,
    validate: context.validate,
  };

  res.output = {
    data: context.data,
    res: context.res,
  };
  next();
}

function errorApp405(req, _, next) {
  const { method, path } = req.input.req.details;
  const error = () => req.input.req.flag(errorUtil.useError("getOnlyApp405"));
  method !== "GET" && !path.startsWith(useEnv("API_PATH")) && error();
  next();
}

function error404(_, res) {
  res.output.res.kill(errorUtil.useError("general404"));
}

export default { contextSetup, error404, errorApp405 };
