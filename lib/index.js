import Express from "express";
import cors from "cors";
import appRouter from "./route/app.js";
import apiRouter from "./route/api.js";
import webRouter from "./route/web.js";
import { reqMiddleware } from "./control/req.js";
import { createError, errHtml, errJson } from "./control/err.js";
import { newRes } from "./control/res.js";
import { useError } from "./util/err.js";

/** Create the application */
const app = Express();
const PORT = process.env.PORT || 3000;
const API_PATH = "/api";

/** View engine setup */
app.set("view engine", "ejs");
app.set("views", "views");

/** Middleware */
app.use(cors());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));
app.use(Express.static("public"));
app.use(reqMiddleware);

/** 405 Handler */
app.use((req, res, next) => {
  // const error = createError(
  //   405,
  //   "This application only accepts 'GET' requests.",
  // );
  req.method !== "GET" &&
    !req.path.startsWith(API_PATH) &&
    res.out.error(useError("getOnly405"));
  next();
});

/** API Routes */
app.use(API_PATH, apiRouter);

/** Web/App Routes */
app.use("/", webRouter);
app.use("/app", appRouter);

/** 404 handler */
app.use((req, res) => {
  res.out.error(useError("general404"));
});

/** Start the server */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
