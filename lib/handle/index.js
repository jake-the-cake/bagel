import { initRequest } from "./components/req.js";
import { initResponse } from "./components/res.js";
import { initController } from "./components/control.js";
import { initAuth } from "./components/auth.js";
import { initSchema } from "./components/schema.js";
import functions from "./functions.js";
import middleware from "./middleware.js";

const handle = {
  initRequest,
  initResponse,
  initController,
  initAuth,
  initSchema,
};

export { handle, middleware, functions };
