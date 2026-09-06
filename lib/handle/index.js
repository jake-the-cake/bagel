import {
  createError,
  handleError,
  errorMiddleware404,
  errorMiddleware405,
} from "./err.js";
import { newResponse } from "./res.js";
import { reqMiddleware } from "./req.js";

const handle = {
  createError,
  handleError,
  newResponse,
};

const middleware = {
  reqMiddleware,
  errorMiddleware404,
  errorMiddleware405,
};

export { handle, middleware };
