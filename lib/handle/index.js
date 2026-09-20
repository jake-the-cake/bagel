import { initRequest } from "./req.js";
import { initResponse } from "./res.js";
import { initController } from "./control.js";
import { initDatabase } from "./data.js";
import middleware from "./middleware.js";

const handle = {
  initRequest,
  initResponse,
  initController,
  initDatabase,
};

export { handle, middleware };
