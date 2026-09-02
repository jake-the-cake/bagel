import { createError, errorMiddleware404, errorMiddleware405 } from "./err.js";
import { newRes } from "./res.js";
import { reqMiddleware } from "./req.js";

const handle = {
  createError,
  errorMiddleware404,
  errorMiddleware405,
  newRes,
  reqMiddleware,
};

export default handle;
