import { initRequest } from "./req.js";
import { initResponse } from "./res.js";
import { initController } from "./control.js";
import { initDatabase } from "./data.js";
import { initAuth } from "./auth.js";
import { initSchema } from "./schema.js";
import functions from "./functions.js";
import middleware from "./middleware.js";

const handle = {
  initRequest,
  initResponse,
  initController,
  initDatabase,
  initAuth,
  initSchema,
};

export { handle, middleware, functions };
