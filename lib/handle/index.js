import { initRequest } from "./req.js";
import { initResponse } from "./res.js";
import { initController } from "./control.js";
import middleware from "./middleware.js";

const handle = {
  initRequest,
  initResponse,
  initController,
};

export { handle, middleware };
